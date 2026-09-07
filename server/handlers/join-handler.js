const {
  createPlayer
} = require("../player");

const {
  createRoom,
  getRoom,
  addPlayerToRoom
} = require("../room");

// ランダムなルームIDを作成
function generateRoomId() {
  return Math.floor(
    1000 + Math.random() * 9000
  ).toString();
}

// プレイヤーをルームに追加する共通処理
function addPlayer(
  socket,
  name,
  roomId,
  context
) {
  const {
    sockets,
    playerRooms,
    broadcastToRoom
  } = context;

  const room = getRoom(roomId);

  if (!room) {
    socket.send(JSON.stringify({
      type: "error",
      message: "ルームが存在しません"
    }));

    return;

  }

  // 満員チェック
  if (room.players.length >= 4) {
    socket.send(JSON.stringify({
      type: "error",
      message: "このルームは満員です"
    }));

    return;

  }

  // プレイヤーを作成
  const player = createPlayer(name);
  const playerId = player.id;

  // Socketとプレイヤーを紐付け
  socket.playerId = playerId;

  sockets[playerId] = socket;
  playerRooms[playerId] = roomId;

  // プレイヤーをルームに追加
  addPlayerToRoom(
    roomId,
    playerId
  );

  console.log(
    "プレイヤーが参加しました:",
    player
  );

  return player;
}

// ルーム作成
function handleCreateRoom(
  socket,
  data,
  context
) {
  // プレイヤー名の確認
  if (
    typeof data.name !== "string" ||
    data.name.trim() === ""
  ) {
    socket.send(JSON.stringify({
      type: "error",
      message: "プレイヤー名を入力してください"
    }));

    return;

  }

  // すでにルームに参加しているか
  if (socket.playerId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "すでにルームに参加しています"
    }));

    return;

  }

  // すでに存在しないルームIDを作る
  let roomId;

  do {
    roomId = generateRoomId();
  } while (getRoom(roomId));

  // ルームを作成
  createRoom(roomId);

  // プレイヤーを追加
  const player = addPlayer(
    socket,
    data.name.trim(),
    roomId,
    context
  );

  if (!player) {
    return;
  }

  // 作成者にルーム情報を送信
  socket.send(JSON.stringify({
    type: "room_created",
    roomId: roomId,
    playerId: player.id,
    playerName: player.name
  }));

  // ルーム全員に通知
  context.broadcastToRoom(roomId, {
    type: "player_joined",
    player: player
  });

  console.log(
    "ルームを作成しました:",
    roomId
  );
}

// ルーム参加
function handleJoinRoom(
  socket,
  data,
  context
) {
  // プレイヤー名・ルームIDの確認
  if (
    typeof data.name !== "string" ||
    typeof data.roomId !== "string" ||
    data.name.trim() === "" ||
    data.roomId.trim() === ""
  ) {
    socket.send(JSON.stringify({
      type: "error",
      message: "プレイヤー名とルームIDを入力してください"
    }));

    return;

  }

  // すでにルームに参加しているか
  if (socket.playerId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "すでにルームに参加しています"
    }));

    return;

  }

  const roomId = data.roomId.trim();

  // ルームが存在するか確認
  const room = getRoom(roomId);

  if (!room) {
    socket.send(JSON.stringify({
      type: "error",
      message: "指定されたルームが存在しません"
    }));

    return;

  }

  // プレイヤーを追加
  const player = addPlayer(
    socket,
    data.name.trim(),
    roomId,
    context
  );

  if (!player) {
    return;
  }

  // 自分に参加情報を送信
  socket.send(JSON.stringify({
    type: "room_joined",
    roomId: roomId,
    playerId: player.id,
    playerName: player.name
  }));

  // ルーム全員に通知
  context.broadcastToRoom(roomId, {
    type: "player_joined",
    player: player
  });
}

module.exports = {
  handleCreateRoom,
  handleJoinRoom
};