const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

let roomID = 0;


//set static folder
app.use(express.static(path.join(__dirname,"public")));

//start server
server.listen(PORT, () => console.log(`server running on port ${PORT}`));

// handle a socket connection request from web client

const connections = [null, null, null];
io.on('connection', socket => {
    //console.log('New Web Socket Connection')
    //find an avaliable player
    let playerIndex = -1;
    for(const i in connections){
        if(connections[i] == null){
            playerIndex = i;
            break;
        }
    }

    //tell the connecting client what player number they are
    socket.emit('player-number', playerIndex);
    console.log(`Player ${playerIndex} has connected`);
    
    //ignore player 3
    if (playerIndex == -1) return;

    socket.on('room-number', room => {
        roomID = room;
        console.log(roomID);
    });

    socket.on('player-name', name => {
        console.log(name);
    });

})