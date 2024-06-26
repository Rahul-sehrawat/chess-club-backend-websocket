"use strict";
// import { WebSocketServer } from 'ws';
// // import { GameManager } from './GameManager';
// import { GameManager } from './GameManger';
// import * as dotenv from 'dotenv';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const ws_1 = require("ws");
const GameManger_1 = require("./GameManger");
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
// Get the port number from environment variables
const port = process.env.PORT || 8080;
const wss = new ws_1.WebSocketServer({ port: Number(port) });
const gameManager = new GameManger_1.GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addUser(ws);
    console.log("user added ");
    console.log("players active", gameManager.users.length);
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
