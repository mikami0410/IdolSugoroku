const {
  getRoom
} = require("../room");

const {
  createGameState
} = require("../game-state");

const {
  decideOrder
} = require("./order-handler");

const {
  getPlayer
} = require("../player");

// ゲーム開始処理
function handleStartGame({
  socket,
  playerRooms,
  broadcastToRoom
}) {
  // プレイヤーIDが存在しない場合は処理しない
  if (!socket.playerId) {
    return;
  }

  // プレイヤー情報を取得
  const playerId = socket.playerId;
  const roomId = playerRooms[playerId];
  const room = getRoom(roomId);

  // ルームが存在しない場合は処理しない
  if (!room) {
    return;
  }

  // 2人未満の場合はゲームを開始できない
  if (room.players.length < 2) {
    socket.send(JSON.stringify({
      type: "error",
      message: "ゲームを開始するには2人以上必要です"
    }));

    return;
  }

  // すでにゲームが開始されている場合は処理しない
  if (room.gameStarted || room.gameStarting) {
    return;
  }

  room.gameStarting = true;

  console.log(
    "ゲーム開始:",
    roomId
  );

  // サーバー内部で順番を自動決定
  broadcastToRoom(roomId, {
    type: "order_deciding"
  });

  decideOrder(room);

  // ゲーム開始
  room.gameStarted = true;
  room.gameStarting = false;

  // 最初のターンを設定
  room.currentTurn = room.turnOrder[0];

  // ゲーム状態を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "game_state",
    state: createGameState(room)
  });

  // 順番決定結果を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "order_decided",
    turnOrder: room.turnOrder
  });

  // 最初のターンを通知
  broadcastToRoom(roomId, {
    type: "turn_changed",
    playerId: room.currentTurn,
    playerName:
      getPlayer(room.currentTurn).name
  });
}

module.exports = {
  handleStartGame
};