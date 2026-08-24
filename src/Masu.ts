import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export enum EventType {
    VOCAL_LESSON = 1,
    DANCE_LESSON = 2,
    VISUAL_LESSON = 3,
    VOCAL_FAN = 4,
    DANCE_FAN = 5,
    VISUAL_FAN = 6,
    TROUBLE = 7,
    START = 8,
    GOAL = 9
}

export class Masu {
    private eventType: EventType;
    private discription: string;
    private positionX: number;
    private positionZ: number;

    private object!: THREE.Object3D;

    constructor(eventType: EventType, discription: string, positionX: number, positionZ: number) {
        this.eventType = eventType;
        this.discription = discription;
        this.positionX = positionX;
        this.positionZ = positionZ;
    }

    public createMasu(scene: THREE.Scene): void {
        const loder = new GLTFLoader();
        const modelPath = this.getModelPath();
        loder.load(modelPath, (gltf) => {
            this.object = gltf.scene;
            this.object.traverse((child) => {
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
                child.material = new THREE.MeshBasicMaterial({
                    map: texture
                })
            });
            this.object.position.set(this.positionX, 0, this.positionZ);
            scene.add(this.object);
            console.log("マスを追加");
        });
    }

    public getModelPath(): string {
        switch (this.eventType) {
            case EventType.VOCAL_LESSON:
                return "/models/vocal_lesson.glb";
            case EventType.DANCE_LESSON:
                return "/models/dance_lesson.glb";
            default:
                throw new Error("存在しないEventType : " + this.eventType);
        }
    }

    public getObject(): THREE.Object3D {
        return this.object;
    }

    public getEventType(): EventType {
        return this.eventType;
    }

    public getDiscription(): string {
        return this.discription;
    }
}