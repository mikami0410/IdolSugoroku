import { ServerPlayerData } from "./Player";

export interface ServerBoardCell {
    number: number;
    type: number;
}

export interface GameState {
    gameStarted: boolean;
    currentTurn: number;
    turnOrder: number[];
    players: ServerPlayerData[];
}

export interface ServerMessage {
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