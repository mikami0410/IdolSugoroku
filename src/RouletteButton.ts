import { Roulette } from "./Roulette";

export class RouletteButton{
    private element: HTMLButtonElement;
    constructor(roulette: Roulette){
        this.element = document.createElement("button");
        this.element.id = "roulette-button";
        this.element.textContent = "ルーレットを回す";
        const gameContainer = document.getElementById("game-container");
        if(gameContainer === null){
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
        this.element.addEventListener("click", ()=>{
            if(roulette.getIsRolling()){
                return;
            }
            roulette.roll()
        });
    }
}