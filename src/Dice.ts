import * as THREE from "three";

export class Dice {
    private dice: THREE.Mesh;
    private isRollong: boolean = false;
    private result: number = 0;

    constructor(scene: THREE.Scene) {
        // 仮さいころ
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        this.dice = new THREE.Mesh(geometry, material);
        this.dice.position.set(0, 1, 0);
        scene.add(this.dice);
    }

    private startAnimation(): void {
        const startTime = performance.now();
        const duration = 1000;
        const startRotationX = this.dice.rotation.x;
        const startRotationY = this.dice.rotation.y;
        const startRotationZ = this.dice.rotation.z;

        const animate = (currentTime: number): void => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.dice.rotation.x = startRotationX + Math.PI * 6 * progress;
            this.dice.rotation.y = startRotationY + Math.PI * 8 * progress;
            this.dice.rotation.z = startRotationZ + Math.PI * 5 * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isRollong = false;
                console.log(this.result);
            }
        }
    }

    public roll(): void {
        if (this.isRollong) {
            return;
        }
        this.isRollong = true;
        this.result = Math.floor(Math.random() * 6) + 1;
        this.startAnimation();
    }

    public getResult(): number{
        return this.result;
    }
    public getDice(): THREE.Mesh{
        return this.dice;
    }
}