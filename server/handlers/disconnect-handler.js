const {
  getPlayer,
  removePlayer
} = require("../player");

const {
  getRoom,
  removeRoom,
  removePlayerFromRoom,
  getRooms
} = require("../room");

// プレイヤー切断処理
function handleDisconnect({
  socket,
  sockets,
  playerRooms,
  broadcastToRoom
}) {
  const playerId = socket.playerId;

  // プレイヤーIDが存在しない場合は処理しない
  if (!playerId) {
    return;
  }

  // ルーム情報を取得
  const roomId = playerRooms[playerId];
  const room = getRoom(roomId);

  console.log(
    "プレイヤーが切断しました:",
    playerId
  );

  // プレイヤー情報を削除
  delete sockets[playerId];
  removePlayer(playerId);
  delete playerRooms[playerId];

  // ルームが存在しない場合は処理しない
  if (!room) {
    return;
  }

  // プレイヤーをルームから削除
  removePlayerFromRoom(
    roomId,
    playerId
  );

  // ゲーム中にプレイヤーが退出した場合
  if (
    room.gameStarted &&
    room.players.length === 1
  ) {
    room.gameStarted = false;
    room.currentTurn = null;
    room.turnOrder = [];

    broadcastToRoom(roomId, {
      type: "game_finished",
      reason: "player_left"
    });
  }

  // ルームに誰もいなくなった場合
  if (room.players.length === 0) {
    removeRoom(roomId);
  }

  // 現在のターンプレイヤーが切断した場合
  if (room.currentTurn === playerId) {
    const currentIndex =
      room.turnOrder.indexOf(playerId);

    let nextPlayerId = null;

    if (
      currentIndex !== -1 &&
      room.turnOrder.length > 1
    ) {
      nextPlayerId =
        room.turnOrder[
        (currentIndex + 1) %
        room.turnOrder.length
        ];
    }

    room.currentTurn =
      nextPlayerId;

    if (nextPlayerId) {
      broadcastToRoom(roomId, {
        type: "turn_changed",
        playerId: nextPlayerId,
        playerName:
          getPlayer(nextPlayerId).name
      });
    }
  }

  // 切断したプレイヤーをターン順から削除
  room.turnOrder =
    room.turnOrder.filter(
      (id) => id !== playerId
    );

  // プレイヤー退出を通知
  broadcastToRoom(roomId, {
    type: "player_left",
    playerId: playerId
  });

  console.log(
    "現在のルーム:",
    getRooms()
  );
}

module.exports = {
  handleDisconnect
};