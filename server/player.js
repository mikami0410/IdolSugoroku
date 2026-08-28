let nextPlayerId = 1;

const players = {};

//プレイヤーを作成
function createPlayer(name) {
  const playerId = nextPlayerId;
  nextPlayerId++;

  const player = {
    id: playerId,
    name: name,
    fans: 0,
    position: 1,
    finished: false,
    skills: {
      vocal: 0,
      dance: 0,
      visual: 0
    }
  }

  players[playerId] = player;

  return player;
}

//プレイヤーを取得
function getPlayer(playerId) {
  return players[playerId];
}

//プレイヤーを削除
function removePlayer(playerId) {
  delete players[playerId]
}

//全プレイヤーを取得
function getPlayers() {
  return players;
}


module.exports = {
  createPlayer,
  getPlayer,
  removePlayer,
  getPlayers
};