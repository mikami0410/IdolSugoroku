const board = [
    { position: 1, type: "start" },

    { position: 2, type: "skill" },
    { position: 3, type: "skill" },
    { position: 4, type: "fan" },
    { position: 5, type: "skill" },
    { position: 6, type: "fan" },
    { position: 7, type: "trouble" },
    { position: 8, type: "skill" },
    { position: 9, type: "fan" },
    { position: 10, type: "trouble" },

    { position: 11, type: "skill" },
    { position: 12, type: "fan" },
    { position: 13, type: "trouble" },
    { position: 14, type: "skill" },
    { position: 15, type: "fan" },
    { position: 16, type: "skill" },
    { position: 17, type: "skill" },
    { position: 18, type: "fan" },
    { position: 19, type: "trouble" },
    { position: 20, type: "skill" },

    { position: 21, type: "fan" },
    { position: 22, type: "trouble" },
    { position: 23, type: "skill" },
    { position: 24, type: "trouble" },
    { position: 25, type: "fan" },
    { position: 26, type: "trouble" },
    { position: 27, type: "fan" },
    { position: 28, type: "trouble" },
    { position: 29, type: "fan" },

    { position: 30, type: "goal" }
];


// 各タイプのイベントの種類を定義
const skillEvents = [
    "vocal_lesson",
    "dance_lesson",
    "visual_lesson",
    "select_lesson"
];

const fanEvents = [
    "live_stream",
    "sns_post",
    "street_live",
    "audition",
    "local_event",
    "sns_viral"
];

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
        case "skill":
            return getRandomEvent(skillEvents);
        case "fan":
            return getRandomEvent(fanEvents);
        case "trouble":
            return getRandomEvent(troubleEvents);
        default:
            return null;
    }
}