let nextPlayerId = 1;

const players = {};

// プレイヤーを作成
function createPlayer(name) {
  const playerId = nextPlayerId;
  nextPlayerId++;

  const player = {
    id: playerId,       // プレイヤーID
    name: name,         // 名前
    fans: 0,            // ファン数
    position: 1,        // 現在地
    finished: false,    // ゴールしているか
    skills: {           // スキル
      vocal: 0,         // 歌
      dance: 0,         // ダンス
      visual: 0         // ビジュアル
    }
  }

  players[playerId] = player;

  return player;
}

// プレイヤーを取得
function getPlayer(playerId) {
  return players[playerId];
}

// プレイヤーを削除
function removePlayer(playerId) {
  delete players[playerId]
}

// 全プレイヤーを取得
function getPlayers() {
  return players;
}


module.exports = {
  createPlayer,
  getPlayer,
  removePlayer,
  getPlayers
};