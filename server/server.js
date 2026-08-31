const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const sockets = {};
const playerRooms = {};

const {
  getRoom
} = require("./room");

const {
  handleDisconnect
} = require("./handlers/disconnect-handler");

const {
  handleMessage
} = require("./handlers/message-handler");

console.log("WebSocketサーバーを起動しました");

// 指定したルームに接続している全プレイヤーへメッセージを送信
function broadcastToRoom(roomId, message) {
  const room = getRoom(roomId);

  if (!room) {
    return;
  }

  for (const playerId of room.players) {
    const socket = sockets[playerId];

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
}

server.on("connection", (socket) => {
  console.log("クライアントが接続しました");

  socket.on("message", (message) => {
    handleMessage({
      socket,
      message,
      sockets,
      playerRooms,
      broadcastToRoom
    });
  });

  socket.on("close", () => {
    handleDisconnect({
      socket,
      sockets,
      playerRooms,
      broadcastToRoom
    });
  });
});