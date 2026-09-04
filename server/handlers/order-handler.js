const {
  getPlayer
} = require("../player");

const {
  getRoom
} = require("../room");

const {
  spinOrderRoulette,
  resolveOrder
} = require("../order-system");

const {
  createGameState
} = require("../game-state");

// サーバー内部で順番を自動決定する
function decideOrder(room) {
  const results = {};

  // 全プレイヤーのルーレット結果を決める
  for (const playerId of room.players) {
    const result = spinOrderRoulette(playerId);

    results[playerId] = result.value;

    console.log(
      "順番決定ルーレット:",
      playerId,
      result.value
    );
  }

  // 順番を決定
  const resultList = room.players.map((playerId) => {
    return {
      playerId: playerId,
      value: results[playerId]
    };
  });

  const orderResult = resolveOrder(resultList);

  // 同じ数字が出た場合
  if (!orderResult.finished) {
    console.log(
      "順番決定で同じ数字が出ました。再抽選します。"
    );

    return decideOrder(room);
  }

  room.turnOrder = orderResult.turnOrder;

  console.log(
    "決定したターン順:",
    room.turnOrder
  );

  return room.turnOrder;
}

module.exports = {
  decideOrder
};