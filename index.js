const express = require("express");
const fs = require("fs");
const { replaceAt, maskWord, isCloseGuess } = require("./utils");
const app = express();
const server = require("http").createServer(app);
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 5000;

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
app.use(express.static(path.join(__dirname, "client/build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

let SOCKET_LIST = [];
let PLAYER_LIST = [];
let nextId = 0;

let messageId = 0;

const timerLength = 80;

let turnTimer = 0;
let turnTimerInterval;

const WORD_LIST = [];
fs.readFile("words.txt", (err, data) => {
  if (err) throw err;

  const text = data.toString();
  let currentWord = "";

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") {
      WORD_LIST.push(currentWord);
      currentWord = "";
    } else if (text[i] !== "\r") {
      currentWord = currentWord + text[i];
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

  socket.on("name", name => {
    username = name;
    socket.broadcast.emit("user-connected", { username, id });
    socket.emit("yourId", id);
    emitCurrentStateToSocket(socket);
    SOCKET_LIST[id] = socket;
    PLAYER_LIST.push({ id, username, guessedCorrectly: false });
    socket.emit("player-list", PLAYER_LIST);

    socket.on("drawInfo", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("drawInfo", data);
    });

    socket.on("fillInfo", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("fillInfo", data);
    });

    socket.on("reset-canvas", data => {
      if (id === PLAYER_LIST[turnId].id)
        socket.broadcast.emit("reset-canvas", data);
    });

    socket.on("chat-message", data => {
      if (socket.hasGuessedWord) {
        SOCKET_LIST.forEach(function(s) {
          if (s && s.hasGuessedWord) {
            s.emit("chat-message", {
              message: data.message,
              username,
              id: messageId,
            });
            messageId++;
          }
        });
      } else if (data.message.toLowerCase() == word.toLowerCase()) {
        playerGuessedWord(id, username);
      } else if (isCloseGuess(data.message, word)) {
        io.emit("chat-message", {
          message: data.message,
          username,
          id: messageId,
        });
        messageId++;

        socket.emit("chat-message", {
          message: "So close! You're one character away.",
          username: "System",
          id: messageId,
        });
        messageId++;
      } else {
        io.emit("chat-message", {
          message: data.message,
          username,
          id: messageId,
        });
        messageId++;
      }
    });

    socket.on("request-current-state", () => {
      emitCurrentStateToSocket(socket);
    });

    socket.on("disconnect",() => {
      if (
        PLAYER_LIST.length != 2 &&
        PLAYER_LIST[turnId] &&
        id === PLAYER_LIST[turnId].id
      )
        newTurn();

      io.emit("user-disconnected", { username, id });
      SOCKET_LIST[id] = null;
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

    PLAYER_LIST.length === 2 ? gameStart() : null;
  });
});

const emitCurrentStateToSocket = socket => {
  if (turnTimeout && PLAYER_LIST[turnId]) {
    socket.emit("turn-change", { turn: PLAYER_LIST[turnId].id });
    socket.emit("word-update", publicWord);
    socket.emit("set-timer", { time: turnTimer });
    socket.emit("reset-canvas");
  }
};

const gameStart = () => {
  turnId = 0;
  setupRound();
};

const newTurn = () => {
  turnId = (turnId + 1) % PLAYER_LIST.length;
  setupRound();
};

const setupRound = () => {
  io.emit("set-timer", { time: timerLength });
  turnTimer = timerLength;
  turnTimerInterval && clearInterval(turnTimerInterval);
  turnTimerInterval = setInterval(() => {
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
  let sock;
  PLAYER_LIST[turnId] && (sock = SOCKET_LIST[PLAYER_LIST[turnId].id]);

  const wordId = Math.floor(Math.random() * WORD_LIST.length);
  word = WORD_LIST[wordId];
  setPublicWord();
  loopFunction && clearInterval(loopFunction);
  loopFunction = setInterval(revealLetter, 80000, sock);
  turnTimeout && clearTimeout(turnTimeout);
  turnTimeout = setTimeout(newTurn, 180000);

  sock && sock.broadcast.emit("word-update", publicWord);
  sock && sock.emit("word-update", word);

  for (let i = 0; i < PLAYER_LIST.length; i++) {
    PLAYER_LIST[i].guessedCorrectly = false;
    SOCKET_LIST[PLAYER_LIST[i].id].hasGuessedWord = false;
  }
  if (PLAYER_LIST[turnId]) {
    PLAYER_LIST[turnId].guessedCorrectly = true;
    SOCKET_LIST[PLAYER_LIST[turnId].id].hasGuessedWord = true;
  }
};

const setPublicWord = () => {
  publicWord = maskWord(word);
};

const revealLetter = sock => {
  let index = Math.floor(Math.random() * word.length);
  publicWord = replaceAt(publicWord, index, word[index]);
  sock && sock.broadcast.emit("word-update", publicWord);
};

const playerGuessedWord = (id, username) => {
  for (let i = 0; i < PLAYER_LIST.length; i++) {
    if (id === PLAYER_LIST[i].id) {
      PLAYER_LIST[i].guessedCorrectly = true;
      SOCKET_LIST[PLAYER_LIST[i].id].hasGuessedWord = true;

      io.emit("player-guessed-word", {
        username,
        playerId: id,
        id: messageId,
      });
      messageId++;

      break;
    }
  }
  checkAllGuessed();
};

const checkAllGuessed = () => {
  let allGuessedCorrectly = true;

  for (let i = 0; i < PLAYER_LIST.length; i++) {
    if (!PLAYER_LIST[i].guessedCorrectly) allGuessedCorrectly = false;
  }
  if (allGuessedCorrectly) {
    io.emit("everyone-guessed-correctly", {
      word,
      id: messageId,
    });
    messageId++;

    newTurn();
  }
};
