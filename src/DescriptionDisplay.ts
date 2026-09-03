import { error } from "three";
import {Masu} from "./Masu";

export class DescriptionDisplay{
    private element: HTMLDivElement;

    constructor(){
        this.element = document.createElement("div");
        this.element.id = "masu";
        const gameContainer = document.getElementById("game-container");
        if(gameContainer === null){
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
        this.hide();
    }

    public show(masu: Masu): void{
        this.element.innerHTML = `
            <div class="masu-title">
                ${masu.getEventTitle()}
            </div>
            <div class="masu-description">
                ${masu.getDiscription()}
            </div>
        `;
        this.element.style.display = "block";
    }

    public hide(): void{
        this.element.style.display = "none";
    }
}