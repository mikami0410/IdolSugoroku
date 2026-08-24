const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

let nextPlayerId = 1;

const players = {};
const rooms = {};
const sockets = {};
const playerRooms = {};
const {
  board,
  getRandomEventByType
} = require("./game-system");

console.log("WebSocketサーバーを起動しました");

// 指定したルームに接続している全プレイヤーへメッセージを送信
function broadcastToRoom(roomId, message) {
  const room = rooms[roomId];

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
    players: room.players.map((playerId) => players[playerId])
  };
}

// プレイヤーの現在位置に対応するマスの情報を取得
function getBoardCell(position) {
  return board.find((cell) => cell.position === position);
}

// ルーム内のプレイヤーをファン数の多い順に並べてランキングを作成
function createRanking(room) {
  const ranking = room.players.map((playerId) => {
    const player = players[playerId];

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
    const data = JSON.parse(message.toString());

    console.log("受信したデータ:", data);

    //ルーム参加
    if (data.type === "join") {
      const playerId = nextPlayerId;
      nextPlayerId++;

      const player = {
        id: playerId,
        name: data.name,
        fans: 0,
        position: 0,
        finished: false,
        skills: {
          singing: 0,
          dancing: 0,
          visual: 0
        }
      };

      socket.playerId = playerId;
      sockets[playerId] = socket;
      players[playerId] = player;
      playerRooms[playerId] = data.roomId;

      if (!rooms[data.roomId]) {
        rooms[data.roomId] = {
          players: [],
          currentTurn: null,
          orderRolls: {},
          turnOrder: [],
          gameStarted: false,
        };
      }

      const room = rooms[data.roomId];
      room.players.push(playerId);

      console.log("現在のルーム:", rooms);
      console.log("プレイヤーが参加しました:", player);
      console.log("現在のプレイヤー:", players);

      socket.send(JSON.stringify({
        type: "player_info",
        playerId: playerId
      }));

      broadcastToRoom(data.roomId, {
        type: "player_joined",
        player: player
      });
    }

    //ゲーム開始
    if (data.type === "start_game") {
      if (!socket.playerId) {
        return;
      }

      const playerId = socket.playerId;
      const roomId = playerRooms[playerId];
      const room = rooms[roomId];

      if (!room) {
        return;
      }

      if (room.gameStarted) {
        return;
      }

      console.log(
        "ゲーム開始:",
        roomId
      );

      room.orderRolls = {};

      broadcastToRoom(roomId, {
        type: "game_state",
        state: createGameState(room)
      });

      broadcastToRoom(roomId, {
        type: "order_roll_start"
      });
    }

    //順番決定
    if (data.type === "order_roll") {
      if (!socket.playerId) {
        return;
      }

      const playerId = socket.playerId;
      const player = players[playerId];
      const roomId = playerRooms[playerId];
      const room = rooms[roomId];


      if (!room) {
        return;
      }

      if (room.orderRolls[playerId] !== undefined) {
        return;
      }

      const dice = Math.floor(Math.random() * 6) + 1;

      room.orderRolls[playerId] = dice;

      console.log(
        "Player",
        playerId,
        "の順番決定サイコロ:",
        dice
      );

      broadcastToRoom(roomId, {
        type: "order_roll_result",
        playerId: playerId,
        playerName: player.name,
        value: dice
      });


      if (Object.keys(room.orderRolls).length === room.players.length) {

        console.log("全員のサイコロが終了しました");

        const results = room.players.map((id) => {
          return {
            playerId: id,
            value: room.orderRolls[id]
          };
        });

        results.sort((a, b) => b.value - a.value);

        console.log("順番決定結果:", results);

        room.turnOrder = results.map(
          (result) => result.playerId
        );

        room.currentTurn = room.turnOrder[0];

        room.gameStarted = true;

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
          playerName: players[room.currentTurn].name
        });
      }
    }

    //サイコロ
    if (data.type === "roll_dice") {

      if (!socket.playerId) {
        return;
      }

      const playerId = socket.playerId;
      const player = players[playerId];

      const roomId = playerRooms[playerId];
      const room = rooms[roomId];

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
        (id) => players[id].finished
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

      let event = null;

      if (
        cell.type === "skill" ||
        cell.type === "fan" ||
        cell.type === "trouble"
      ) {
        event = getRandomEventByType(cell.type);
      }


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
        "のサイコロの目:",
        dice
      );

      console.log(
        "プレイヤー",
        playerId,
        "の現在位置:",
        player.position
      );

      broadcastToRoom(roomId, {
        type: "dice_result",
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
        players[room.turnOrder[nextIndex]].finished
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
        playerName: players[room.currentTurn].name
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
    const room = rooms[roomId];

    console.log("プレイヤーが切断しました:", playerId);

    delete sockets[playerId];
    delete players[playerId];
    delete playerRooms[playerId];

    if (!room) {
      return;
    }

    room.players = room.players.filter(
      (id) => id !== playerId
    );

    broadcastToRoom(roomId, {
      type: "player_left",
      playerId: playerId
    });

    console.log("現在のルーム:", rooms);
  });
});
