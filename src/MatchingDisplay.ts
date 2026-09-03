import { Player } from "./Player";

export class MatchingDisplay {
    private element: HTMLDivElement;
    private startButton: HTMLButtonElement;
    private playerNameElements: HTMLDivElement[] = [];
    private roomIdElement: HTMLDivElement;

    constructor(onStart: () => void) {
        this.element = document.createElement("div");
        this.element.id = "matching-display";

        // RoomID
        this.roomIdElement = document.createElement("div");
        this.roomIdElement.className = "matching-room-id";
        this.roomIdElement.textContent = "RoomID:???";
        this.element.appendChild(this.roomIdElement);

        // プレイヤー
        const playerList = document.createElement("div");
        playerList.className = "player-list";

        for (let i = 0; i < 4; i++) {
            const player = document.createElement("div");
            player.className = "player";

            const playerNumber = document.createElement("div");
            playerNumber.className = "player-name";
            playerNumber.textContent = `プレイヤー${i + 1}`;

            const playerName = document.createElement("div");
            playerName.className = "player-status";
            playerName.textContent = "???"

            player.appendChild(playerNumber);
            player.appendChild(playerName);
            playerList.appendChild(player);

            this.playerNameElements.push(playerName);
        }
        this.element.appendChild(playerList);

        // STARTボタン
        this.startButton = document.createElement("button");
        this.startButton.id = "matching-start-button";
        this.startButton.textContent = "START!";

        this.startButton.addEventListener("click", () => {
            onStart();
        });
        this.element.appendChild(this.startButton);

        const gameContainer = document.getElementById("game-container");
        if (gameContainer === null) {
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
        this.hide();
    }

    public setRoomID(roomId: string): void {
        this.roomIdElement.textContent = `RoomID:${roomId}`;
    }

    public setPlayerName(playerNumber: number, playerName: string): void {
        if (playerNumber < 0 || this.playerNameElements.length <= playerNumber) {
            throw new Error("プレイヤー番号が不正です");
        }
        this.playerNameElements[playerNumber].textContent = playerName;
    }

    public show(): void {
        this.element.style.display = "flex";
    }

    public hide(): void {
        this.element.style.display = "none";
    }
}