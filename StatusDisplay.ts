import { Player } from "./src/Player";

export class StatusDisplay{
    private element: HTMLDivElement;

    constructor(){
        this.element = document.createElement("div");
        this.element.id = "status";
        document.body.appendChild(this.element);
    }

    public show(player: Player): void{
        this.element.innerHTML = `
            <div class="status-name">
                ${player.getName()}
            </div>

            <div class="status-fan">
                ファン：${player.getFan()}人
            </div>

            <div class="status-parameter">
                <span>vocal：${player.getVocal()}</span>
                <span>dance：${player.getDance()}</span>
                <span>visual：${player.getVisual()}</span>
            </div>
        `;
    }
}