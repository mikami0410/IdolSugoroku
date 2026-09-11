export interface ServerPlayerData {
    id: number;
    name: string;
    fans: number;
    position: number;
    finished: boolean;
    skills: {
        vocal: number;
        dance: number;
        visual: number;
    };
}

export class Player {
    private id: number;
    private name: string;
    private fan: number;
    private vocal: number;
    private dance: number;
    private visual: number;
    private masuNumber: number;
    private finished: boolean;

    constructor(name: string = "") {
        this.id = 0;
        this.name = name;
        this.fan = 0;
        this.vocal = 0;
        this.dance = 0;
        this.visual = 0;
        this.masuNumber = 0;
        this.finished = false;
    }

    public updateFromServer(serverPlayer: ServerPlayerData): void {
        this.id = serverPlayer.id;
        this.name = serverPlayer.name;
        this.fan = serverPlayer.fans;
        this.vocal = serverPlayer.skills.vocal;
        this.dance = serverPlayer.skills.dance;
        this.visual = serverPlayer.skills.visual;
        this.masuNumber = serverPlayer.position;
        this.finished = serverPlayer.finished;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getFan(): number {
        return this.fan;
    }

    public setFan(fanNumber: number): void {
        this.fan = fanNumber;
    }

    public getVocal(): number {
        return this.vocal;
    }

    public setVocal(newVocal: number): void {
        this.vocal = newVocal;
    }

    public getDance(): number {
        return this.dance;
    }

    public setDance(newDance: number): void {
        this.dance = newDance;
    }

    public getVisual(): number {
        return this.visual;
    }

    public setVisual(newVisual: number): void {
        this.visual = newVisual;
    }

    public getMasuNumber(): number {
        return this.masuNumber;
    }

    public setMasuNumber(masuNum: number): void {
        this.masuNumber = masuNum;
    }

    public isFinished(): boolean {
        return this.finished;
    }

    public setFinished(finished: boolean): void {
        this.finished = finished;
    }

    public getSkillRank(value: number): string {
        const ranks = ["C", "B", "A", "S"];
        if (value >= 100) {
            return ranks[3]; // Sランク
        } else if (value >= 67) {
            return ranks[2]; // Aランク
        } else if (value >= 34) {
            return ranks[1]; // Bランク
        } else {
            return ranks[0]; // Cランク
        }
    }

}