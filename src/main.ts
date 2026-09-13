import * as THREE from "three";
import { Masu, EventType } from "./Masu";
import { masuPosition, eventTypes } from "./Positions";
import { Road } from "./Road";
import { roadDirection } from "./Positions";
import { Player } from "./Player";
import { ServerPlayerData } from "./Player";
import { StatusDisplay } from "./StatusDisplay";
import { DescriptionDisplay } from "./DescriptionDisplay";
import { Roulette } from "./Roulette";
import { RouletteButton } from "./RouletteButton";
import { RouletteDisplay } from "./RouletteDisplay";
import { Koma } from "./koma";
import { PositionOffset } from "./koma";
import { TitleDisplay } from "./TitleDisplay";
import { MatchingDisplay } from "./MatchingDisplay";
import "./style.css";
import { RoomIdDisplay } from "./RoomIdDisplay";
import { PlayerNameDisplay } from "./PlayerNameDisplay";

interface ServerBoardCell {
    number: number;
    type: number;
}

interface GameState {
    gameStarted: boolean;
    currentTurn: number;
    turnOrder: number[];
    players: ServerPlayerData[];
}

interface ServerMessage {
    type: string;
    playerId?: number;
    playerName?: string;
    player?: ServerPlayerData;
    players?: ServerPlayerData[];
    playerIds?: number[];
    turnOrder?: number[];
    state?: GameState;
    board?: ServerBoardCell[];
    value?: number;
    position?: number;
    cell?: ServerBoardCell;
    event?: {
        name: string | null;
        title: string | null;
        description: string | null;
    };
    ranking?: Array<{
        playerId: number;
        playerName: string;
        fans: number;
        rank: number;
    }>;
    message?: string;
}

const socket = new WebSocket("ws://localhost:8080");

let myPlayerId: number | null = null;
let currentRoomId = "";
let currentTurn: number | null = null;

// プレイヤーの情報を保持するマップ
const players: Map<number, Player> = new Map();

// マス生成
const masus: Masu[] = [];
let boardCreated = false;

// コマ
const komas: Map<number, Koma> = new Map();

const komaOffsets: PositionOffset[] = [
    PositionOffset.UPPER_LEFT,
    PositionOffset.UPPER_RIGHT,
    PositionOffset.LOWER_LEFT,
    PositionOffset.LOWER_RIGHT
];

let gameContainer!: HTMLDivElement;
let matchingDisplay!: MatchingDisplay;
let roomIDDisplay!: RoomIdDisplay;
let playerNameDisplay!: PlayerNameDisplay;
let titleDisplay!: TitleDisplay;
let statusDisplay!: StatusDisplay;
let descriptionDisplay!: DescriptionDisplay;
let roulette!: Roulette;
let rouletteDisplay!: RouletteDisplay;
let scene!: THREE.Scene;
let rouletteButtonElement!: HTMLButtonElement;
let pendingCellEventData: ServerMessage | null = null;
let serverDeme!: number;
let currentPlayer!: Player;

function sendMessage(message: object): void {
    if (socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocketが接続されていません");
        return;
    }
    socket.send(JSON.stringify(message));
}

socket.addEventListener("message", (event) => {
    const data: ServerMessage = JSON.parse(event.data);
    console.log("サーバーから受信", data);

    switch (data.type) {
        case "player_info":
            if (data.playerId !== undefined) {
                myPlayerId = data.playerId;
                console.log("自分のplayerId:", myPlayerId);
            }
            break;
        case "player_joined":
            if (data.player) {
                addOrUpdatePlayer(data.player);
                updateMatchingDisplay();
            }
            break;
        case "room_players":
            if (data.players) {
                for (const player of data.players) {
                    addOrUpdatePlayer(player);
                }
                updateMatchingDisplay();
                matchingDisplay.show();
            }
            break;
        case "board":
            if (data.board) {
                createBoardFromServer(data.board);
            }
            let positionNumber = 1;
            for (const player of players.values()) {
                createKoma(player.getId(), positionNumber);
                positionNumber ++;
            }
            break;
        case "game_state":
            if (data.state) {
                updateGameState(data.state);
            }
            break;
        case "order_deciding":
            console.log("順番決定中");
            break;
        case "order_decided":
            console.log("ターン順：", data.turnOrder ?? data.playerIds);
            break;
        case "turn_changed":
            if (data.playerId !== undefined) {
                currentTurn = data.playerId;
                // players.get(currentTurn)の位置を変えると良いかも
                const player = players.get(currentTurn);
                if (player) {
                    currentPlayer = player;
                    // statusDisplay.show()の位置を変更する
                    // statusDisplay.show(currentPlayer);
                }
                updateRouletteButton();
            }
            break;
        case "roulette_result":
            if (
                data.playerId !== undefined &&
                data.value !== undefined
            ) {
                handleRouletteResult(data.playerId, data.value);
            }
            break;

        case "player_moved":
            if (
                data.playerId !== undefined &&
                data.position !== undefined
            ) {
                handlePlayerSet(data.playerId, data.position);
            }
            break;
        case "cell_event":
            pendingCellEventData = data;
            break;

        case "game_finished":
            console.log("ゲーム終了:", data.ranking);
            break;

        case "error":
            console.error("サーバーエラー:", data.message);
            alert(data.message ?? "エラーが発生しました");
            updateRouletteButton();
            break;

        default:
            console.log("未対応のメッセージ:", data.type);
    }
});

