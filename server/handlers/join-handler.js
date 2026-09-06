const {
  createPlayer
} = require("../player");

const {
  createRoom,
  getRoom,
  addPlayerToRoom
} = require("../room");

// ルーム参加処理
// socket：クライアントとのWebSocket接続
// data：プレイヤー名・ルームIDなどの参加情報
// context：サーバーで共有するデータ・関数
function handleJoin(socket, data, context) {
  const {
    sockets,
    playerRooms,
    broadcastToRoom
  } = context;

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

  // ルームを取得
  let room = getRoom(data.roomId);

  // ルームが存在しなければ作成
  if (!room) {
    room = createRoom(data.roomId);
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
  const player = createPlayer(data.name);
  const playerId = player.id;

  // Socketとプレイヤーを紐付け
  socket.playerId = playerId;

  sockets[playerId] = socket;
  playerRooms[playerId] = data.roomId;

  // プレイヤーをルームに追加
  addPlayerToRoom(
    data.roomId,
    playerId
  );

  console.log("プレイヤーが参加しました:", player);

  // 自分にプレイヤーIDを送信
  socket.send(JSON.stringify({
    type: "player_info",
    playerId: playerId
  }));

  // ルーム全員に通知
  broadcastToRoom(data.roomId, {
    type: "player_joined",
    player: player
  });
}

module.exports = {
  handleJoin
};