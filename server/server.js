const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

let nextPlayerId = 1;

const players = {};
const rooms = {};
const board = [
  { position: 1, type: "start" },
  { position: 2, type: "event" },
  { position: 3, type: "event" },
  { position: 4, type: "event" },
  { position: 5, type: "event" },
  { position: 6, type: "event" },
  { position: 7, type: "event" },
  { position: 8, type: "event" },
  { position: 9, type: "event" },
  { position: 10, type: "event" },
  { position: 11, type: "event" },
  { position: 12, type: "event" },
  { position: 13, type: "event" },
  { position: 14, type: "event" },
  { position: 15, type: "event" },
  { position: 16, type: "event" },
  { position: 17, type: "event" },
  { position: 18, type: "event" },
  { position: 19, type: "event" },
  { position: 20, type: "event" },
  { position: 21, type: "event" },
  { position: 22, type: "event" },
  { position: 23, type: "event" },
  { position: 24, type: "event" },
  { position: 25, type: "event" },
  { position: 26, type: "event" },
  { position: 27, type: "event" },
  { position: 28, type: "event" },
  { position: 29, type: "event" },
  { position: 30, type: "goal" }
];
const sockets = {};
const playerRooms = {};

console.log("WebSocketサーバーを起動しました");

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

function createGameState(room) {
  return {
    gameStarted: room.gameStarted,
    currentTurn: room.currentTurn,
    turnOrder: room.turnOrder,
    players: room.players.map((playerId) => players[playerId])
  };
}

function getBoardCell(position) {
  return board.find((cell) => cell.position === position);
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

      const cell = getBoardCell(player.position);

      console.log(
        "止まったマス:",
        cell
      );

      broadcastToRoom(roomId, {
        type: "cell_event",
        playerId: playerId,
        playerName: player.name,
        cell: cell
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

      const nextIndex =
        (currentIndex + 1) % room.turnOrder.length;

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
