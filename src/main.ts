import * as THREE from "three";
import { Masu, EventType } from "./Masu";
import { masuPosition, eventTypes } from "./Positions";
import { Road } from "./Road";
import { roadDirection } from "./Positions";
import { Player } from "./Player";
import { StatusDisplay } from "./StatusDisplay";
import { DescriptionDisplay } from "./DescriptionDisplay";
import { Roulette } from "./Roulette";
import { RouletteButton } from "./RouletteButton";
import { RouletteDisplay } from "./RouletteDisplay";
import { Koma } from "./koma";
import { PositionOffset } from "./koma";
import "./style.css";

async function main(): Promise<void> {
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

    // 背景隠す用
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    gameContainer.appendChild(overlay);

    // Three.jsの設定とか
    const width = 1280;
    const height = 720;

    function resize(): void {
        const scaleX = window.innerWidth / width;
        const scaleY = window.innerHeight / height;
        const scale = Math.min(scaleX, scaleY);
        gameContainer.style.setProperty("--game-scale", scale.toString());
    }

    resize();

    window.addEventListener("resize", resize);

    const scene = new THREE.Scene();
    const viewSize = 15;
    const camera = new THREE.OrthographicCamera(
        -viewSize * width / height,
        viewSize * width / height,
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
    const floorMaterial: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xececec });
    const floor: THREE.Mesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);

    // ステータス
    const statusDisplay = new StatusDisplay();
    statusDisplay.show(player);

    const eventList: EventType[] = [
        EventType.VOCAL_LESSON,
    ];


    const masus: Masu[] = []
    for (let i = 0; i < masuPosition.length; i++) {
        const [x, z] = masuPosition[i];
        masus[i] = new Masu(
            eventTypes[i],
            `マス${i}`,
            `イベントの内容`,
            x,
            z,
            scene
        )
        masus[i].createMasu(scene);
    }

    // マスの内容の表示
    const descriptionDisplay: DescriptionDisplay = new DescriptionDisplay();
    descriptionDisplay.hide();

    // 道
    for (let i = 0; i < masuPosition.length - 1; i++) {
        const [startX, startZ] = masuPosition[i];
        const [enxX, enxZ] = masuPosition[i + 1];
        const road = new Road(startX, startZ, enxX, enxZ, scene, roadDirection[i][0], roadDirection[i][1]);
    }

    // プレイヤーコマ
    const koma1 = new Koma(PositionOffset.UPPER_LEFT);
    await koma1.load(scene, masus[0]);

    const koma2 = new Koma(PositionOffset.UPPER_RIGHT);
    await koma2.load(scene, masus[0]);

    const koma3 = new Koma(PositionOffset.LOWER_LEFT);
    await koma3.load(scene, masus[0]);

    const koma4 = new Koma(PositionOffset.LOWER_RIGHT);
    await koma4.load(scene, masus[0]);

    // ルーレット
    const roulette = new Roulette(scene);
    const rouletteButton = new RouletteButton(roulette);

    const rouletteDisplay: RouletteDisplay = new RouletteDisplay();

    roulette.setRollingEnd(deme => {
        rouletteDisplay.show(roulette, `${deme}マス進む`);
        // ルーレット回した後の処理（進む場合の例）（ファンの数とかのは何かいい感じにしてほしい）
        let currentMasu = player.getMasuNumber();
        const nextMasu = Math.min(currentMasu + deme, masus.length - 1);
        for (let i = 0; i < deme; i++) {
            setTimeout(() => {
                if(currentMasu < nextMasu){
                    currentMasu ++;
                    koma1.setPosition(masus[currentMasu]);
                }
            }, 1000*(i+1));
        }
        setTimeout(() => {
            player.setMasuNumber(nextMasu);
            rouletteDisplay.hide();
            descriptionDisplay.show(masus[player.getMasuNumber()]);
        }, (deme+1)*1000);

        setTimeout(() => {
            descriptionDisplay.hide();
            statusDisplay.show(player);
        }, (deme+1)*1000 + 4000);
    });

    // 描画
    function animate(): void {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

main();
