const {
  getPlayer
} = require("../player");

const {
  getRoom
} = require("../room");

const {
  rollOrder,
  resolveOrder
} = require("../order-system");

const {
  createGameState
} = require("../game-state");

// 順番決定ルーレット処理
function handleOrderRoll({
  socket,
  playerRooms,
  broadcastToRoom
}) {
  // プレイヤーIDが存在しない場合は処理しない
  if (!socket.playerId) {
    return;
  }

  // プレイヤー情報とルーム情報を取得
  const playerId = socket.playerId;
  const player = getPlayer(playerId);
  const roomId = playerRooms[playerId];
  const room = getRoom(roomId);

  // ルームが存在しない場合は処理しない
  if (!room) {
    return;
  }

  // ゲーム開始処理中でない場合は処理しない
  if (!room.gameStarting) {
    return;
  }

  // 回し直し中の場合、対象プレイヤー以外は処理しない
  if (
    room.orderRollRerolling &&
    !room.orderRollCurrentGroup.includes(playerId)
  ) {
    return;
  }

  // すでにルーレットを回している場合は処理しない
  if (room.orderRolls[playerId] !== undefined) {
    return;
  }

  // 順番決定ルーレットを回す
  const result = rollOrder(playerId);
  const dice = result.value;

  // ルーレット結果を保存
  room.orderRolls[playerId] = dice;
  room.orderRollResults[playerId] = dice;

  console.log(
    "Player",
    playerId,
    "の順番決定ルーレット:",
    dice
  );

  // ルーレット結果を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "order_roll_result",
    playerId: playerId,
    playerName: player.name,
    value: dice
  });

  // 今回ルーレットを回す必要があるプレイヤーを取得
  const requiredPlayers =
    room.orderRollRerolling
      ? room.orderRollCurrentGroup
      : room.players;

  // 必要なプレイヤーが全員ルーレットを回したか確認
  const allRolled =
    requiredPlayers.every(
      (id) => room.orderRolls[id] !== undefined
    );

  // まだ全員回していない場合はここで終了
  if (!allRolled) {
    return;
  }

  console.log(
    "全員のルーレットが終了しました"
  );

  // 順番決定に使用する結果を作成
  const results = room.players.map((id) => {
    return {
      playerId: id,
      value: room.orderRollResults[id]
    };
  });

  // 順番決定の判定
  const orderResult = resolveOrder(
    results,
    room.orderRollRerolling
      ? room.orderRollGroups
      : null
  );

  console.log(
    "順番決定の判定結果:",
    orderResult
  );

  // 初回の順番決定結果を保存
  if (!room.orderRollRerolling) {
    room.orderRollGroups = orderResult.groups;
  }


  // 同じ数字が出た場合
  if (!orderResult.finished) {
    const duplicatePlayers =
      orderResult.duplicatePlayers;

    console.log(
      "回し直し対象:",
      duplicatePlayers
    );

    // 回し直し状態にする
    room.orderRollRerolling = true;

    room.orderRollCurrentGroup =
      duplicatePlayers;

    // 回し直すプレイヤーの結果を削除
    for (const duplicatePlayerId of duplicatePlayers) {
      delete room.orderRolls[duplicatePlayerId];
    }

    // 回し直し対象のプレイヤーに通知
    broadcastToRoom(roomId, {
      type: "order_roll_start",
      playerIds: duplicatePlayers
    });

    return;
  }

  // 順番決定完了
  room.turnOrder =
    orderResult.turnOrder;

  room.orderRollRerolling = false;
  room.orderRollCurrentGroup = [];

  // 最初のターンを設定
  room.currentTurn =
    room.turnOrder[0];

  // ゲーム開始
  room.gameStarted = true;
  room.gameStarting = false;

  console.log(
    "順番決定結果:",
    room.turnOrder
  );

  // ゲーム状態を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "game_state",
    state: createGameState(room)
  });

  // 順番決定結果を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "order_decided",
    turnOrder:
      room.turnOrder
  });

  // 最初のターンを通知
  broadcastToRoom(roomId, {
    type: "turn_changed",
    playerId:
      room.currentTurn,
    playerName:
      getPlayer(room.currentTurn).name
  });
}

module.exports = {
  handleOrderRoll
};