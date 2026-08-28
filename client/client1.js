const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8080");

let playerId;
let currentTurn = null;
let finished = false;
let orderRollReady = false;

socket.on("open", () => {
  console.log("サーバーに接続しました");

  socket.send(JSON.stringify({
    type: "join",
    name: "はなこ",
    roomId: "room1"
  }));
});

socket.on("message", (message) => {
  const data = JSON.parse(message.toString());

  console.log("サーバーから受信:", data);

  // プレイヤーID
  if (data.type === "player_info") {
    playerId = data.playerId;

    console.log("自分のプレイヤーID:", playerId);
  }

  // プレイヤー参加
  if (data.type === "player_joined") {
    console.log(
      "プレイヤーが参加しました:",
      data.player.name
    );
  }


  //順番決定開始
  if (data.type === "order_roll_start") {

    if (
      data.playerIds &&
      !data.playerIds.includes(playerId)
    ) {
      return;
    }

    orderRollReady = true;

    console.log("順番決定サイコロを振れます。Enterを押してください。");
  }


  // 順番決定サイコロ
  if (data.type === "order_roll_result") {
    console.log(
      "順番決定サイコロ:",
      data.playerName,
      data.value
    );
  }

  // 順番決定完了
  if (data.type === "order_decided") {
    console.log(
      "========================"
    );

    console.log(
      "ゲームの順番が決まりました"
    );

    console.log(
      "順番:",
      data.turnOrder
    );

    console.log(
      "========================"
    );
  }

  // ターン変更
  if (data.type === "turn_changed") {

    currentTurn = data.playerId;

    console.log(
      "現在のターン:",
      data.playerName
    );

    if (data.playerId === playerId) {
      console.log("自分のターンです");
    } else {
      console.log(data.playerName + "が操作中");
    }
  }



  //サイコロ
  if (data.type === "dice_result") {
    console.log(
      data.playerName,
      "のサイコロの結果:",
      data.value
    );
  }


  // プレイヤー移動
  if (data.type === "player_moved") {
    console.log(
      data.playerName,
      "が",
      data.position,
      "番目のマスに移動しました"
    );
  }

  //ゲーム状態
  if (data.type === "game_state") {
    console.log("現在のゲーム状態:");
    console.log(JSON.stringify(data.state, null, 2));

    const me = data.state.players.find(
      (player) => player.id === playerId
    );

    if (me) {
      finished = me.finished;
    }
  }


  //エラー
  if (data.type === "error") {
    console.log("エラー:", data.message);
  }

  //マス
  if (data.type === "cell_event") {
    console.log(
      data.playerName,
      "が",
      data.cell.position,
      "番目のマスに止まりました"
    );

    console.log(
      "マスの種類:",
      data.cell.type
    );

    console.log(
      "発生イベント:",
      data.event
    );
  }

  //ゲーム終了
  if (data.type === "game_finished") {
    console.log("==========");
    console.log("ゲーム終了！");
    console.log("結果発表");
    console.log("==========");

    if (data.ranking) {
      data.ranking.forEach((player) => {
        console.log(
          player.rank + "位:",
          player.playerName,
          "ファン数:",
          player.fans
        );
      });
    }

    if (data.reason === "player_left") {
      console.log("プレイヤーが退出したためゲーム終了です");
    }
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (key) => {

  if (key === "\r") {

    // =========================
    // 順番決定サイコロ
    // =========================
    if (orderRollReady) {

      console.log("順番決定サイコロを振ります");

      socket.send(JSON.stringify({
        type: "order_roll"
      }));

      orderRollReady = false;

      return;
    }

    // =========================
    // 通常のゲーム
    // =========================
    if (finished) {
      console.log("すでにゴールしています");
      return;
    }

    if (currentTurn !== playerId) {
      console.log("あなたのターンではありません");
      return;
    }

    console.log("サイコロを振ります");

    socket.send(JSON.stringify({
      type: "roll_dice"
    }));
  }

  if (key === "\u0003") {
    process.exit();
  }
});

