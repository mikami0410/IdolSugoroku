export class RouletteButton{
    private element: HTMLButtonElement;

    constructor(onClick: () => void) {
        this.element = document.createElement("button");
        this.element.id = "roulette-button";
        this.element.textContent = "ルーレットを回す";

        const gameContainer = document.getElementById("game-container");

        if (gameContainer === null) {
            throw new Error("game-containerが見つかりません");
        }

        gameContainer.appendChild(this.element);

        this.element.addEventListener("click", onClick);
    }

    public setDisabled(disabled: boolean): void {
        this.element.disabled = disabled;
    }
}