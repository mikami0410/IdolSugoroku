const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const sockets = {};
const playerRooms = {};

const {
  getRoom
} = require("./room");

const {
  handleJoin
} = require("./handlers/join-handler");

const {
  handleStartGame
} = require("./handlers/game-handler");

const {
  handleOrderRoll
} = require("./handlers/order-handler");

const {
  handleSpinRoulette
} = require("./handlers/roulette-handler");

const {
  handleDisconnect
} = require("./handlers/disconnect-handler");

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
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      socket.send(JSON.stringify({
        type: "error",
        message: "不正なデータです"
      }));

      return;
    }

    console.log("受信したデータ:", data);

    if (typeof data.type !== "string") {
      socket.send(JSON.stringify({
        type: "error",
        message: "メッセージのtypeが指定されていません"
      }));

      return;
    }

    //ルーム参加
    if (data.type === "join") {
      handleJoin(socket, data, {
        sockets,
        playerRooms,
        broadcastToRoom
      });
    }

    //ゲーム開始
    if (data.type === "start_game") {
      handleStartGame({
        socket,
        playerRooms,
        broadcastToRoom
      });
    }

    // 順番決定
    if (data.type === "order_roll") {
      handleOrderRoll({
        socket,
        playerRooms,
        broadcastToRoom
      });
    }

    //ルーレット
    if (data.type === "spin_roulette") {
      handleSpinRoulette({
        socket,
        playerRooms,
        broadcastToRoom
      });
    }
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