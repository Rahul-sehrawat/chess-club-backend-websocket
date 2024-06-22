"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.moveCount = 0;
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white",
                name: "player1",
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black",
                name: "player2",
            }
        }));
    }
    makeMove(socket, move) {
        // Validate turn
        if (this.moveCount % 2 === 0 && socket !== this.player1)
            return;
        if (this.moveCount % 2 === 1 && socket !== this.player2)
            return;
        console.log("The move is", move);
        // Validate and make the move
        try {
            const result = this.board.move(move);
            if (!result) {
                socket.send(JSON.stringify({ type: 'INVALID_MOVE', payload: { move } }));
                return;
            }
        }
        catch (e) {
            console.error("Move error:", e);
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: e.message } }));
            return;
        }
        // Notify both players about the move
        const moveMessage = JSON.stringify({
            type: messages_1.MOVE,
            payload: move
        });
        this.player1.send(moveMessage);
        this.player2.send(moveMessage);
        // Check for game over
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            const gameOverMessage = JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: { winner }
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
            console.log("Game over! Winner:", winner);
            return;
        }
        // Increment move count
        this.moveCount++;
    }
}
exports.Game = Game;
