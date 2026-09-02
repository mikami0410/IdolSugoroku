import { EventType } from "./Masu";

// マス
export const masuPosition: [number, number][] =[
    [-22, -13],
    [-17, -14],
    [-12, -14.8],
    [-7, -15.8],
    [-2, -16],
    [3, -16],
    [8, -15],
    [13, -14],
    [18, -12],
    [22, -8],
    [23, -2],
    [21, 4],
    [16, 3],
    [11, 4],
    [6, 5],
    [1, 4],
    [-4, 4.5]
];

// マスの内容
export const eventTypes: EventType[] = [
    EventType.START,

    EventType.VOCAL_LESSON,
    EventType.DANCE_LESSON,
    EventType.VOCAL_FAN,
    EventType.VISUAL_LESSON,
    EventType.DANCE_FAN,
    EventType.TROUBLE,
    EventType.SELECT_LESSON,
    EventType.VISUAL_FAN,
    EventType.TROUBLE,

    EventType.VOCAL_LESSON,
    EventType.VOCAL_FAN,
    EventType.TROUBLE,
    EventType.DANCE_LESSON,
    EventType.DANCE_FAN,
    EventType.VISUAL_LESSON,
    EventType.SELECT_LESSON,
    EventType.VISUAL_FAN,
    EventType.TROUBLE,
    EventType.ORDITION,

    EventType.VOCAL_FAN,
    EventType.TROUBLE,
    EventType.VOCAL_LESSON,
    EventType.TROUBLE,
    EventType.DANCE_FAN,
    EventType.TROUBLE,
    EventType.VISUAL_FAN,
    EventType.TROUBLE,
    EventType.VOCAL_FAN,

    EventType.GOAL
]

// 道の方向
export const roadDirection: [number, number][] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
];