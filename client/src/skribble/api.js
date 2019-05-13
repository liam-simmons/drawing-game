import io from "socket.io-client";
//const socket = openSocket("http://localhost:3231");
const socket = io();

function subscribeToDrawing(callback) {
  socket.on("drawInfo", data => {
    callback(data);
  });
}

export const subscribeToResetCanvas = callback => {
  socket.on("reset-canvas", () => {
    callback();
  });
};

export const subscribeToTurns = callback => {
  socket.on("turnChange", data => {
    callback(data);
  });
};

function subscribeToChat(callback) {
  console.log("subbing");
  socket.on("chatMessage", data => {
    console.log("new chat");
    callback({ ...data, type: "message" });
  });
  socket.on("user-connected", data => {
    callback({ username: data.username, type: "joinerMessage" });
  });
  socket.on("user-disconnected", data => {
    callback({ username: data.username, type: "leaverMessage" });
  });
}

export const subscribeToWords = callback => {
  socket.on("wordUpdate", word => callback(word));
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
};

function sendDrawInfo(x, y, lastX, lastY, colour, radius) {
  socket.emit("drawInfo", { x, y, lastX, lastY, colour, radius });
}

export const sendResetCanvas = () => {
  socket.emit("reset-canvas");
};

function sendChatMessage(username, message) {
  socket.emit("chatMessage", { username, message });
}

export const sendName = name => {
  socket.emit("name", name);
};

export { sendDrawInfo, subscribeToDrawing, subscribeToChat, sendChatMessage };
