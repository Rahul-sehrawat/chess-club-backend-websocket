import { WebSocketServer } from 'ws';
import { GameManager } from './GameManger';

const wss = new WebSocketServer({ port: 8080 });


const gameManger = new GameManager();


wss.on('connection', function connection(ws) {
  gameManger.addUser(ws)
  console.log("user added ")
  console.log("player active",gameManger.users.length);
  ws.on("disconnect",()=> {gameManger.removeUser(ws)
  })

});

console.log('WebSocket server is running on ws://localhost:8080');

