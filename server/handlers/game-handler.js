const {
  getPlayer
} = require("../player");

const {
  getRoom
} = require("../room");

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

  // 順番決定用のデータを初期化
  room.orderRolls = {};
  room.orderRollResults = {};
  room.orderRollGroups = [];
  room.orderRollCurrentGroup = [];
  room.orderRollRerolling = false;

  // 現在のゲーム状態を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "game_state",
    state: {
      gameStarted: room.gameStarted,
      currentTurn: room.currentTurn,
      turnOrder: room.turnOrder,
      players: room.players.map(
        (playerId) => getPlayer(playerId)
      )
    }
  });

  // 順番決定ルーレットの開始を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "order_roll_start"
  });
}

module.exports = {
  handleStartGame
};