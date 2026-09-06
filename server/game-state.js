const {
  getPlayer
} = require("./player");

// 現在のゲーム状態を作成
function createGameState(room) {
  return {
    gameStarted: room.gameStarted,
    currentTurn: room.currentTurn,
    turnOrder: room.turnOrder,
    players: room.players.map(
      (playerId) => getPlayer(playerId)
    )
  };
}

module.exports = {
  createGameState
};