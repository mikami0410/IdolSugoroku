const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const sockets = {};
const playerRooms = {};

const {
  getPlayer,
  removePlayer
} = require("./player");

const {
  getRoom,
  removeRoom,
  removePlayerFromRoom,
  getRooms
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

// 現在のゲーム状態を取得
function createGameState(room) {
  return {
    gameStarted: room.gameStarted,
    currentTurn: room.currentTurn,
    turnOrder: room.turnOrder,
    players: room.players.map((playerId) => getPlayer(playerId))
  };
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
    const playerId = socket.playerId;

    if (!playerId) {
      return;
    }

    const roomId = playerRooms[playerId];
    const room = getRoom(roomId);

    console.log("プレイヤーが切断しました:", playerId);

    delete sockets[playerId];
    removePlayer(playerId);
    delete playerRooms[playerId];

    if (!room) {
      return;
    }

    //プレイヤーをルームから削除
    removePlayerFromRoom(roomId, playerId);

    if (room.gameStarted && room.players.length === 1) {
      room.gameStarted = false;
      room.currentTurn = null;
      room.turnOrder = [];

      broadcastToRoom(roomId, {
        type: "game_finished",
        reason: "player_left"
      });
    }

    if (room.players.length === 0) {
      removeRoom(roomId);
    }

    if (room.currentTurn === playerId) {
      const currentIndex = room.turnOrder.indexOf(playerId);

      let nextPlayerId = null;

      if (currentIndex !== -1 && room.turnOrder.length > 1) {
        nextPlayerId =
          room.turnOrder[(currentIndex + 1) % room.turnOrder.length];
      }

      room.currentTurn = nextPlayerId;

      if (nextPlayerId) {
        broadcastToRoom(roomId, {
          type: "turn_changed",
          playerId: nextPlayerId,
          playerName: getPlayer(nextPlayerId).name
        });
      }
    }

    room.turnOrder = room.turnOrder.filter(
      (id) => id !== playerId
    );

    broadcastToRoom(roomId, {
      type: "player_left",
      playerId: playerId
    });

    console.log("現在のルーム:", getRooms());
  });
});