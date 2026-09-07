export class WebSocketClient {
  private socket: WebSocket;

  constructor(
    url: string,
    onMessage: (data: any) => void
  ) {
    this.socket = new WebSocket(url);

    this.socket.addEventListener("open", () => {
      console.log("サーバーに接続しました");
    });

    this.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      console.log("サーバーから受信:", data);

      onMessage(data);
    });

    this.socket.addEventListener("error", (error) => {
      console.error("WebSocketエラー:", error);
    });

    this.socket.addEventListener("close", () => {
      console.log("サーバーとの接続が切れました");
    });
  }

  public createRoom(playerName: string): void {
    this.send({
      type: "create_room",
      name: playerName
    });
  }

  public joinRoom(playerName: string, roomId: string): void {
    this.send({
      type: "join_room",
      name: playerName,
      roomId: roomId
    });
  }

  private send(data: object): void {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.error("サーバーに接続されていません");
      return;
    }

    this.socket.send(JSON.stringify(data));
  }
}