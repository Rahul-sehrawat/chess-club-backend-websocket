import { WebSocket } from "ws";
import { INIT_GAME, MOVE, MOVES_HISTORY } from "./messages";
import { Game } from "./Game";

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    public users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
        console.log("User added. Total users:", this.users.length);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        this.games = this.games.filter(game => {
            if (game.player1 === socket || game.player2 === socket) {
                if (game.player1 === socket && game.player2.readyState === WebSocket.OPEN) {
                    game.player2.send(JSON.stringify({ type: 'GAME_OVER', reason: 'Opponent disconnected' }));
                }
                if (game.player2 === socket && game.player1.readyState === WebSocket.OPEN) {
                    game.player1.send(JSON.stringify({ type: 'GAME_OVER', reason: 'Opponent disconnected' }));
                }
                return false; // Remove the game from the list
            }
            return true; // Keep the game in the list
        });
        console.log("User removed. Total users:", this.users.length);
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            this.users.forEach(userSocket => {
                if (userSocket !== socket && userSocket.readyState === WebSocket.OPEN) {
                    userSocket.send(JSON.stringify(message));
                    console.log("Forwarded message:", message);
                }
            });

            switch (message.type) {
                case INIT_GAME:
                    if (this.pendingUser) {
                        const game = new Game(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                        console.log("Game started between users.");
                    } else {
                        this.pendingUser = socket;
                        console.log("User waiting for a game.");
                    }
                    break;
                case MOVE:
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (game) {
                        game.makeMove(socket, message.payload.move);
                        console.log("Move made:", message.payload.move);
                    }
                    break;
                case MOVES_HISTORY:
                    const historyGame = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (historyGame) {
                        console.log("Move history:", message.payload);
                        historyGame.player1.send(JSON.stringify(message.payload));
                        historyGame.player2.send(JSON.stringify(message.payload));
                    }
                    break;
                default:
                    console.log("Unknown message type:", message.type);
                    break;
            }
        });

        socket.on('close', () => {
            this.removeUser(socket);
        });
    }
}
