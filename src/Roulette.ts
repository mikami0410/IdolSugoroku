import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Roulette {
    private huti!: THREE.Object3D;
    private men!: THREE.Object3D;
    private deme!: number;
    private isRollong: boolean = false;
    private rollingEnd!: (deme: number) => void;

    constructor(scene: THREE.Scene) {
        const loder = new GLTFLoader();
        loder.load("models/huti.glb", (gltf) => {
            this.huti = gltf.scene;
            this.huti.traverse((child) => {
                if (!(child instanceof THREE.Mesh)) {
                    return;
                }
                const originalMaterial = child.material;
                let texture;
                if (originalMaterial instanceof THREE.MeshStandardMaterial) {
                    texture = originalMaterial.map;
                } else {
                    texture = null;
                }
                child.material = new THREE.MeshBasicMaterial({map: texture});
            });
            this.huti.position.set(0, 5, 0);
            this.huti.scale.set(5, 5, 5);
            scene.add(this.huti);
        });
        loder.load("models/men.glb", (gltf) => {
            this.men = gltf.scene;
            this.men.traverse((child) => {
                if (!(child instanceof THREE.Mesh)) {
                    return;
                }
                const originalMaterial = child.material;
                let texture;
                if (originalMaterial instanceof THREE.MeshStandardMaterial) {
                    texture = originalMaterial.map;
                } else {
                    texture = null;
                }
                child.material = new THREE.MeshBasicMaterial({map: texture});
            });
            this.men.position.set(0, 5, 0);
            this.men.scale.set(5, 5, 5);
            scene.add(this.men);
            this.hide();
        });
    }

    public decideDeme(): void {
        this.deme = Math.floor(Math.random() * 6) + 1;
    }

    public startRolling(): void {
        const startTime = performance.now();
        const duration = 3000;
        const startRotation = this.men.rotation.y;
        const rotations = 5 + Math.floor(Math.random() * 4);
        const resultRotation = -Math.PI/3*(this.deme - 1);
        let difference = resultRotation-(startRotation%(Math.PI*2));
        if(difference < 0){
            difference += Math.PI*2;
        }
        const endRotation = startRotation + Math.PI*2*rotations + difference;
        const animate = (currentTime: number): void => {
            const time = currentTime - startTime;
            const sintyoku = Math.min(time / duration, 1);
            const progress = 1 - Math.pow(1 - sintyoku, 3);
            this.men.rotation.y = startRotation + (endRotation - startRotation) * progress;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                console.log(this.deme);
                if(this.rollingEnd){
                    this.rollingEnd(this.deme);
                }

                setTimeout(()=>{
                    this.hide();
                }, 2000);
            }
        };
        requestAnimationFrame(animate);
    }

    public roll(): void {
        if (this.isRollong) {
            return;
        }
        this.isRollong = true;
        this.decideDeme();
        this.show();
        this.startRolling();
    }

    public show(): void{
        this.huti.visible = true;
        this.men.visible = true;
    }

    public hide(): void{
        this.huti.visible = false;
        this.men.visible = false;
        this.isRollong = false;
    }

    public getDeme(): number{
        return this.deme;
    }

    public setDeme(deme: number): void{
        this.deme = deme;
    }

    public setRollingEnd(callback: (deme: number)=>void): void{
        this.rollingEnd = callback;
    }

    public getIsRolling(): boolean{
        return this.isRollong;
    }
}