function addOrUpdatePlayer(serverPlayer: ServerPlayerData): void {
    let player = players.get(serverPlayer.id);

    if (!player) {
        player = new Player();
        players.set(serverPlayer.id, player);
    }

    player.updateFromServer(serverPlayer);
}

function updateGameState(state: GameState): void {
    currentTurn = state.currentTurn;

    if (state.gameStarted) {
        matchingDisplay.hide();
    }

    for (const serverPlayer of state.players) {
        addOrUpdatePlayer(serverPlayer);
        
    }

    // updateRouletteButton();

    const currentPlayer = players.get(currentTurn);
    if (currentPlayer) {
        // statusDisplay.show(currentPlayer);
    }
}

function createBoardFromServer(board: ServerBoardCell[]): void {
    if (boardCreated) {
        return;
    }

    boardCreated = true;

    for (const cell of board) {
        const position = masuPosition[cell.number];

        if (!position) {
            console.error("マスの座標がありません：", cell.number);
            continue;
        }

        const [x, z] = position;
        const eventType = cell.type as EventType;

        const masu = new Masu(
            eventType,
            `マス${cell.number}`,
            "イベントの内容",
            x,
            z,
            scene
        );

        masus[cell.number] = masu;
    }

    createRoad();
}

function createKoma(playerId: number, positionNumber: number): void {
    let koma = komas.get(playerId);

    if (!koma && players.size && positionNumber <= komaOffsets.length) {
        koma = new Koma(komaOffsets[positionNumber - 1]);
        komas.set(playerId, koma);
    }

    const startMasu = masus[0];
    if (koma && startMasu) {
        void koma.load(scene, startMasu);
    }
}

function createRoad(): void {
    for (let i = 0; i < masuPosition.length - 1; i++) {
        const [startX, startZ] = masuPosition[i];
        const [endX, endZ] = masuPosition[i + 1];

        new Road(
            startX,
            startZ,
            endX,
            endZ,
            scene,
            roadDirection[i][0],
            roadDirection[i][1]
        );
    }
}

function handlePlayerSet(playerId: number, position: number): void {
    const player = players.get(playerId);

    if (!player) {
        return;
    }

    player.setMasuNumber(position);
}

function moveKoma(playerId: number): void {
    const player = players.get(playerId);
    const koma = komas.get(playerId);

    if (!koma || !player) {
        return;
    }

    const masu = masus[player.getMasuNumber()];

    if (!masu) {
        return;
    }

    // roulette.setRollingEnd(() => {
    //     koma.setPosition(masu);
    // })

    koma.setPosition(masu);
}

function moveKoma2(palyerId: number, value: number) {
    const player = players.get(palyerId);
    const koma = komas.get(palyerId);
    let nextPlayer = null;

    if(currentTurn !== null) {
        nextPlayer = players.get(currentTurn);
    }

    if(!player || !koma || !nextPlayer) {
        return;
    }

    //この時点でMasuNumberが変更されているかどうかでかわりそう
    const nextMasuNumber = player.getMasuNumber();
    let currentMasuNumber = nextMasuNumber - value;
    const nextMasu = masus[nextMasuNumber];

    if(!nextMasu) {
        return;
    }

    for (let i = 0; i < value; i++) {
        setTimeout(() => {
            if(currentMasuNumber < nextMasuNumber) {
                currentMasuNumber ++;
                let currentMasu = masus[currentMasuNumber];
                if(!currentMasu) {
                    return;
                }
                koma.setPosition(currentMasu);
            }
        }, 1000*(i+1));
    }
    setTimeout(() => {
        player.setMasuNumber(nextMasuNumber);
        rouletteDisplay.hide();
        descriptionDisplay.show(nextMasu);
    }, (value+1)*1000);

    setTimeout(() => {
        descriptionDisplay.hide();
        statusDisplay.show(nextPlayer);
    }, (value+1)*1000 + 3000);
}

