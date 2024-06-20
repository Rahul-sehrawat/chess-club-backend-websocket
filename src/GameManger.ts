import { WebSocket } from "ws";
import { INIT_GAME, MOVE, MOVES_HISTORY } from "./messages";
import { Game } from "./Game";



export class GameManager{
    private games: Game[];
    private pendingUser :WebSocket | null ;
    public users: WebSocket[] ;
   

    constructor(){
        this.games = [];
        this.pendingUser = null;
        this.users = [];

    }
    
    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket){
        this.users = this.users.filter(user => user !== socket);
    }

    private addHandler(socket:WebSocket){
        socket.on('message',(data)=>{
            const message = JSON.parse(data.toString());

            this.users.forEach(socket => {
                if (socket !== this.users[0] && socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify(message));
                  console.log("clock data",message.time)
                }
              });
           

            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    //start
                    const game = new Game(this.pendingUser, socket)
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else{
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE){
                const game = this.games.find(game =>game.player1 === socket || game.player2 === socket);
                if(game){
                    game.makeMove(socket,message.payload.move);
                    
                    
                }
            }

            if(message.type === MOVES_HISTORY){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if(game){
                        
                    console.log("last data",message.payload)
                    this.users[0].send(JSON.stringify(message.payload))
                    this.users[1].send(JSON.stringify(message.payload))

                }

                
            }

        })
        
    
    }





}
