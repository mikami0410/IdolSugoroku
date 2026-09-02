export class Player{
    private name: string;
    private fan: number;
    private vocal: number;
    private dance: number;
    private visual: number;
    private masuNumber: number;

    constructor(name: string){
        this.name = name;
        this.fan = 0;
        this.vocal = 0;
        this.dance = 0;
        this.visual = 0;
        this.masuNumber = 0;
    }

    public getName(): string{
        return this.name;
    }

    public getFan(): number{
        return this.fan;
    }

    public setFan(fanNumber: number): void{
        this.fan = fanNumber;
    }

    public getVocal(): number{
        return this.vocal;
    }

    public setVocal(newVocal: number): void{
        this.vocal = newVocal;
    }

    public getDance(): number{
        return this.dance;
    }

    public setDance(newDance: number): void{
        this.dance = newDance;
    }

    public getVisual(): number{
        return this.visual;
    }

    public setVisual(newVisual: number): void{
        this.visual = newVisual;
    }

    public getMasuNumber(): number{
        return this.masuNumber;
    }

    public setMasuNumber(masuNum: number): void{
        this.masuNumber = masuNum;
    }
}