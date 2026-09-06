export class RoomIDDisplay {
    private element: HTMLDivElement;
    private input: HTMLInputElement;
    private enterButton: HTMLButtonElement;

    constructor(onEnter: (roomId: string) => void) {
        this.element = document.createElement("div");
        this.element.id = "room-id-display";
        const title = document.createElement("div");
        title.className = "room-id-title";
        title.textContent = "ルームIDを入力";

        // 入力欄
        this.input = document.createElement("input");
        this.input.id = "room-id-input";
        this.input.type = "text";
        this.input.placeholder = "ルームID";

        // 入室ボタン
        this.enterButton = document.createElement("button");
        this.enterButton.id = "room-id-enter-button";
        this.enterButton.textContent = "入室";

        this.enterButton.addEventListener("click", () => {
            const roomId = this.input.value.trim();
            if (roomId === "") {
                return;
            }
            onEnter(roomId);
        });

        this.element.appendChild(title);
        this.element.appendChild(this.input);
        this.element.appendChild(this.enterButton);
        const gameContainer = document.getElementById("game-container");
        if (gameContainer === null) {
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
        this.hide();
    }

    public show(): void {
        this.element.style.display = "flex";
        this.input.value = "";
        this.input.focus();
    }

    public hide(): void {
        this.element.style.display = "none";
    }
}