const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

let roomcounter = []; //count up to 3
let roomturn = []; //store turns, should be zero; maybe not needed
let RoomNumber = []; //store all room ids
let Rooms = [];//all rooms with player names //2d array



//set static folder
app.use(express.static(path.join(__dirname,"public")));

//start server
server.listen(PORT, () => console.log(`server running on port ${PORT}`));

// handle a socket connection request from web client
io.on('connection', socket => {
    //check if name is recorded
    socket.on('check-name', kname =>{
        let nameexit = false;
        for(let i = 0; i < Rooms.length; i++){
            for(let j = 0; j < Rooms[i].length; j++){
                if (Rooms[i][j] === kname){
                    nameexit = true;
                    break;
                }
            }
        }
        console.log(nameexit);
        socket.emit('valid-name', nameexit);
    });

    //when player enters the gameboard, k: room, name
    socket.on('init-room', k =>{
        console.log(k[1]);
        console.log(k[0]);
        let roomcode = k[0];
        let myname = k[1];
        socket.userID = myname;
        console.log("uerID:")
        console.log(socket.userID);
        //roomcode exist
        if(RoomNumber.includes(roomcode)) {
            //index is the current room we looking at
            let index = RoomNumber.indexOf(roomcode);
            
            //if the room is full
            if(roomcounter[index] == 2){
                roomcounter[index] ++;
                for(let i = 0; i < 3; i++){
                    if(Rooms[index][i] === null){
                        Rooms[index][i] = myname;
                        break;
                    }
                }
                io.emit("game-ready", [roomcode,Rooms[index]]);
            } else if (roomcounter[index] < 2) {
                for(let i = 0; i < 3; i++){
                    if(Rooms[index][i] === null){
                        Rooms[index][i] = myname;
                        break;
                    }
                }
                roomcounter[index] ++;
               // console.log(Rooms[index]);
            }
        } else { //roomcode doesnot exist
            let myroom = [null,null,null]; 
            myroom[0] = myname;
            RoomNumber.push(roomcode);
            roomcounter.push(1);
            Rooms.push(myroom);
            roomturn.push(1);//not sure start from 1 or 0
        }
        console.log(Rooms);
        // console.log(roomcounter);
        // console.log(RoomNumber);
        // console.log(roomturn);
        console.log(socket.id);
    });

    //sends move k: room, name, lineid
    socket.on('mymove', k => {
        io.emit('other-move', k);
        console.log(k[0]);
        console.log(k[1]);
        console.log(k[2]);
    });

    //handle disconnection
    socket.on('disconnect', function() {
        console.log(socket.userID + 'got disconnected');
        for(let i = 0; i < Rooms.length; i++){
            for(let j = 0; j < Rooms[i].length; j++){
                if (Rooms[i][j] === socket.userID){
                    Rooms[i][j] = null;
                    roomcounter[i] --;
                }
            }
        }
        console.log(Rooms);
    })

})
