const {
  handleJoin
} = require("./join-handler");

const {
  handleStartGame
} = require("./game-handler");

const {
  handleOrderRoll
} = require("./order-handler");

const {
  handleSpinRoulette
} = require("./roulette-handler");

// WebSocketメッセージ処理
function handleMessage({
  socket,
  message,
  sockets,
  playerRooms,
  broadcastToRoom
}) {
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

  // ルーム参加
  if (data.type === "join") {
    handleJoin(socket, data, {
      sockets,
      playerRooms,
      broadcastToRoom
    });
  }

  // ゲーム開始
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

  // ルーレット
  if (data.type === "spin_roulette") {
    handleSpinRoulette({
      socket,
      playerRooms,
      broadcastToRoom
    });
  }
}

module.exports = {
  handleMessage
};