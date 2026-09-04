const rooms = {};

// ルームを作成
function createRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      players: [],                  // ルームに参加しているプレイヤーID
      currentTurn: null,            // 現在のターンのプレイヤーID
      turnOrder: [],                // ゲーム中のターン順
      auditionPlayerId: null,       // オーディション中のプレイヤー
      auditionRound: 0,             // 現在何回目か
      auditionRolls: [],            // これまでの出目
      gameStarted: false,           // ゲームが開始しているか
      gameStarting: false           // ゲーム開始処理中か
    };
  }

  return rooms[roomId];
}

// ルームを取得
function getRoom(roomId) {
  return rooms[roomId];
}

// ルームを削除
function removeRoom(roomId) {
  delete rooms[roomId];
}

// プレイヤーをルームに追加
function addPlayerToRoom(roomId, playerId) {
  const room = getRoom(roomId);

  if (!room) {
    return;
  }

  if (room.players.includes(playerId)) {
    return;
  }

  room.players.push(playerId);
}

// プレイヤーをルームから削除
function removePlayerFromRoom(roomId, playerId) {
  const room = getRoom(roomId);

  if (!room) {
    return;
  }

  room.players = room.players.filter(
    (id) => id !== playerId
  );
}

// すべてのルームを取得
function getRooms() {
  return rooms;
}

module.exports = {
  createRoom,
  getRoom,
  removeRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getRooms
};