import { WebSocketServer } from 'ws';
// import { GameManager } from './GameManager';
import { GameManager } from './GameManger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get the port number from environment variables
const port = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: Number(port) });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);
  console.log("user added ");
  console.log("player active", gameManager.users.length);
  ws.on("disconnect", () => {
    gameManager.removeUser(ws);
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
