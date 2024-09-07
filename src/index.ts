import { WebSocketServer } from 'ws';
import { GameManager } from './GameManger'
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: Number(port) });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);
  console.log("user added ");
  console.log("players active", gameManager.users.length);
  ws.send(JSON.stringify({ type: 'PLAYERS_ACTIVE', message: gameManager.users.length }));

  ws.on("close", () => {  
    gameManager.removeUser(ws);
    console.log("user removed");
    console.log("players remaining", gameManager.users.length);
  });
   
  ws.on('error', (error) => {
    console.log("WebSocket error:", error);
    gameManager.removeUser(ws);
    console.log("User removed due to error. Total users:", gameManager.users.length);
  });


});

console.log(`WebSocket server is running on ws://localhost:${port}`);
