// export enum EventType {
//     VOCAL_LESSON = 1,
//     DANCE_LESSON = 2,
//     VISUAL_LESSON = 3,
//     VOCAL_FAN = 4,
//     DANCE_FAN = 5,
//     VISUAL_FAN = 6,
//     TROUBLE = 7,
//     START = 8,
//     GOAL = 9
// }

const board = [
    { number: 1, type: 8 }, // start

    { number: 2, type: 1 }, // vocal lesson
    { number: 3, type: 2 }, // dance lesson
    { number: 4, type: 4 }, // vocal fan
    { number: 5, type: 3 }, // visual lesson
    { number: 6, type: 5 }, // dance fan
    { number: 7, type: 7 }, // trouble
    { number: 8, type: 3 }, // visual lesson
    { number: 9, type: 6 }, // visual fan
    { number: 10, type: 7 }, // trouble

    { number: 11, type: 1 }, // vocal lesson
    { number: 12, type: 4 }, // vocal fan
    { number: 13, type: 7 }, // trouble
    { number: 14, type: 2 }, // dance lesson
    { number: 15, type: 5 }, // dance fan
    { number: 16, type: 1 }, // vocal lesson
    { number: 17, type: 2 }, // dance lesson
    { number: 18, type: 6 }, // visual fan
    { number: 19, type: 7 }, // trouble
    { number: 20, type: 1 }, // 強制イベント予定

    { number: 21, type: 4 }, // vocal fan
    { number: 22, type: 7 }, // trouble
    { number: 23, type: 3 }, // visual lesson
    { number: 24, type: 7 }, // trouble
    { number: 25, type: 5 }, // dance fan
    { number: 26, type: 7 }, // trouble
    { number: 27, type: 6 }, // visual fan
    { number: 28, type: 7 }, // trouble
    { number: 29, type: 4 }, // vocal fan

    { number: 30, type: 9 } // goal
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
        case 4:
            return getRandomEvent(vocalFanEvents);
        case 5:
            return getRandomEvent(danceFanEvents);
        case 6:
            return getRandomEvent(visualFanEvents);
        case 7:
            return getRandomEvent(troubleEvents);
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
            changeFans(player, 20);
            break;
        case "street_live":
            changeFans(player, 25);
            break;
        case "local_event":
            changeFans(player, 30);
            break;
        case "dance_video":
            changeFans(player, 20);
            break;
        case "dance_competition":
            changeFans(player, 30);
            break;
        case "back_dancer":
            changeFans(player, 40);
            break;
        case "daily_photo":
            changeFans(player, 15);
            break;
        case "street_snap":
            changeFans(player, 30);
            break;
        case "live_stream":
            changeFans(player, 25);
            break;
        
        // トラブル系
        case "leg_injury":
            changeSkillLevel(player, "dance", -10);
            break;
        case "throat_injury":
            changeSkillLevel(player, "vocal", -10);
            break;
        case "romance":
            changeFans(player, -20);
            break;
        case "account_hacked":
            changeFans(player, -20);
            break;
        case "flaming_sns":
            changeFans(player, -50);
            break;
        case "private_account_leak":
            changeFans(player, -20);
            break;
        case "weight_gain":
            changeSkillLevel(player, "visual", -10);
            break;
    }
}

function changeSkillLevel(player, skill, amount){
    player.skills[skill] += amount;

    if(player.skills[skill] > 100) {
        player.skills[skill] = 100;
    } else if(player.skills[skill] < 0) {
        player.skills[skill] = 0;
    }
}

function changeFans(player, amount) {
    player.fans += amount;

    if(player.fans < 0) {
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

module.exports = {
    board,
    getRandomEventByType,
    applyEvent
};
