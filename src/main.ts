
/*
// import * as THREE from "three";
import { Player } from "./Player";
import { StatusDisplay } from "../StatusDisplay";
import "./style.css";

const player = new Player("testPlayer");

player.setFan(100)
player.setVocal(10);
player.setDance(30);
player.setVisual(70);

const statusDisplay = new StatusDisplay();

statusDisplay.show(player);

*/

import * as THREE from "three";
import { Masu, EventType } from "./Masu";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(renderer.domElement);


// -------------------------
// マスを作成
// -------------------------

const masu1 = new Masu(
    EventType.VOCAL_LESSON,
    "ボーカルレッスン",
    0,
    0
);

masu1.createMasu(scene);


const masu2 = new Masu(
    EventType.DANCE_LESSON,
    "ダンスレッスン",
    3,
    0
);

masu2.createMasu(scene);

// -------------------------
// 描画
// -------------------------

function animate(): void {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();