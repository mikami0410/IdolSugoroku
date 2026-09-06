export class PlayerNameDisplay {
    private element: HTMLDivElement;
    private input: HTMLInputElement;
    private enterButton: HTMLButtonElement;

    constructor(onEnter: (playerName: string) => void) {
        this.element = document.createElement("div");
        this.element.id = "player-name-display";
        // タイトル
        const title = document.createElement("div");
        title.className = "player-name-title";
        title.textContent = "プレイヤー名を入力";
        // 入力欄
        this.input = document.createElement("input");
        this.input.id = "player-name-input";
        this.input.type = "text";
        this.input.placeholder = "プレイヤー名";
        // 決定ボタン
        this.enterButton = document.createElement("button");
        this.enterButton.id = "player-name-enter-button";
        this.enterButton.textContent = "決定";

        this.enterButton.addEventListener("click", () => {
            const playerName = this.input.value.trim();
            if (playerName === "") {
                return;
            }
            onEnter(playerName);
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