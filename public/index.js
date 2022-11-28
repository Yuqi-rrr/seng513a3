const newroom = document.querySelector('#creategame');
const infomain = document.querySelector('infomain');
const submitform = document.querySelector('#submit');
const password = document.querySelector('#password');
const myname = document.querySelector('#name');

const messagecode = document.querySelector('.infomain');
const socket = io();

let RoomCode = 0;
let CreateRoom = false;
let playerNum = 0;

messagecode.textContent = "Create room or Join room";

//Get your player number
socket.on('player-number', num => {
    console.log(playerNum);
    if(num == -1) {
        alert("full");
        console.log(playerNum);
    } else {
        playerNum = parseInt(num);
        if (playerNum == 1) {
            playerrole = "player1";
        } else if (playerNum === 2) {
            playerrole = "player2";
        }

        console.log(playerNum);
    }
});

newroom.addEventListener('click', function() {
    CreateRoom = true;
    let myid = Math.floor(Math.random() * 100000);
    console.log(myid);
    messagecode.textContent = "passcode is :" + myid;
    if(RoomCode == 0) {
        RoomCode = myid; 
    }
});

submit.addEventListener('click', function() {
    if (password.value == 0 && CreateRoom == false) {
        alert("Please enter passcode to join");
        return;
    }
    if (myname.value == 0) {
        alert("Please enter your name");
        return;
    }
    if (CreateRoom == true){
        socket.emit('room-number', RoomCode);
    } else {
        socket.emit('room-number', password.value);
    }
    socket.emit('player-name', myname.value);
    console.log(myname.value);
});
