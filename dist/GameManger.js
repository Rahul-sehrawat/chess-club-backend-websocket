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
        console.log("User added. Total users:", this.users.length);
    }
    removeUser(socket, errorOccurred = false) {
        // Remove the user from the users array
        this.users = this.users.filter(user => user !== socket);
        // Find the game the user was part of
        this.games = this.games.filter(game => {
            if (game.player1 === socket || game.player2 === socket) {
                const opponent = game.player1 === socket ? game.player2 : game.player1;
                // If an error occurred, declare the opponent as the winner
                if (errorOccurred && opponent.readyState === ws_1.WebSocket.OPEN) {
                    opponent.send(JSON.stringify({ type: messages_1.GAME_OVER, payload: { winner: 'Opponent disconnected' } }));
                }
                // Close both players' WebSocket connections
                if (socket.readyState === ws_1.WebSocket.OPEN || socket.readyState === ws_1.WebSocket.CONNECTING) {
                    socket.close();
                }
                if (opponent.readyState === ws_1.WebSocket.OPEN || opponent.readyState === ws_1.WebSocket.CONNECTING) {
                    opponent.close();
                }
                // Remove the opponent from the users array
                this.users = this.users.filter(user => user !== opponent);
                return false; // Remove the game from the list
            }
            return true; // Keep the game in the list
        });
        console.log("User removed. Total users:", this.users.length);
    }
    addHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            this.users.forEach(userSocket => {
                if (userSocket !== socket && userSocket.readyState === ws_1.WebSocket.OPEN) {
                    userSocket.send(JSON.stringify(message));
                    console.log("Forwarded message:", message);
                }
            });
            switch (message.type) {
                case messages_1.INIT_GAME:
                    if (this.pendingUser) {
                        const game = new Game_1.Game(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                        console.log("Game started between users.");
                    }
                    else {
                        this.pendingUser = socket;
                        console.log("User waiting for a game.");
                    }
                    break;
                case messages_1.MOVE:
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (game) {
                        game.makeMove(socket, message.payload.move);
                        console.log("Move made:", message.payload.move);
                    }
                    break;
                case messages_1.MOVES_HISTORY:
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
        socket.on('error', (error) => {
            console.log("WebSocket error:", error);
            this.removeUser(socket, true);
        });
    }
}
exports.GameManager = GameManager;