function handleRouletteResult(playerId: number, value: number): void {
    console.log("サーバーが決めた出目：", value);
    serverDeme = value;

    descriptionDisplay.hide();

    roulette.setDeme(value);
    roulette.show();

    roulette.setRollingEnd(() => {
        if (pendingCellEventData) {
            handleCellEvent(pendingCellEventData);
            pendingCellEventData = null;
        }
        updateRouletteButton();
        moveKoma2(playerId, value);
    })
    roulette.startRolling();
}

function handleCellEvent(data: ServerMessage): void {
    if (
        data.playerId === undefined ||
        !data.cell ||
        !data.event
    ) {
        return;
    }

    const masu = masus[data.cell.number];

    if (!masu) {
        return;
    }

    const title = data.event.title;
    const description = data.event.description;

    if (title !== null && description !== null) {
        masu.setEventTitle(title);
        masu.setDiscription(description);
    }

    console.log("マスイベント：", data.event);
    // rouletteDisplay.hide();
    // descriptionDisplay.show(masu);
}

function updateMatchingDisplay(): void {
    matchingDisplay.setPlayers(Array.from(players.values()));
}

function createRouletteButton(): void {
    rouletteButtonElement = document.createElement("button");
    rouletteButtonElement.id = "roulette-button";
    rouletteButtonElement.textContent = "ルーレットを回す";
    gameContainer.appendChild(rouletteButtonElement);

    rouletteButtonElement.addEventListener("click", () => {
        if (myPlayerId === null) {
            return;
        }

        if (currentTurn !== myPlayerId) {
            return;
        }

        if (roulette.getIsRolling()) {
            return;
        }

        sendMessage({
            type: "spin_roulette"
        });
    });

    updateRouletteButton();
}

function updateRouletteButton(): void {
    if (!rouletteButtonElement) {
        return;
    }

    rouletteButtonElement.disabled =
        myPlayerId === null ||
        currentTurn !== myPlayerId ||
        roulette.getIsRolling();
}

function startGame(): void {
    sendMessage({
        type: "start_game"
    });
}

socket.addEventListener("open", () => {
    console.log("WebSocketに接続しました");
});

socket.addEventListener("close", () => {
    console.log("WebSocketとの接続が切断されました");
});


async function main(): Promise<void> {
    // ゲーム画面
    gameContainer = document.createElement("div");
    gameContainer.id = "game-container";
    document.body.appendChild(gameContainer);

    titleDisplay = new TitleDisplay(
        // 部屋を作る
        () => {
            console.log("部屋を作る");
            titleDisplay.hide();

            currentRoomId = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

            matchingDisplay.setRoomID(currentRoomId);
            playerNameDisplay.show();
        },
        // 部屋に入る
        () => {
            console.log("部屋に入る");
            titleDisplay.hide();
            roomIDDisplay.show();
        }
    );

    matchingDisplay = new MatchingDisplay(() => {
        console.log("ゲーム開始");
        startGame();
    });

    roomIDDisplay = new RoomIdDisplay((roomId) => {
        currentRoomId = roomId;
        roomIDDisplay.hide();
        matchingDisplay.setRoomID(roomId);
        playerNameDisplay.show();
    });

    playerNameDisplay = new PlayerNameDisplay((playerName) => {
        playerNameDisplay.hide();

        sendMessage({
            type: "join",
            name: playerName,
            roomId: currentRoomId
        });

        // マッチング画面へ
        matchingDisplay.show();
        updateMatchingDisplay();
    });

    titleDisplay.show();

    // 背景隠す用
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    gameContainer.appendChild(overlay);

    // Three.jsの設定とか
    const width = 1280;
    const height = 720;

    function resize(): void {
        const scaleX = window.innerWidth / width;
        const scaleY = window.innerHeight / height;
        const scale = Math.min(scaleX, scaleY);
        gameContainer.style.setProperty("--game-scale", scale.toString());
    }

    resize();

    window.addEventListener("resize", resize);

    scene = new THREE.Scene();
    const viewSize = 15;
    const camera = new THREE.OrthographicCamera(
        -viewSize * width / height,
        viewSize * width / height,
        viewSize,
        -viewSize,
        0.1,
        1000
    );
    camera.position.set(0, 10, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    gameContainer.appendChild(renderer.domElement);

    //床
    const floorGeometry: THREE.BufferGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const floorMaterial: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xececec });
    const floor: THREE.Mesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);

    // ステータス
    statusDisplay = new StatusDisplay();

    // マスの内容の表示
    descriptionDisplay = new DescriptionDisplay();
    descriptionDisplay.hide();

    // ルーレット
    roulette = new Roulette(scene);
    rouletteDisplay = new RouletteDisplay();
    createRouletteButton();

    // 描画
    function animate(): void {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

main();
