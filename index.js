const express = require("express");
const fs = require("fs");
const app = express();
var server = require("http").createServer(app);
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 5000;

//
const io = socketIO(server);

// choose the port and start the server
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
// serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "client/build")));
// anything that doesn't match the above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});
//io.listen();
//app.listen(PORT, () => console.log(`Listening on ${PORT}`));
//

let SOCKET_LIST = [];
let PLAYER_LIST = []; // figure out how to make this a constant
let nextId = 0;

let messageId = 0;

const timerLength = 80;

let turnTimer = 0;
let turnTimerInterval;

//setting up word list
const WORD_LIST = [];
fs.readFile("words.txt", (err, data) => {
  if (err) throw err;

  console.log(data.toString());
  const text = data.toString();

  let currentWord = "";

  for (i = 0; i < text.length; i++) {
    if (text[i] === "\n") {
      for (let j = 0; j < currentWord.length; j++) {
        console.log(j, currentWord[j]);
      }
      WORD_LIST.push(currentWord);
      currentWord = "";
    } else if (text[i] !== "\r") {
      currentWord = currentWord + text[i];
      //console.log("cuerrentword", currentWord);
    }
  }
});

let word = "";
let publicWord = "";
let loopFunction = null;
let turnTimeout = null;

let turnId = null;

io.on("connection", socket => {
  let username = "Unknown";
  socket.hasGuessedWord = false;
  const id = nextId;

  nextId++;
  console.log("connection");

  socket.on("name", name => {
    console.log("name");
    //needs to make sure this only happens once..
    username = name;
    console.log("emit connected");
    socket.broadcast.emit("user-connected", { username, id });
    console.log("emit their id");
    socket.emit("yourId", id);
    if (turnTimeout && PLAYER_LIST[turnId]) {
      socket.emit("turn-change", { turn: PLAYER_LIST[turnId].id });
      socket.emit("word-update", publicWord);
    }
    console.log("add socket list");
    SOCKET_LIST[id] = socket;
    console.log("push id to player list");
    PLAYER_LIST.push({ id, username, guessedCorrectly: false });

    console.log("SOCKET_LIST.length", SOCKET_LIST.length);
    console.log("drawinfo making");
    socket.on("drawInfo", data => {
      console.log("drawinfo");
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("drawInfo", data);
    });

    console.log("fill making");
    socket.on("fillInfo", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("fillInfo", data);
    });

    console.log("reset making");
    socket.on("reset-canvas", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("reset-canvas", data);
    });

    console.log("chat making");
    socket.on("chat-message", data => {
      console.log("received message:", data);
      console.log(word.length, data.message.length);
      if (socket.hasGuessedWord) {
        SOCKET_LIST.forEach(function(socket) {
          if (socket && socket.hasGuessedWord) {
            socket.emit("chat-message", {
              message: data.message,
              username,
              id: messageId
            });
            messageId++;
          }
        });
      } else if (data.message.toLowerCase() == word.toLowerCase()) {
        playerGuessedWord(id, username);
        console.log("YES GUESSED");
        //newTurn();
      } else {
        io.emit("chat-message", {
          message: data.message,
          username,
          id: messageId
        });
        messageId++;
      }
    });

    console.log("request player list making");

    socket.on("request-player-list", () => {
      console.log("requesitng player list");
      socket.emit("player-list", PLAYER_LIST); //doesn't need to send ids here or anywhere tbh but its good for debugging
    });

    console.log("dc making");
    socket.on("disconnect", () => {
      console.log("disconecction", username);
      //there is a better way to write this.
      if (
        PLAYER_LIST.length != 2 &&
        PLAYER_LIST[turnId] &&
        id === PLAYER_LIST[turnId].id
      )
        newTurn();

      io.emit("user-disconnected", { username, id });
      SOCKET_LIST[id] = null; //wish there were a better way
      PLAYER_LIST = PLAYER_LIST.filter(i => i.id !== id);

      checkAllGuessed();

      if (PLAYER_LIST.length === 1) {
        loopFunction && clearInterval(loopFunction);
        turnTimeout && clearTimeout(turnTimeout);

        io.emit("turn-change", { turn: -1 });
        io.emit("word-update", "Waiting for players...");
        io.emit("reset-canvas");
      }
    });

    console.log("if player lengh = 2 start");
    PLAYER_LIST.length === 2 ? gameStart() : null;
  });
});

