"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const ws_1 = require("ws");
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
    }
    addHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            this.users.forEach(socket => {
                if (socket !== this.users[0] && socket.readyState === ws_1.WebSocket.OPEN) {
                    socket.send(JSON.stringify(message));
                    console.log("clock data", message.time);
                }
            });
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    //start
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }
            if (message.type === messages_1.MOVES_HISTORY) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log("last data", message.payload);
                    this.users[0].send(JSON.stringify(message.payload));
                    this.users[1].send(JSON.stringify(message.payload));
                }
            }
        });
    }
}
exports.GameManager = GameManager;
