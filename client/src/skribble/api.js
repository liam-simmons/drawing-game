import io from "socket.io-client";
const socket = io();

export function subscribeToMyId(callback) {
  socket.on("yourId", id => {
    callback(id);
  });
}

export function subscribeToDrawing(callback) {
  socket.on("drawInfo", data => {
    callback(data);
  });
}

export function subscribeToFilling(callback) {
  socket.on("fillInfo", data => {
    callback(data);
  });
}

export const subscribeToResetCanvas = callback => {
  socket.on("reset-canvas", () => {
    callback();
  });
};

export const subscribeToTurns = callback => {
  socket.on("turn-change", data => {
    callback(data);
  });
};

export function subscribeToChat(callback) {
  socket.on("chat-message", data => {
    callback({ ...data, type: "message" });
  });
  socket.on("user-connected", data => {
    callback({ username: data.username, type: "joinerMessage" });
  });
  socket.on("user-disconnected", data => {
    callback({ username: data.username, type: "leaverMessage" });
  });
  socket.on("player-guessed-word", data => {
    callback({ ...data, type: "guessedMessage" });
  });
  socket.on("everyone-guessed-correctly", data => {
    callback({ ...data, type: "everyoneGuessedMessage" });
  });
  socket.on("timer-ran-out", data => {
    callback({ ...data, type: "timerRanOutMessage" });
  });
}

export const subscribeToWords = callback => {
  socket.on("word-update", word => callback(word));
};

export const subscribeToPlayerList = callback => {
  socket.emit("request-player-list");

  socket.on("player-list", list => {
    callback({ list, type: "playerList" });
  });

  socket.on("user-connected", data => {
    callback({ username: data.username, id: data.id, type: "playerJoin" });
  });
  socket.on("user-disconnected", data => {
    callback({ username: data.username, id: data.id, type: "playerLeave" });
  });

  socket.on("player-guessed-word", data => {
    callback({ ...data, type: "playerGuessed" });
  });

  socket.on("turn-change", data => {
    callback({ ...data, type: "newTurn" });
  });
};

export const subscribeToTimer = callback => {
  socket.on("set-timer", data => {
    callback(data);
  });
};

export function sendDrawInfo(x, y, lastX, lastY, colour, radius) {
  socket.emit("drawInfo", { x, y, lastX, lastY, colour, radius });
}
export function sendFillInfo(x, y, colour) {
  socket.emit("fillInfo", { x, y, colour });
}
export const sendResetCanvas = () => {
  socket.emit("reset-canvas");
};
export const sendUndo = () => {
  socket.emit("undo");
};
export const sendRedo = () => {
  socket.emit("redo");
};

export function sendChatMessage(username, message) {
  socket.emit("chat-message", { username, message });
}

export const sendName = name => {
  socket.emit("name", name);
};
