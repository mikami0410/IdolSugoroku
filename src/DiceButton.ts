import { Dice } from "./Dice";

export class DiceButton{
    private element: HTMLButtonElement;
    
    constructor(dice: Dice){
        this.element = document.createElement("button");
        this.element.id = "dice-button";
        this.element.textContent = "さいころを振る";
        const gameContainer = document.getElementById("game-container");
        if(gameContainer === null){
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
        this.element.addEventListener("click", ()=>{
            dice.roll();
        });
    }
}