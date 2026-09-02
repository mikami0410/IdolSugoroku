import * as THREE from "three";
import {Masu, EventType} from "./Masu";
import { masuPosition, eventTypes } from "./Positions";
import { Road } from "./Road";
import { roadDirection } from "./Positions";
import { Player } from "./Player";
import { StatusDisplay } from "./StatusDisplay";
import { DescriptionDisplay } from "./DescriptionDisplay";
import { Roulette } from "./Roulette";
import { RouletteButton } from "./RouletteButton";
import { RouletteDisplay } from "./RouletteDisplay";
import "./style.css";

// プレイヤー
const player = new Player("testPlayer");
player.setFan(100);
player.setVocal(10);
player.setDance(40);
player.setVisual(80);

// ゲーム画面
const gameContainer = document.createElement("div");
gameContainer.id = "game-container";
document.body.appendChild(gameContainer);

// Three.jsの設定とか
const width = 1280;
const height = 720;

function resize(): void{
    const scaleX = window.innerWidth/width;
    const scaleY = window.innerHeight/height;
    const scale = Math.min(scaleX, scaleY);
    gameContainer.style.setProperty("--game-scale", scale.toString());
}

resize();

window.addEventListener("resize", resize);

const scene = new THREE.Scene();
const viewSize = 15;
const camera = new THREE.OrthographicCamera(
    -viewSize*width/height,
    viewSize*width/height,
    viewSize,
    -viewSize,
    0.1,
    1000
);
camera.position.set(0, 10, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

gameContainer.appendChild(renderer.domElement);

//床
    const floorGeometry: THREE.BufferGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const floorMaterial: THREE.Material = new THREE.MeshBasicMaterial({color: 0xeeeeee});
    const floor: THREE.Mesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -0.5;
    scene.add(floor);

// ステータス
const statusDisplay = new StatusDisplay();
statusDisplay.show(player);

const eventList: EventType[] = [
    EventType.VOCAL_LESSON,
];


const masus: Masu[] = []
for(let i = 0; i < masuPosition.length; i++){
    const [x, z] = masuPosition[i];
    masus[i] = new Masu(
        eventTypes[i],
        "イベントのタイトル",
        `イベントの内容`,
        x,
        z
    )
    masus[i].createMasu(scene);
}

// マスの内容
const descriptionDisplay: DescriptionDisplay = new DescriptionDisplay();
descriptionDisplay.show(masus[1]);

// 道
for(let i = 0; i < masuPosition.length-1; i++){
    const [startX, startZ] = masuPosition[i];
    const [enxX, enxZ] = masuPosition[i+1];
    const road = new Road(startX, startZ, enxX, enxZ, scene, roadDirection[i][0], roadDirection[i][1]);
}

// ステータス、マス表示切替
let a = 0
renderer.domElement.addEventListener("click", () => {
    if(a%2 == 0){
        descriptionDisplay.hide();
        statusDisplay.show(player);
    }else{
        statusDisplay.hide();
        descriptionDisplay.show(masus[1]);
    }
    a++;
});

// ルーレット
const roulette = new Roulette(scene);
const rouletteButton = new RouletteButton(roulette);

const rouletteDisplay: RouletteDisplay = new RouletteDisplay();
rouletteDisplay.hide();
roulette.setRollingEnd(deme=>{
    rouletteDisplay.show(roulette, `${deme}マス進む`);
    setTimeout(() =>{
        roulette.hide();
    }, 1000);
});


// 描画

function animate(): void {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();