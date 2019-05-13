const express = require("express");
const app = express();
var server = require("http").createServer(app);
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 3000;

//
const io = socketIO(server);

// Choose the port and start the server
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "client/build")));
// Anything that doesn't match the above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});
//io.listen();
//app.listen(PORT, () => console.log(`Listening on ${PORT}`));
//

let SOCKET_LIST = [];
let PLAYER_LIST = []; // figure out how to make this a constant
let nextId = 0;

const WORD_LIST = [
  "dog",
  "cat",
  "chicken",
  "marplot",
  "mouse",
  "song",
  "keyboard",
  "hug",
  "dress",
  "books",
  "texas",
  "poirot",
  "tiger",
  "lion",
  "owl",
  "penguin",
  "word",
  "wordgirl"
];
let word = "dog";
let publicWord = "___";
let loopFunction = null;
let turnTimeout = null;

let turnId = null;

io.on("connection", socket => {
  let username = "no name";
  const id = nextId;

  nextId++;

  socket.on("name", name => {
    //needs to make sure this only happens once..
    username = name;
    socket.broadcast.emit("user-connected", { username, id });
    SOCKET_LIST[id] = socket;
    PLAYER_LIST.push({ id, username });

    socket.on("drawInfo", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("drawInfo", data);
    });

    socket.on("reset-canvas", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("reset-canvas", data);
    });

    socket.on("chatMessage", data => {
      io.emit("chatMessage", { message: data.message, username });

      if (data.message == word) {
        if (id !== PLAYER_LIST[turnId].id) {
          newTurn();
        }
      }
    });

    socket.on("request-player-list", () => {
      socket.emit("player-list", PLAYER_LIST); //doesn't need to send ids here or anywhere tbh but its good for debugging
    });

    socket.on("disconnect", () => {
      io.emit("user-disconnected", { username, id });
      SOCKET_LIST[id] = null; //wish there were a better way
      PLAYER_LIST = PLAYER_LIST.filter(i => i.id !== id);

      if (PLAYER_LIST.length === 1) {
        loopFunction && clearInterval(loopFunction);
        turnTimeout && clearTimeout(turnTimeout);
        PLAYER_LIST[turnId] &&
          SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", {
            turn: false
          });
      }

      if (id === PLAYER_LIST[turnId]) newTurn();
    });

    PLAYER_LIST.length === 2 ? gameStart() : null;
  });
});

const gameStart = () => {
  turnId = 0;
  newWord();
  SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", { turn: true });
};

const newTurn = () => {
  PLAYER_LIST[turnId] &&
    SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", { turn: false });
  turnId = (turnId + 1) % PLAYER_LIST.length;
  newWord();
  SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", { turn: true });
  io.emit("reset-canvas");
};

const newWord = () => {
  let sock; //sort this hsit out

  PLAYER_LIST[turnId]
    ? (sock = SOCKET_LIST[PLAYER_LIST[turnId].id])
    : (sock = 5);

  if (sock === 5) {
    return;
  }

  const wordId = Math.floor(Math.random() * WORD_LIST.length);
  word = WORD_LIST[wordId];
  setPublicWord();
  loopFunction && clearInterval(loopFunction);
  loopFunction = setInterval(revealLetter, 80000, sock);
  turnTimeout && clearTimeout(turnTimeout);
  turnTimeout = setTimeout(newTurn, 180000);

  console.log("the word is ", word);

  sock && sock.broadcast.emit("wordUpdate", publicWord);
  sock && sock.emit("wordUpdate", word);
};

const setPublicWord = () => {
  publicWord = "";
  for (let i = 0; i < word.length; i++) {
    publicWord = publicWord.concat("_");
  }
};

const revealLetter = sock => {
  let index = Math.floor(Math.random() * word.length);
  publicWord = replaceAt(publicWord, index, word[index]);
  sock && sock.broadcast.emit("wordUpdate", publicWord);
  console.log("revealing");

  //maybe make it so that it cant do the same letter? doesnt really matter though
};

//next is make a game engine in api c:

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}
