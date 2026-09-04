const {
  getPlayer
} = require("../player");

const {
  getRoom
} = require("../room");

const {
  calculateAuditionFans,
  getNextTurnPlayer
} = require("../game-system");

const {
  createGameState
} = require("../game-state");

// オーディションのルーレット処理
function handleAuditionRoll({
  socket,
  playerRooms,
  broadcastToRoom
}) {
  // プレイヤーIDが存在しない場合は処理しない
  if (!socket.playerId) {
    return;
  }

  const playerId = socket.playerId;
  const player = getPlayer(playerId);

  const roomId = playerRooms[playerId];
  const room = getRoom(roomId);

  // ルームが存在しない場合は処理しない
  if (!room) {
    return;
  }

  // オーディション中のプレイヤーでない場合
  if (room.auditionPlayerId !== playerId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "現在オーディション中ではありません"
    }));

    return;
  }

  // 3回終了している場合
  if (room.auditionRound >= 3) {
    return;
  }

  // ルーレットを回す
  const rouletteValue =
    Math.floor(Math.random() * 6) + 1;

  // 出目を保存
  room.auditionRolls.push(rouletteValue);

  // 回数を増やす
  room.auditionRound++;

  console.log(
    "オーディションルーレット:",
    player.name,
    room.auditionRound + "回目",
    rouletteValue
  );

  // ルーレット結果を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "audition_roll_result",
    playerId: playerId,
    playerName: player.name,
    round: room.auditionRound,
    value: rouletteValue
  });

  // 3回目ならオーディション終了
  if (room.auditionRound === 3) {
    console.log(
      "オーディション3回終了:",
      room.auditionRolls
    );

    // オーディションのファン数を計算
    const auditionResult =
      calculateAuditionFans(
        player,
        room.auditionRolls
      );

    console.log(
      "オーディション結果:",
      auditionResult
    );

    player.fans += auditionResult.total;

    broadcastToRoom(roomId, {
      type: "audition_result",
      playerId: playerId,
      playerName: player.name,
      rolls: room.auditionRolls,
      result: auditionResult,
      fans: player.fans
    });

    // オーディション終了
    room.auditionPlayerId = null;
    room.auditionRound = 0;
    room.auditionRolls = [];

    // 次のターンを設定
    room.currentTurn =
      getNextTurnPlayer(room, playerId);

    console.log(
      "次のターン:",
      room.currentTurn
    );

    // 次のターンを全プレイヤーに通知
    broadcastToRoom(roomId, {
      type: "turn_changed",
      playerId: room.currentTurn,
      playerName:
        getPlayer(
          room.currentTurn
        ).name
    });

    // 最新のゲーム状態を通知
    broadcastToRoom(roomId, {
      type: "game_state",
      state: createGameState(room)
    });

    return;
  }
}

module.exports = {
  handleAuditionRoll
};