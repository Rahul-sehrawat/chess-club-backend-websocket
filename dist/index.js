"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManger_1 = require("./GameManger");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManger = new GameManger_1.GameManager();
wss.on('connection', function connection(ws) {
    gameManger.addUser(ws);
    console.log("user added ");
    console.log("player active", gameManger.users.length);
    ws.on("disconnect", () => {
        gameManger.removeUser(ws);
    });
});
console.log('WebSocket server is running on ws://localhost:8080');
