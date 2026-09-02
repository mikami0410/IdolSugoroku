// export enum EventType {
//     VOCAL_LESSON = 1,
//     DANCE_LESSON = 2,
//     VISUAL_LESSON = 3,
//     SELECT_LESSON = 4,
//     VOCAL_FAN = 5,
//     DANCE_FAN = 6,
//     VISUAL_FAN = 7,
//     TROUBLE = 8,
//     AUDITION = 9,
//     START = 10,
//     GOAL = 11
// }

const {
    getPlayer
} = require("./player");

const board = [
    { number: 1, type: 10 }, // start

    { number: 2, type: 1 }, // vocal lesson
    { number: 3, type: 2 }, // dance lesson
    { number: 4, type: 5 }, // vocal fan
    { number: 5, type: 3 }, // visual lesson
    { number: 6, type: 6 }, // dance fan
    { number: 7, type: 4 }, // select lesson
    { number: 8, type: 8 }, // trouble
    { number: 9, type: 4 }, // select lesson
    { number: 10, type: 7 }, // visual fan

    { number: 11, type: 1 }, // vocal lesson
    { number: 12, type: 5 }, // vocal fan
    { number: 13, type: 2 }, // dance lesson
    { number: 14, type: 4 }, // select lesson
    { number: 15, type: 8 }, // trouble
    { number: 16, type: 6 }, // dance fan
    { number: 17, type: 3 }, // visual lesson
    { number: 18, type: 4 }, // select lesson
    { number: 19, type: 8 }, // trouble
    { number: 20, type: 9 }, // audition

    { number: 21, type: 7 }, // visual fan
    { number: 22, type: 8 }, // trouble
    { number: 23, type: 4 }, // select lesson
    { number: 24, type: 5 }, // vocal fan
    { number: 25, type: 8 }, // trouble
    { number: 26, type: 6 }, // dance fan
    { number: 27, type: 8 }, // trouble
    { number: 28, type: 8 }, // trouble
    { number: 29, type: 7 }, // visual fan

    { number: 30, type: 11 } // goal
];


// 各タイプのイベントの種類を定義
// スキル系
const vocalLessonEvents = [
    "vocal_lesson"
];

const danceLessonEvents = [
    "dance_lesson"
];

const visualLessonEvents = [
    "visual_lesson"
];

// ファン獲得系
const vocalFanEvents = [
    "singing_video",       // 歌ってみた動画の投稿
    "street_live",         // 路上ライブ
    "local_event"          // 地元のイベントに出演
];

const danceFanEvents = [
    "dance_video",         // ダンス動画の投稿
    "dance_competition",   // ダンス大会に出場
    "back_dancer"          // 有名アーティストのバックダンサーをする
];

const visualFanEvents = [
    "daily_photo",         // 日常写真の投稿
    "street_snap",         // ストリートスナップに出会う
    "live_stream"          // SNSでライブ配信をする
];

const auditionEvents = [
    "audition"             // オーディションに参加する
];

// トラブル系
const troubleEvents = [
    "leg_injury",
    "throat_injury",
    "romance",
    "account_hacked",
    "flaming_sns",
    "private_account_leak",
    "weight_gain"
];


// イベントの詳細情報
const eventDetails = {
    // レッスン系
    vocal_lesson: {
        title: "ボーカルレッスン",
        description: "歌のレッスンを受けたよ！ボーカルスキル +20"
    },
    dance_lesson: {
        title: "ダンスレッスン",
        description: "ダンスのレッスンを受けたよ！ダンススキル +20"
    },
    visual_lesson: {
        title: "ビジュアルレッスン",
        description: "メイクや表情の練習をしたよ！ビジュアルスキル +20"
    },

    // ボーカルファン
    singing_video: {
        title: "歌ってみた動画の投稿",
        description: "歌ってみた動画を投稿したよ！ファンが増える"
    },
    street_live: {
        title: "路上ライブ",
        description: "路上ライブを行ったよ！ファンが増える"
    },
    local_event: {
        title: "地元のイベントに出演",
        description: "地元のイベントに出演したよ！ファンが増える"
    },

    // ダンスファン
    dance_video: {
        title: "ダンス動画の投稿",
        description: "ダンス動画をSNSに投稿したよ！ファンが増える"
    },
    dance_competition: {
        title: "ダンス大会に出場",
        description: "ダンス大会に出場したよ！ファンが増える"
    },
    back_dancer: {
        title: "有名アーティストのバックダンサー",
        description: "有名アーティストのバックダンサーを務めたよ！ファンが増える"
    },

    // ビジュアルファン
    daily_photo: {
        title: "日常写真の投稿",
        description: "日常の写真をSNSに投稿したよ！ファンが増える"
    },
    street_snap: {
        title: "ストリートスナップに出会う",
        description: "街でストリートスナップの撮影をしてもらい、注目を集めた！"
    },
    live_stream: {
        title: "SNSでライブ配信",
        description: "SNSでライブ配信を行い、新しいファンを獲得した！"
    },

    // オーディション
    audition: {
        title: "公開オーディション",
        description: "公開オーディションに参加したよ！ルーレットでファンの数が決まるよ"
    },

    // トラブル
    leg_injury: {
        title: "ケガ",
        description: "レッスン中に足をケガしてしまった…… ダンススキル-10"
    },
    throat_injury: {
        title: "喉のケガ",
        description: "喉を痛めてしまい、歌うのが大変になってしまった…… ボーカルスキル-10"
    },
    romance: {
        title: "熱愛発覚",
        description: "熱愛が発覚してしまった…… ファン-50人"
    },
    account_hacked: {
        title: "アカウント乗っ取り",
        description: "SNSアカウントを乗っ取られてしまった…… ファン-30人"
    },
    flaming_sns: {
        title: "SNSで炎上する",
        description: "SNSで炎上してしまった…… ファン-70人"
    },
    private_account_leak: {
        title: "裏アカウント流出",
        description: "裏アカウントの情報が流出してしまった…… ファン-20人"
    },
    weight_gain: {
        title: "体重が増える",
        description: "少し太ってしまった…… ビジュアルスキル-10"
    }
};


