const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const sockets = {};
const playerRooms = {};

const {
  board,
  getRandomEventByType,
  applyEvent
} = require("./game-system");

const {
  createPlayer,
  getPlayer,
  removePlayer,
  getPlayers
} = require("./player");

const {
  createRoom,
  getRoom,
  removeRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getRooms
} = require("./room");

const {
  rollOrder,
  resolveOrder
} = require("./order-system");

const {
  handleJoin
} = require("./handlers/join-handler");

const {
  handleStartGame
} = require("./handlers/game-handler");

console.log("WebSocketサーバーを起動しました");

// 指定したルームに接続している全プレイヤーへメッセージを送信
function broadcastToRoom(roomId, message) {
  const room = getRoom(roomId);

  if (!room) {
    return;
  }

  for (const playerId of room.players) {
    const socket = sockets[playerId];

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
}

// 現在のゲーム状態を取得
function createGameState(room) {
  return {
    gameStarted: room.gameStarted,
    currentTurn: room.currentTurn,
    turnOrder: room.turnOrder,
    players: room.players.map((playerId) => getPlayer(playerId))
  };
}

// プレイヤーの現在位置に対応するマスの情報を取得
function getBoardCell(position) {
  return board.find((cell) => cell.number === position);
}

// ルーム内のプレイヤーをファン数の多い順に並べてランキングを作成
function createRanking(room) {
  const ranking = room.players.map((playerId) => {
    const player = getPlayer(playerId);

    return {
      playerId: player.id,
      playerName: player.name,
      fans: player.fans
    };
  });

  ranking.sort((a, b) => b.fans - a.fans);

  ranking.forEach((player, index) => {
    player.rank = index + 1;
  });

  return ranking;
}

server.on("connection", (socket) => {
  console.log("クライアントが接続しました");

  socket.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      socket.send(JSON.stringify({
        type: "error",
        message: "不正なデータです"
      }));

      return;
    }

    console.log("受信したデータ:", data);

    if (typeof data.type !== "string") {
      socket.send(JSON.stringify({
        type: "error",
        message: "メッセージのtypeが指定されていません"
      }));

      return;
    }

    //ルーム参加
    if (data.type === "join") {
      handleJoin(socket, data, {
        sockets,
        playerRooms,
        broadcastToRoom
      });
    }

    //ゲーム開始
    if (data.type === "start_game") {
      handleStartGame({
        socket,
        playerRooms,
        broadcastToRoom
      });
    }

    // 順番決定
    if (data.type === "order_roll") {

      if (!socket.playerId) {
        return;
      }

      const playerId = socket.playerId;
      const player = getPlayer(playerId);
      const roomId = playerRooms[playerId];
      const room = getRoom(roomId);

      if (!room) {
        return;
      }

      if (!room.gameStarting) {
        return;
      }

      if (room.orderRollRerolling) {
        if (!room.orderRollCurrentGroup.includes(playerId)) {
          return;
        }
      }

      if (room.orderRolls[playerId] !== undefined) {
        return;
      }

      // ルーレットを回す
      const result = rollOrder(playerId);
      const dice = result.value;

      room.orderRolls[playerId] = dice;
      room.orderRollResults[playerId] = dice;

      console.log(
        "Player",
        playerId,
        "の順番決定ルーレット:",
        dice
      );

      // ルーレット結果を全員に通知
      broadcastToRoom(roomId, {
        type: "order_roll_result",
        playerId: playerId,
        playerName: player.name,
        value: dice
      });

      // 必要なプレイヤーが全員回したか確認
      const requiredPlayers =
        room.orderRollRerolling
          ? room.orderRollCurrentGroup
          : room.players;

      const allRolled =
        requiredPlayers.every(
          (id) => room.orderRolls[id] !== undefined
        );

      if (!allRolled) {
        return;
      }

      console.log("全員のルーレットが終了しました");

      // 結果を作る
      const results = room.players.map((id) => {
        return {
          playerId: id,
          value: room.orderRollResults[id]
        };
      });

      // resolveOrderに判定してもらう
      const orderResult = resolveOrder(
        results,
        room.orderRollRerolling
          ? room.orderRollGroups
          : null
      );

      console.log(
        "順番決定の判定結果:",
        orderResult
      );

      if (!room.orderRollRerolling) {
        room.orderRollGroups = orderResult.groups;
      }

      // 回し直しが必要
      if (!orderResult.finished) {

        const duplicatePlayers =
          orderResult.duplicatePlayers;

        console.log(
          "回し直し対象:",
          duplicatePlayers
        );

        room.orderRollRerolling = true;

        room.orderRollCurrentGroup = duplicatePlayers;

        // 回し直すプレイヤーの現在の結果を削除
        for (const duplicatePlayerId of duplicatePlayers) {
          delete room.orderRolls[duplicatePlayerId];
        }

        // 回し直し対象者に通知
        broadcastToRoom(roomId, {
          type: "order_roll_start",
          playerIds: duplicatePlayers
        });

        return;
      }

      // 回し直し不要 → 順番決定完了
      room.turnOrder =
        orderResult.turnOrder;

      room.orderRollRerolling = false;
      room.orderRollCurrentGroup = [];

      room.currentTurn =
        room.turnOrder[0];

      room.gameStarted = true;
      room.gameStarting = false;


      console.log(
        "順番決定結果:",
        room.turnOrder
      );

      broadcastToRoom(roomId, {
        type: "game_state",
        state: createGameState(room)
      });


      broadcastToRoom(roomId, {
        type: "order_decided",
        turnOrder: room.turnOrder
      });


      broadcastToRoom(roomId, {
        type: "turn_changed",
        playerId: room.currentTurn,
        playerName: getPlayer(room.currentTurn).name
      });
    }

    //ルーレット
    if (data.type === "spin_roulette") {

      if (!socket.playerId) {
        return;
      }

      const playerId = socket.playerId;
      const player = getPlayer(playerId);

      const roomId = playerRooms[playerId];
      const room = getRoom(roomId);

      if (!room) {
        return;
      }

      if (player.finished) {
        socket.send(JSON.stringify({
          type: "error",
          message: "すでにゴールしています"
        }));

        return;
      }


      if (room.currentTurn !== playerId) {

        socket.send(JSON.stringify({
          type: "error",
          message: "あなたのターンではありません"
        }));

        return;
      }

      const dice = Math.floor(Math.random() * 6) + 1;

      player.position += dice;

      if (player.position >= 30) {
        player.position = 30;
        player.finished = true;
      }

      const allFinished = room.players.every(
        (id) => getPlayer(id).finished
      );

      if (allFinished) {
        const ranking = createRanking(room);

        broadcastToRoom(roomId, {
          type: "game_finished",
          ranking: ranking
        });

        return;
      }

      const cell = getBoardCell(player.position);

      if (!cell) {
        console.log("マスが見つかりません:", player.position);

        socket.send(JSON.stringify({
          type: "error",
          message: "移動先のマスが見つかりません"
        }));

        return;
      }

      let event = null;

      if (cell.type >= 1 && cell.type <= 7) {
        event = getRandomEventByType(cell.type);

        console.log("イベント前:", player);

        if (event) {
          applyEvent(player, event);
        }
      }

      console.log("イベント:", event);
      console.log("イベント後:", player);


      console.log(
        "止まったマス:",
        cell
      );

      broadcastToRoom(roomId, {
        type: "cell_event",
        playerId: playerId,
        playerName: player.name,
        cell: cell,
        event: event
      });

      console.log(
        "プレイヤー",
        playerId,
        "のルーレットの結果:",
        dice
      );

      console.log(
        "プレイヤー",
        playerId,
        "の現在位置:",
        player.position
      );

      broadcastToRoom(roomId, {
        type: "roulette_result",
        playerId: playerId,
        playerName: player.name,
        value: dice
      });


      broadcastToRoom(roomId, {
        type: "player_moved",
        playerId: playerId,
        playerName: player.name,
        position: player.position
      });


      const currentIndex =
        room.turnOrder.indexOf(playerId);

      let nextIndex =
        (currentIndex + 1) % room.turnOrder.length;

      while (
        getPlayer(room.turnOrder[nextIndex]).finished
      ) {
        nextIndex =
          (nextIndex + 1) % room.turnOrder.length;
      }

      room.currentTurn =
        room.turnOrder[nextIndex];

      console.log(
        "次のターン:",
        room.currentTurn
      );

      broadcastToRoom(roomId, {
        type: "turn_changed",
        playerId: room.currentTurn,
        playerName: getPlayer(room.currentTurn).name
      });

      broadcastToRoom(roomId, {
        type: "game_state",
        state: createGameState(room)
      });

    }
  });

  socket.on("close", () => {
    const playerId = socket.playerId;

    if (!playerId) {
      return;
    }

    const roomId = playerRooms[playerId];
    const room = getRoom(roomId);

    console.log("プレイヤーが切断しました:", playerId);

    delete sockets[playerId];
    removePlayer(playerId);
    delete playerRooms[playerId];

    if (!room) {
      return;
    }

    //プレイヤーをルームから削除
    removePlayerFromRoom(roomId, playerId);

    if (room.gameStarted && room.players.length === 1) {
      room.gameStarted = false;
      room.currentTurn = null;
      room.turnOrder = [];

      broadcastToRoom(roomId, {
        type: "game_finished",
        reason: "player_left"
      });
    }

    if (room.players.length === 0) {
      removeRoom(roomId);
    }

    if (room.currentTurn === playerId) {
      const currentIndex = room.turnOrder.indexOf(playerId);

      let nextPlayerId = null;

      if (currentIndex !== -1 && room.turnOrder.length > 1) {
        nextPlayerId =
          room.turnOrder[(currentIndex + 1) % room.turnOrder.length];
      }

      room.currentTurn = nextPlayerId;

      if (nextPlayerId) {
        broadcastToRoom(roomId, {
          type: "turn_changed",
          playerId: nextPlayerId,
          playerName: getPlayer(nextPlayerId).name
        });
      }
    }

    room.turnOrder = room.turnOrder.filter(
      (id) => id !== playerId
    );

    broadcastToRoom(roomId, {
      type: "player_left",
      playerId: playerId
    });

    console.log("現在のルーム:", getRooms());
  });
});
