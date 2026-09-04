const {
  getRandomEventByType,
  getEventDetails,
  applyEvent,
  createRanking,
  getBoardCell,
  getNextTurnPlayer
} = require("../game-system");

const {
  getPlayer
} = require("../player");

const {
  getRoom
} = require("../room");

const {
  createGameState
} = require("../game-state");

// ゲームルーレット処理
function handleSpinRoulette({
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

  // すでにゴールしている場合は処理しない
  if (player.finished) {
    socket.send(JSON.stringify({
      type: "error",
      message: "すでにゴールしています"
    }));

    return;
  }

  // 自分のターンでない場合は処理しない
  if (room.currentTurn !== playerId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "あなたのターンではありません"
    }));

    return;
  }

  // ルーレットを回す
  const rouletteValue =
    Math.floor(Math.random() * 6) + 1;

  // プレイヤーを移動
  player.position += rouletteValue;

  // 30マス以上ならゴール
  if (player.position >= 30) {
    player.position = 30;
    player.finished = true;
  }

  // 全員がゴールしたか確認
  const allFinished = room.players.every(
    (id) => getPlayer(id).finished
  );

  // 全員ゴールした場合はゲーム終了
  if (allFinished) {
    const ranking = createRanking(room);

    broadcastToRoom(roomId, {
      type: "game_finished",
      ranking: ranking
    });

    return;
  }

  // 現在位置のマスを取得
  const cell = getBoardCell(
    player.position
  );

  // マスが存在しない場合
  if (!cell) {
    console.log(
      "マスが見つかりません:",
      player.position
    );

    socket.send(JSON.stringify({
      type: "error",
      message: "移動先のマスが見つかりません"
    }));

    return;
  }

  let event = null;
  let eventDetails = null;

  // 通常のイベントマスの場合はイベントを発生させる
  if (
    cell.type >= 1 &&
    cell.type <= 8
  ) {
    event = getRandomEventByType(
      cell.type
    );

    if (event) {
      applyEvent(
        player,
        event
      );

      eventDetails = getEventDetails(event);
    }
  }
  console.log(
    "イベント:",
    event
  );

  console.log(
    "イベント後:",
    player
  );

  console.log(
    "止まったマス:",
    cell
  );

  // マスイベントを全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "cell_event",
    playerId: playerId,
    playerName: player.name,
    cell: cell,
    event: {
      name: event,
      title: eventDetails ? eventDetails.title : null,
      description: eventDetails ? eventDetails.description : null
    }
  });

  console.log(
    "プレイヤー",
    playerId,
    "のルーレットの結果:",
    rouletteValue
  );

  console.log(
    "プレイヤー",
    playerId,
    "の現在位置:",
    player.position
  );

  // ルーレット結果を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "roulette_result",
    playerId: playerId,
    playerName: player.name,
    value: rouletteValue
  });

  // プレイヤー移動を全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "player_moved",
    playerId: playerId,
    playerName: player.name,
    position: player.position
  });

  // 次のターンを設定
  room.currentTurn =
    getNextTurnPlayer(room, playerId);

  console.log(
    "次のターン:",
    room.currentTurn
  );

  // 次のターンを全プレイヤーに通知
  broadcastToRoom(roomId, {
    type: "turn_changed",
    playerId: room.currentTurn,
    playerName:
      getPlayer(
        room.currentTurn
      ).name
  });

  // 最新のゲーム状態を通知
  broadcastToRoom(roomId, {
    type: "game_state",
    state: createGameState(room)
  });
}

module.exports = {
  handleSpinRoulette
};