// ランダムイベントを取得する関数
function getRandomEvent(events) {
    const index = Math.floor(Math.random() * events.length);
    return events[index];
}

function getRandomEventByType(type) {
    switch (type) {
        case 1:
            return getRandomEvent(vocalLessonEvents);
        case 2:
            return getRandomEvent(danceLessonEvents);
        case 3:
            return getRandomEvent(visualLessonEvents);
        case 5:
            return getRandomEvent(vocalFanEvents);
        case 6:
            return getRandomEvent(danceFanEvents);
        case 7:
            return getRandomEvent(visualFanEvents);
        case 8:
            return getRandomEvent(troubleEvents);
        case 9:
            return getRandomEvent(auditionEvents);
        default:
            return null;
    }
}


//イベントの効果
function applyEvent(player, event) {
    switch (event) {
        // レッスン系
        case "vocal_lesson":
            changeSkillLevel(player, "vocal", 20);
            break;
        case "dance_lesson":
            changeSkillLevel(player, "dance", 20);
            break;
        case "visual_lesson":
            changeSkillLevel(player, "visual", 20);
            break;

        // ファン獲得系
        case "singing_video":
            changeFans(player, calculateFans(player.skills.vocal));
            break;
        case "street_live":
            changeFans(player, calculateFans(player.skills.vocal));
            break;
        case "local_event":
            changeFans(player, calculateFans(player.skills.vocal));
            break;
        case "dance_video":
            changeFans(player, calculateFans(player.skills.dance));
            break;
        case "dance_competition":
            changeFans(player, calculateFans(player.skills.dance));
            break;
        case "back_dancer":
            changeFans(player, calculateFans(player.skills.dance));
            break;
        case "daily_photo":
            changeFans(player, calculateFans(player.skills.visual));
            break;
        case "street_snap":
            changeFans(player, calculateFans(player.skills.visual));
            break;
        case "live_stream":
            changeFans(player, calculateFans(player.skills.visual));
            break;
        
        // オーディション系
        case "audition":  // 後で変更予定
            changeFans(player, 50);
            break;

        // トラブル系
        case "leg_injury":
            changeSkillLevel(player, "dance", -10);
            break;
        case "throat_injury":
            changeSkillLevel(player, "vocal", -10);
            break;
        case "romance":
            changeFans(player, -50);
            break;
        case "account_hacked":
            changeFans(player, -30);
            break;
        case "flaming_sns":
            changeFans(player, -70);
            break;
        case "private_account_leak":
            changeFans(player, -30);
            break;
        case "weight_gain":
            changeSkillLevel(player, "visual", -10);
            break;
    }
}

// ファンの数決め
function calculateFans(skill) {
    const fans = Math.floor(skill * 0.5);
    return fans;
}

// イベントの詳細情報を取得する関数
function getEventDetails(event) {
    return eventDetails[event] || null;
}

function changeSkillLevel(player, skill, amount) {
    player.skills[skill] += amount;

    if (player.skills[skill] > 100) {
        player.skills[skill] = 100;
    } else if (player.skills[skill] < 0) {
        player.skills[skill] = 0;
    }
}

function changeFans(player, amount) {
    player.fans += amount;

    if (player.fans < 0) {
        player.fans = 0;
    }
}

function getSkillRank(value) {
    const ranks = ["C", "B", "A", "S"];
    if (value >= 100) {
        return ranks[3]; // Sランク
    } else if (value >= 67) {
        return ranks[2]; // Aランク
    } else if (value >= 34) {
        return ranks[1]; // Bランク
    } else {
        return ranks[0]; // Cランク
    }
}

// 現在位置に対応するマスの情報を取得
function getBoardCell(position) {
    return board.find(
        (cell) => cell.number === position
    );
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

    ranking.sort(
        (a, b) => b.fans - a.fans
    );

    ranking.forEach((player, index) => {
        player.rank = index + 1;
    });

    return ranking;
}

// 次のターンのプレイヤーを取得
function getNextTurnPlayer(room, playerId) {
    const currentIndex =
        room.turnOrder.indexOf(playerId);

    let nextIndex =
        (currentIndex + 1) %
        room.turnOrder.length;

    while (
        getPlayer(
            room.turnOrder[nextIndex]
        ).finished
    ) {
        nextIndex =
            (nextIndex + 1) %
            room.turnOrder.length;
    }

    return room.turnOrder[nextIndex];
}

module.exports = {
    board,
    getRandomEventByType,
    getEventDetails,
    applyEvent,
    createRanking,
    getBoardCell,
    getNextTurnPlayer
};