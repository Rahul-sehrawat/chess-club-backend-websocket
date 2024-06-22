import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE, MOVES_HISTORY } from './messages';
import WebSocket from 'ws';

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    private startTime: Date;
    private moveCount = 0;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.moveCount = 0;

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white",
                name: "player1",
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black",
                name: "player2",
            }
        }));
    }

    makeMove(socket: WebSocket, move: { from: string; to: string }) {
        // Validate turn
        if (this.moveCount % 2 === 0 && socket !== this.player1) return;
        if (this.moveCount % 2 === 1 && socket !== this.player2) return;
        console.log("The move is", move);

        // Validate and make the move
        try {
            const result = this.board.move(move);
            if (!result) {
                socket.send(JSON.stringify({ type: 'INVALID_MOVE', payload: { move } }));
                return;
            }
        } catch (e:any) {
            console.error("Move error:", e);
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: e.message } }));
            return;
        }

        // Notify both players about the move
        const moveMessage = JSON.stringify({
            type: MOVE,
            payload: move
        });
        this.player1.send(moveMessage);
        this.player2.send(moveMessage);

        // Check for game over
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            const gameOverMessage = JSON.stringify({
                type: GAME_OVER,
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
