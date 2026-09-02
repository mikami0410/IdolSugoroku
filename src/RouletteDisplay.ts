import { Roulette } from "./Roulette";

export class RouletteDisplay{
    private element: HTMLDivElement;

    constructor(){
        this.element = document.createElement("div");
        this.element.id = "roulette-display";
        const gameContainer = document.getElementById("game-container");
        if(gameContainer === null){
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
    }

    public show(roulette: Roulette, description: string): void{
        const deme = roulette.getDeme();
        this.element.innerHTML = `
            <div class="roulette-deme">
                ${deme}が出た！
            </div>
            <div class ="roulette-description">
                ${description}
            </div>
        `;
        this.element.style.display = "block";
    }

    public hide(): void{
        this.element.style.display = "none";
    }
}