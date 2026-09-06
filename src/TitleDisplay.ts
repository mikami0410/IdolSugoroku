export class TitleDisplay {

    private element: HTMLDivElement;

    private createRoomButton: HTMLButtonElement;

    private joinRoomButton: HTMLButtonElement;


    constructor(
        onCreateRoom: () => void,
        onJoinRoom: () => void
    ) {

        // タイトル画面
        this.element = document.createElement("div");

        this.element.id = "title-display";


        // タイトルとボタンを入れる場所
        this.element.innerHTML = `
            <div class="game-title">
                IDOL SUGOROKU
            </div>

            <div class="title-buttons"></div>
        `;


        // 部屋を作るボタン
        this.createRoomButton = document.createElement("button");

        this.createRoomButton.id = "create-room-button";

        this.createRoomButton.textContent = "部屋を作る";


        // 部屋に入るボタン
        this.joinRoomButton = document.createElement("button");

        this.joinRoomButton.id = "join-room-button";

        this.joinRoomButton.textContent = "部屋に入る";


        // ボタンを入れる場所
        const buttonContainer =
            this.element.querySelector(".title-buttons");

        if (buttonContainer === null) {

            throw new Error("title-buttonsが見つかりません");

        }


        // ボタンを追加
        buttonContainer.appendChild(this.createRoomButton);

        buttonContainer.appendChild(this.joinRoomButton);


        // 部屋を作るボタン
        this.createRoomButton.addEventListener("click", () => {

            onCreateRoom();

        });


        // 部屋に入るボタン
        this.joinRoomButton.addEventListener("click", () => {

            onJoinRoom();

        });


        // game-containerを取得
        const gameContainer =
            document.getElementById("game-container");

        if (gameContainer === null) {

            throw new Error("game-containerが見つかりません");

        }


        // タイトル画面をgame-containerに追加
        gameContainer.appendChild(this.element);

    }


    // 表示
    public show(): void {

        this.element.style.display = "flex";

    }


    // 非表示
    public hide(): void {

        this.element.style.display = "none";

    }

}