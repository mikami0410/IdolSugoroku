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
        case "select_lesson":
            // とりあえずランダムにしておく（後でUIで選択できるようにする）
            const skills = ["vocal", "dance", "visual"];
            const randomSkill = skills[Math.floor(Math.random() * skills.length)];
            changeSkillLevel(player, randomSkill, 20);
            break;
        
        // ファン獲得系
        case "live_stream":
            changeFans(player, 20);
            break;
        case "sns_post":
            changeFans(player, 15);
            break;
        case "street_live":
            changeFans(player, 25);
            break;
        case "audition":
            changeFans(player, 30);
            break;
        case "local_event":
            changeFans(player, 10);
            break;
        case "sns_viral":
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
            changeFans(player, -20);
            break;
        case "account_hacked":
            changeFans(player, -30);
            break;
        case "flaming_sns":
            changeFans(player, -25);
            break;
        case "private_account_leak":
            changeFans(player, -15);
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
