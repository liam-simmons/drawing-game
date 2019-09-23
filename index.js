const express = require("express");
const app = express();
var server = require("http").createServer(app);
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 5000;

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

let messageId = 0;

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
      socket.emit("turnChange", { turn: PLAYER_LIST[turnId].id });
      socket.emit("wordUpdate", publicWord);
    }
    console.log("add socket list");
    SOCKET_LIST[id] = socket;
    console.log("push id to player list");
    PLAYER_LIST.push({ id, username });

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
    socket.on("chatMessage", data => {
      console.log("received message:", data);
      io.emit("chatMessage", {
        message: data.message,
        username,
        id: messageId
      });
      messageId++;
      if (data.message == word) {
        if (id !== PLAYER_LIST[turnId].id) {
          newTurn();
        }
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

      if (PLAYER_LIST.length === 1) {
        loopFunction && clearInterval(loopFunction);
        turnTimeout && clearTimeout(turnTimeout);

        io.emit("turnChange", { turn: -1 });
        io.emit("wordUpdate", "Waiting for players...");
        io.emit("reset-canvas");
      }
    });

    console.log("if player lengh = 2 start");
    PLAYER_LIST.length === 2 ? gameStart() : null;
  });
});

const gameStart = () => {
  console.log("game starting");
  turnId = 0;
  newWord();
  //SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", { turn: true });

  io.emit("turnChange", { turn: PLAYER_LIST[turnId].id });
};

const newTurn = () => {
  console.log("new tunr");
  /*PLAYER_LIST[turnId] &&
    SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", { turn: false });*/
  turnId = (turnId + 1) % PLAYER_LIST.length;
  newWord();
  //SOCKET_LIST[PLAYER_LIST[turnId].id].emit("turnChange", { turn: true });
  io.emit("turnChange", { turn: PLAYER_LIST[turnId].id });
  io.emit("reset-canvas");
};

const newWord = () => {
  console.log("new word");
  let sock; //sort this out

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
  console.log("setting public word");
  publicWord = "";
  for (let i = 0; i < word.length; i++) {
    publicWord = publicWord.concat("_");
  }
};

const revealLetter = sock => {
  console.log("revealing letter");
  let index = Math.floor(Math.random() * word.length);
  publicWord = replaceAt(publicWord, index, word[index]);
  sock && sock.broadcast.emit("wordUpdate", publicWord);
  console.log("revealing");

  //maybe make it so that it cant do the same letter? doesnt really matter though
};

//next is make a game engine in api c:

function replaceAt(string, index, replace) {
  console.log("replacinjg ");
  return string.substring(0, index) + replace + string.substring(index + 1);
}
