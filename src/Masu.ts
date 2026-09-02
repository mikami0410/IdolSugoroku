import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export enum EventType {
    VOCAL_LESSON = 1,
    DANCE_LESSON = 2,
    VISUAL_LESSON = 3,
    SELECT_LESSON = 4,
    VOCAL_FAN = 5,
    DANCE_FAN = 6,
    VISUAL_FAN = 7,
    TROUBLE = 8,
    ORDITION = 9,
    START = 10,
    GOAL = 11
}

export class Masu {
    private eventType: EventType;
    private eventTitle: string;
    private description: string;
    private positionX: number;
    private positionZ: number;

    private masu!: THREE.Object3D;

    constructor(eventType: EventType, eventTitle: string, discription: string, positionX: number, positionZ: number) {
        this.eventType = eventType;
        this.eventTitle = eventTitle;
        this.description = discription;
        this.positionX = positionX;
        this.positionZ = positionZ;
    }

    public createMasu(scene: THREE.Scene): void {
        const loder = new GLTFLoader();
        const modelPath = this.getModelPath();
        loder.load(modelPath, (gltf) => {
            this.masu = gltf.scene;
            this.masu.traverse((child) => {
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
                });
            });
            this.masu.position.set(this.positionX, 0, this.positionZ);
            this.masu.scale.set(10, 10, 10);
            scene.add(this.masu);
            console.log("マスを追加");
        });
    }

    public getModelPath(): string {
        switch (this.eventType) {
            case EventType.VOCAL_LESSON:
                return "/models/vocal_lesson.glb";
            case EventType.DANCE_LESSON:
                return "/models/dance_lesson.glb";
            case EventType.VISUAL_LESSON:
                return "models/visual_lesson.glb";
            case EventType.VOCAL_FAN:
                return "models/vocal_fan.glb";
            case EventType.DANCE_FAN:
                return "models/dance_fan.glb";
            case EventType.VISUAL_FAN:
                return "models/visual_fan.glb";
            case EventType.START:
                return "models/start.glb";
            case EventType.GOAL:
                return "models/goal.glb";
            case EventType.ORDITION:
                return "models/start.glb";
            case EventType.TROUBLE:
                return "models/trouble.glb";
            case EventType.SELECT_LESSON:
                return "models/vocal_lesson.glb";
            default:
                throw new Error("存在しないEventType : " + this.eventType);
        }
    }

    public getObject(): THREE.Object3D {
        return this.masu;
    }

    public getEventType(): EventType {
        return this.eventType;
    }

    public getEventTitle(): string{
        return this.eventTitle;
    }

    public getDiscription(): string {
        return this.description;
    }

    public getPositionX(): number{
        return this.positionX;
    }

    public getPositionZ(): number{
        return this.positionZ;
    }
}

// 20がオーディション