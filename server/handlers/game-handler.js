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
  if (!socket.playerId) {
    return;
  }

  const playerId = socket.playerId;
  const roomId = playerRooms[playerId];
  const room = getRoom(roomId);

  if (!room) {
    return;
  }

  if (room.players.length < 2) {
    socket.send(JSON.stringify({
      type: "error",
      message: "ゲームを開始するには2人以上必要です"
    }));

    return;
  }

  if (room.gameStarted || room.gameStarting) {
    return;
  }

  room.gameStarting = true;

  console.log(
    "ゲーム開始:",
    roomId
  );

  room.orderRolls = {};
  room.orderRollResults = {};
  room.orderRollGroups = [];
  room.orderRollCurrentGroup = [];
  room.orderRollRerolling = false;

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

  broadcastToRoom(roomId, {
    type: "order_roll_start"
  });
}

module.exports = {
  handleStartGame
};