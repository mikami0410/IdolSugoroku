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

      socket.playerId = playerId;
      sockets[playerId] = socket;
      playerRooms[playerId] = data.roomId;

      // プレイヤーをルームに追加
      addPlayerToRoom(data.roomId, playerId);

      console.log("現在のルーム:", getRooms());
      console.log("プレイヤーが参加しました:", player);
      console.log("現在のプレイヤー:", getPlayers());

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
      const player = getPlayer(playerId);
      const roomId = playerRooms[playerId];
      const room = getRoom(roomId);


      if (!room) {
        return;
      }

      if (room.orderRolls[playerId] !== undefined) {
        return;
      }

      const dice = Math.floor(Math.random() * 6) + 1;

      room.orderRolls[playerId] = dice;
      room.orderRollResults[playerId] = dice;

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


      if (
        Object.keys(room.orderRolls).length ===
        (
          room.orderRollRerolling
            ? room.orderRollGroups.flat().length
            : room.players.length
        )
      ) {

        console.log("全員のサイコロが終了しました");

        const results = room.players.map((id) => {
          return {
            playerId: id,
            value: room.orderRollResults[id]
          };
        });

        const valueCount = {};

        for (const result of results) {
          valueCount[result.value] =
            (valueCount[result.value] || 0) + 1;
        }

        if (!room.orderRollRerolling) {
          const sortedResults = [...results].sort(
            (a, b) => b.value - a.value
          );

          const groups = [];
          let currentGroup = [];
          let currentValue = null;

          for (const result of sortedResults) {
            if (currentValue !== result.value) {
              if (currentGroup.length > 0) {
                groups.push(currentGroup);
              }

              currentGroup = [];
              currentValue = result.value;
            }

            currentGroup.push(result.playerId);
          }

          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }

          room.orderRollGroups = groups;
        }


        let duplicatePlayers = [];

        if (!room.orderRollRerolling) {
          duplicatePlayers = room.orderRollGroups
            .filter((group) => group.length > 1)
            .flat()
            .map((playerId) => {
              return {
                playerId: playerId,
                value: room.orderRolls[playerId]
              };
            });
        }

        if (room.orderRollRerolling) {
          const group = room.orderRollCurrentGroup;

          const groupValues = group.map(
            (playerId) => room.orderRolls[playerId]
          );

          const valueCount = {};

          for (const value of groupValues) {
            valueCount[value] =
              (valueCount[value] || 0) + 1;
          }

          const samePlayers = group.filter(
            (playerId) =>
              valueCount[room.orderRolls[playerId]] > 1
          );

          if (samePlayers.length > 0) {
            duplicatePlayers = samePlayers.map((playerId) => {
              return {
                playerId: playerId,
                value: room.orderRolls[playerId]
              };
            });
          }
        }

        console.log(
          "振り直し対象:",
          duplicatePlayers.map((result) => result.playerId)
        );


        if (duplicatePlayers.length > 0) {
          room.orderRollRerolling = true;

          room.orderRollCurrentGroup = duplicatePlayers.map(
            (result) => result.playerId
          );

          console.log("同じ目がありました");
          console.log("再度サイコロを振るプレイヤー:", duplicatePlayers);

          for (const result of duplicatePlayers) {
            delete room.orderRolls[result.playerId];
          }

          broadcastToRoom(roomId, {
            type: "order_roll_start",
            playerIds: duplicatePlayers.map(
              (result) => result.playerId
            )
          });

          return;
        }

        if (room.orderRollRerolling && duplicatePlayers.length === 0) {
          room.orderRollRerolling = false;
          room.orderRollCurrentGroup = [];
        }

        // 最初に決まった順位グループを維持する
        const groupedResults = [];

        for (const group of room.orderRollGroups) {
          const groupResults = group.map((playerId) => {
            return {
              playerId: playerId,
              value: room.orderRollResults[playerId]
            };
          });

          // 同じ順位グループの中だけ、振り直し結果で並べる
          groupResults.sort((a, b) => b.value - a.value);

          groupedResults.push(...groupResults);
        }

        console.log("順番決定結果:", groupedResults);

        room.turnOrder = groupedResults.map(
          (result) => result.playerId
        );

        room.orderRollRerolling = false;

        room.currentTurn = room.turnOrder[0];

        room.gameStarted = true;
        room.gameStarting = false;

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
    }

    //サイコロ
    if (data.type === "roll_dice") {

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
