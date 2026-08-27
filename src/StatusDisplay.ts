import { Player } from "./Player";

export class StatusDisplay{
    private element: HTMLDivElement;

    constructor(){
        this.element = document.createElement("div");
        this.element.id = "status";
        const gameContainer = document.getElementById("game-container");
        if(gameContainer == null){
            throw new Error("game-containerが見つかりません");
        }
        gameContainer.appendChild(this.element);
    }

    public judgeRank(status: number): string{
        if(status <= 33){
            return "C";
        }else if(status <= 66){
            return "B";
        }else if(status <= 99){
            return "A";
        }else{
            return "S";
        }
    }

    public show(player: Player): void{
        const vocalRank = this.judgeRank(player.getVocal());
        const danceRank = this.judgeRank(player.getDance());
        const visualRank = this.judgeRank(player.getVisual());
        this.element.innerHTML = `
            <div class="status-name">
                ${player.getName()}
            </div>

            <div class="status-fan">
                ファン：${player.getFan()}人
            </div>

            <div class="status-parameter">
                <span>
                    vocal：
                    <span class="rank rank-${vocalRank}">
                        ${vocalRank}
                    </span>
                </span>
                <span>
                    vocal：
                    <span class="rank rank-${danceRank}">
                        ${danceRank}
                    </span>
                </span>
                <span>
                    vocal：
                    <span class="rank rank-${visualRank}">
                        ${visualRank}
                    </span>
                </span>
            </div>
        `;
        this.element.style.display = "block";
    }

    public hide(): void{
        this.element.style.display = "none";
    }

}