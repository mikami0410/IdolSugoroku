import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Masu } from "./Masu";

export enum PositionOffset {
    UPPER_LEFT,
    UPPER_RIGHT,
    LOWER_LEFT,
    LOWER_RIGHT
}

export class Koma {
    private koma!: THREE.Object3D;
    private positionOffset: PositionOffset;
    private offSetX!: number;
    private offSetZ!: number;

    constructor(position: PositionOffset) {
        this.positionOffset = position;
        switch (this.positionOffset) {
            case PositionOffset.UPPER_LEFT:
                this.offSetX = -0.7;
                this.offSetZ = -0.8;
                break;
            case PositionOffset.UPPER_RIGHT:
                this.offSetX = 0.7;
                this.offSetZ = -0.8;
                break;
            case PositionOffset.LOWER_LEFT:
                this.offSetX = -0.8;
                this.offSetZ = 1;
                break;
            case PositionOffset.LOWER_RIGHT:
                this.offSetX = 0.8;
                this.offSetZ = 1;
                break;
        }
    }

    public async load(scene: THREE.Scene, masu: Masu): Promise<void> {
        const loder = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
            loder.load("models/koma.glb", resolve, undefined, reject);
        });
        this.koma = gltf.scene;
        let color: THREE.Color;
        switch (this.positionOffset) {
            case PositionOffset.UPPER_LEFT:
                color = new THREE.Color(0xee3333);
                break;
            case PositionOffset.UPPER_RIGHT:
                color = new THREE.Color(0xeedd11);
                break;
            case PositionOffset.LOWER_LEFT:
                color = new THREE.Color(0xdd88cc);
                break;
            case PositionOffset.LOWER_RIGHT:
                color = new THREE.Color(0x11cccee);
                break;
        }
        this.koma.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }
            child.material = new THREE.MeshBasicMaterial({color: color});
        })
        this.koma.scale.set(7, 7, 7);
        this.koma.position.set(masu.getPositionX() + this.offSetX, 0.2, masu.getPositionZ() + this.offSetZ);
        scene.add(this.koma);
    }

    public setPosition(masu: Masu): void {
        if (!this.koma) {
            return;
        }
        this.koma.position.set(
            masu.getPositionX() + this.offSetX,
            0,
            masu.getPositionZ() + this.offSetZ
        );
    }

    public getObject(): THREE.Object3D {
        return this.koma;
    }
}