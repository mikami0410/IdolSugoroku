import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export enum EventType {
    VOCAL_LESSON,
    DANCE_LESSON,
    VISUAL_LESSON,
    SELECT_LESSON,
    VOCAL_FAN,
    DANCE_FAN,
    VISUAL_FAN,
    TROUBLE,
    AUDITION,
    START,
    GOAL
}

export class Masu {
    private eventType: EventType;
    private eventTitle: string;
    private description: string;
    private positionX: number;
    private positionZ: number;

    private masu!: THREE.Object3D;

    constructor(eventType: EventType, eventTitle: string, discription: string, positionX: number, positionZ: number, scene: THREE.Scene) {
        this.eventType = eventType;
        this.eventTitle = eventTitle;
        this.description = discription;
        this.positionX = positionX;
        this.positionZ = positionZ;
        this.createMasu(scene);
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
            case EventType.AUDITION:
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