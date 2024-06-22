// import { WebSocketServer } from 'ws';
// // import { GameManager } from './GameManager';
// import { GameManager } from './GameManger';
// import * as dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// // Get the port number from environment variables
// const port = process.env.PORT || 8080;

// const wss = new WebSocketServer({ port: Number(port) });

// const gameManager = new GameManager();

// wss.on('connection', function connection(ws) {
//   gameManager.addUser(ws);
//   console.log("user added ");
//   console.log("player active", gameManager.users.length);
//   ws.on("disconnect", () => {
//     gameManager.removeUser(ws);
//     console.log("user removed")
//     console.log("player remain", gameManager.users.length);

//   });
// });

// console.log(`WebSocket server is running on ws://localhost:${port}`);


import { WebSocketServer } from 'ws';
import { GameManager } from './GameManger'
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
  console.log("players active", gameManager.users.length);

  ws.on("close", () => {  // Use 'close' event instead of 'disconnect'
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