const gameStart = () => {
  turnId = 0;
  setupRound();
};

const newTurn = () => {
  turnId = (turnId + 1) % PLAYER_LIST.length;
  setupRound();
};

const setupRound = () => {
  io.emit("set-timer", { time: timerLength }); // change later
  turnTimer = timerLength;
  turnTimerInterval && clearInterval(turnTimerInterval);
  turnTimerInterval = setInterval(() => {
    console.log("turnTimer", turnTimer);
    turnTimer--;
    if (turnTimer <= 0) {
      clearInterval(turnTimerInterval);
      io.emit("timer-ran-out", { id: messageId, word });
      messageId++;
      newTurn();
    }
  }, 1000);

  newWord();
  if (PLAYER_LIST[turnId])
    io.emit("turn-change", { turn: PLAYER_LIST[turnId].id });
  io.emit("reset-canvas");
};

const newWord = () => {
  console.log("new word");
  let sock; //sort this out

  PLAYER_LIST[turnId] && (sock = SOCKET_LIST[PLAYER_LIST[turnId].id]);
  /*  : (sock = 5); //???

  if (sock === 5) {
    return;
  }*/

  const wordId = Math.floor(Math.random() * WORD_LIST.length);
  word = WORD_LIST[wordId];
  setPublicWord();
  loopFunction && clearInterval(loopFunction);
  loopFunction = setInterval(revealLetter, 80000, sock);
  turnTimeout && clearTimeout(turnTimeout);
  turnTimeout = setTimeout(newTurn, 180000);

  console.log("the word is ", word);

  sock && sock.broadcast.emit("word-update", publicWord);
  sock && sock.emit("word-update", word);

  for (let i = 0; i < PLAYER_LIST.length; i++) {
    PLAYER_LIST[i].guessedCorrectly = false;
    SOCKET_LIST[PLAYER_LIST[i].id].hasGuessedWord = false; //<-------------
  }
  if (PLAYER_LIST[turnId]) {
    PLAYER_LIST[turnId].guessedCorrectly = true;
    SOCKET_LIST[PLAYER_LIST[turnId].id].hasGuessedWord = true;
  }
  //console.log("EMITIGNG");
  //if (PLAYER_LIST[turnId].id === id) guessedCorrectly = true;
};

const setPublicWord = () => {
  console.log("setting public word");
  publicWord = "";
  for (let i = 0; i < word.length; i++) {
    if (word[i] === " ") publicWord = publicWord.concat(" ");
    else if (word[i] === "-") publicWord = publicWord.concat("-");
    else publicWord = publicWord.concat("_");
  }
};

const revealLetter = sock => {
  console.log("revealing letter");
  let index = Math.floor(Math.random() * word.length);
  publicWord = replaceAt(publicWord, index, word[index]);
  sock && sock.broadcast.emit("word-update", publicWord);
  console.log("revealing");

  //maybe make it so that it cant do the same letter? doesnt really matter though
};

const playerGuessedWord = (id, username) => {
  console.log("guessed correclty");
  /*PLAYER_LIST[thisPlayer].guessedCorrectly = true;
  id === PLAYER_LIST[turnId].id;*/

  for (let i = 0; i < PLAYER_LIST.length; i++) {
    if (id === PLAYER_LIST[i].id) {
      PLAYER_LIST[i].guessedCorrectly = true;
      SOCKET_LIST[PLAYER_LIST[i].id].hasGuessedWord = true;

      io.emit("player-guessed-word", {
        username,
        playerId: i,
        id: messageId
      });
      messageId++;

      break;
    }
  }
  checkAllGuessed();
};

checkAllGuessed = () => {
  let allGuessedCorrectly = true;

  for (let i = 0; i < PLAYER_LIST.length; i++) {
    if (!PLAYER_LIST[i].guessedCorrectly) allGuessedCorrectly = false;
    console.log("allGuessedCorrectly (in loop)", allGuessedCorrectly);
  }
  console.log("allGuessedCorrectly", allGuessedCorrectly);
  if (allGuessedCorrectly) {
    io.emit("everyone-guessed-correctly", {
      word,
      id: messageId
    });
    messageId++;

    newTurn();
  }
};

//next is make a game engine in api c:

function replaceAt(string, index, replace) {
  console.log("replacinjg ");
  return string.substring(0, index) + replace + string.substring(index + 1);
}
