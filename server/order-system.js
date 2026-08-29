// ゲーム開始時のプレイヤーの順番を決定

// 順番決定ルーレットを回す
function rollOrder(playerId) {
  const value = Math.floor(Math.random() * 6) + 1;

  return {
    playerId: playerId,
    value: value
  };
}


// プレイヤーの結果から順位グループを作る
//
// 例:
// Player 1 → 6
// Player 2 → 3
// Player 3 → 3
//
// ↓
//
// [
//   [1],
//   [2, 3]
// ]
function createOrderGroups(results) {
  const sortedResults = [...results].sort(
    (a, b) => b.value - a.value
  );

  const groups = [];

  let currentGroup = [];
  let currentValue = null;

  for (const result of sortedResults) {
    if (currentValue !== result.value) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      currentGroup = [];
      currentValue = result.value;
    }

    currentGroup.push(result.playerId);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

// 振り直しが必要なプレイヤーを取得
function getDuplicatePlayers(group, results) {
  const groupValues = group.map(
    (playerId) => results[playerId]
  );

  const valueCount = {};

  for (const value of groupValues) {
    valueCount[value] = (valueCount[value] || 0) + 1;
  }

  const duplicatePlayers = group.filter(
    (playerId) => valueCount[results[playerId]] > 1
  );

  return duplicatePlayers;
}

// 全順位グループから振り直し対象を取得
//
// 例:
//
// groups = [
//   [1],
//   [2, 3],
//   [4, 5]
// ]
//
// results = {
//   1: 6,
//   2: 3,
//   3: 3,
//   4: 2,
//   5: 5
// }
//
// この場合、[2, 3]だけが振り直し対象
function getAllDuplicatePlayers(groups, results) {
  const duplicatePlayers = [];

  for (const group of groups) {
    if (group.length <= 1) {
      continue;
    }

    const duplicates = getDuplicatePlayers(
      group,
      results
    );

    duplicatePlayers.push(...duplicates);
  }

  return duplicatePlayers;
}

// 最終的なターン順を作成
function createTurnOrder(groups, results) {
  const turnOrder = [];

  for (const group of groups) {
    const groupResults = group.map((playerId) => {
      return {
        playerId: playerId,
        value: results[playerId]
      };
    });

    groupResults.sort(
      (a, b) => b.value - a.value
    );

    for (const result of groupResults) {
      turnOrder.push(result.playerId);
    }
  }

  return turnOrder;
}

// 順番決定を完了する
function resolveOrder(results, groups = null) {
  if (groups === null) {
    groups = createOrderGroups(results);
  }

  const resultMap = {};

  for (const result of results) {
    resultMap[result.playerId] = result.value;
  }

  const duplicatePlayers = getAllDuplicatePlayers(
    groups,
    resultMap
  );

  if (duplicatePlayers.length > 0) {
    return {
      finished: false,                       // 順番決定が完了したかどうか
      duplicatePlayers: duplicatePlayers,    // 振り直しが必要なプレイヤー
      groups: groups,                        // 現在の順位グループ
      turnOrder: null                        // 最終的なターン順
    };
  }

  const turnOrder = createTurnOrder(
    groups,
    resultMap
  );

  return {
    finished: true,
    duplicatePlayers: [],
    groups: groups,
    turnOrder: turnOrder
  };
}

module.exports = {
  rollOrder,
  createOrderGroups,
  getDuplicatePlayers,
  getAllDuplicatePlayers,
  createTurnOrder,
  resolveOrder
};