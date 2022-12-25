const newroom = document.querySelector('#creategame');
const infomain = document.querySelector('infomain');
const submitform = document.querySelector('#submit');
const password = document.querySelector('#password');
const myname = document.querySelector('#name');

const messagecode = document.querySelector('.infomain');
const socket = io();

let RoomCode = 0; //newroom
let CreateRoom = false;
let playerNum = 0;
let JoinCode = 0; //joinroom
let nameexit = true;
messagecode.textContent = "Create room or Join room";

//Get your player number
// socket.on('player-number', num => {
//     console.log(playerNum);
//     if(num == -1) {
//         alert("full");
//         console.log(playerNum);
//     } else {
//         playerNum = parseInt(num);
//         if (playerNum == 1) {
//             playerrole = "player1";
//         } else if (playerNum === 2) {
//             playerrole = "player2";
//         } else if (playerNum == 0) {
//             playerrole = "player3";
//         }

//         console.log(playerNum);
//     }
// });

newroom.addEventListener('click', function() {
    CreateRoom = true;
    let myid = makeid();
    messagecode.textContent = "passcode is :" + myid;
    RoomCode = myid;
    //n = myname.value;
    //socket.emit('new-room', RoomCode);
});

function makeid(){
    let id = Math.floor(Math.random()*90000) + 10000;
    return id;
}

submit.addEventListener('click', function() {

    console.log(myname.value);
    console.log(RoomCode);
   

    if (password.value == 0 && CreateRoom == false) {
        alert("Please enter passcode to join");
        return;
    }
    if (myname.value == 0) {
        alert("Please enter your name");
        return;
    }
    if (CreateRoom == false){
        if (RoomCode == 0) {
            RoomCode = password.value;
        }
        //console.log("ok");
        //socket.emit('room-number', password.value);
    } 

    socket.emit('check-name', myname.value);
    socket.on('valid-name', k =>{
        nameexit = k;
        console.log('k');
        console.log(k);
        if(nameexit == false) {
            window.location.href = "http://localhost:3000/main.html" + "?room=" + RoomCode + "&username=" + myname.value;

        } else {
            alert("Name already exist");
            return;
        }

    });





    //socket.emit('player-name', myname.value);
});

