/**
 * app.js
 * javascript file for dot and boxes (with multiplayer)
 * Yuqi Su
 */
const socket = io();

/**
 * define constant
 */

// color
const COLORP1 = 'var(--color-P1)';
const COLORP2 = 'var(--color-P2)';
const COLORP3 = 'var(--color-P3)';

const BGP1 = 'var(--colorbg-P1)';
const BGP2 = 'var(--colorbg-P2)';
const BGP3 = 'var(--colorbg-P3)';

// lines connect to boxes. (i.e. line8 defined in main is connected to box1 and box 4, show as [1,4])
const lines = [
    ['0'],
    [1],[2],[3],
    [1],[1,2],[2,3],[3],
    [1,4],[2,5],[3,6],
    [4],[4,5],[5,6],[6],
    [4,7],[5,8],[6,9],
    [7],[7,8],[8,9],[9],
    [7],[8],[9]
];

/**
 * define global values updated in each functions, they are initialized.
 */
let currentturn = 0;
let selected = [];
let boxes = [0,0,0,0,0,0,0,0,0,0];
let newBoxTurn = false;
let player = [0,0,0,0];
let message = "Wait for all player is ready";
let resulttxt = " ";
let messagelanding = "";

/**
 * get every element needed from main.html.
 */
const main = document.getElementById('main');
const AllLines = document.querySelectorAll('.line');
const AllBoxes = document.querySelectorAll('.box');
const messagehere = document.querySelector('.message');
const result = document.querySelector('.result');
const txt1 = document.querySelector('.P1');
const txt2 = document.querySelector('.P2');
const txt3 = document.querySelector('.P3');


// value added additionally for multiplayer implementation
let RoomCode = 0;
let MyName = "";
let MyRoom = [];
let Ready = false;
let MyTurn = false;
const playerIndex = [1,2,3]; 
let myplayernum = 0;
let storebox = [0,0,0,0,0,0,0,0,0,0];
let storeline = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

//once enter gameboard send to server identity
window.onload = function() {
    let url = new URL(window.location.href);
    RoomCode = url.searchParams.get("room");
    MyName = url.searchParams.get("username");
    console.log(MyName);
    console.log(RoomCode);
    socket.emit('init-room',[RoomCode, MyName]);
}

//game ready, when three player is ready, game start
socket.on('game-ready', k =>{
    if(k[0] == RoomCode){
        Ready = true;
        MyRoom = k[1];
        getscore();
        console.log("ready");
        let index = MyRoom.indexOf(MyName);
        myplayernum = playerIndex[index];
    
        AllLines.forEach(function (line) {
            line.classList.remove(`Lp0`);
            line.classList.add(`Lp${myplayernum}`);
        });
        
        //check for disconnection
        let turn = MyRoom.concat('turn');
        if(localStorage.getItem(turn) != null){
            getstorage();
            console.log("has storage");
        } else {        
            console.log("no storage");
            if(MyRoom[0] === MyName) {
            MyTurn = true;
            currentturn = myplayernum;
        }

        }
    }
});

//deal with other's move:
//[RoomCode, MyName, ID]
socket.on('other-move', k =>{
    console.log(k);
    if(k[0] == RoomCode && k[1]!= MyName){
        let ID = k[2];
        let opName = k[1];
        let index = MyRoom.indexOf(opName);
        let opPlayerNum = playerIndex[index];
        //color
        //AllLines[ID-1].style.backgroundColor = eval(`COLORP${opPlayerNum}`);
        //determine next move is me?
        currentturn = opPlayerNum;
        console.log("2");
        mygame(ID);
        currentturn = 0;
        let nextp = getnewturn(opPlayerNum);
        console.log(nextp);
        console.log(myplayernum);
        if (nextp === myplayernum){
            currentturn = myplayernum;
            MyTurn = true;
            console.log("myturn");
        }
    }
});

//get player name based on turn
function getplayername(turn){
    let index = playerIndex.indexOf(turn);
    return MyRoom[index];
}

/**
 * getnewturn(cur)
 * update new player turn based on current turn
 */
function getnewturn(cur){
    let x = cur;
    switch(cur){
        case 1: 
        case 2: x++; break;
        case 3: x = 1;
    }
    return x;
}

//localstorage is set by each room
//is get by each room and player position

//set localstorage
function setstorage() {
    let turn = MyRoom.concat('turn');
    let score = MyRoom.concat('score');
    let box = MyRoom.concat('box');
    let line = MyRoom.concat('line');
    let sel = MyRoom.concat('selected');
    let boxxes = MyRoom.concat('boxes');
    localStorage.setItem(sel, JSON.stringify(selected));
    localStorage.setItem(boxxes, JSON.stringify(boxes));
    localStorage.setItem(turn, JSON.stringify(currentturn));
    localStorage.setItem(score, JSON.stringify(player));
    localStorage.setItem(box, JSON.stringify(storebox));
    localStorage.setItem(line, JSON.stringify(storeline));
}
//get localstorage
function getstorage() {
    let turn = MyRoom.concat('turn');
    let score = MyRoom.concat('score');
    let box = MyRoom.concat('box');
    let line = MyRoom.concat('line');
    let sel = MyRoom.concat('selected');
    let boxxes = MyRoom.concat('boxes');
    selected = JSON.parse(localStorage.getItem(sel));
    boxes = JSON.parse(localStorage.getItem(boxxes));
    currentturn = JSON.parse(localStorage.getItem(turn));
    player = JSON.parse(localStorage.getItem(score));
    storebox = JSON.parse(localStorage.getItem(box));
    storeline = JSON.parse(localStorage.getItem(line));
    
    for (let i = 0; i < storeline.length; i++){
        if(storeline[i]>0){
            let r = storeline[i];
            AllLines[i-1].style.backgroundColor = eval(`COLORP${r}`);
        }
    }

    for (let i = 0; i < storebox.length; i++){
        if(storebox[i]>0){
            let r = storebox[i];
            AllBoxes[i-1].style.backgroundColor = eval(`BGP${r}`);
        }
    }
}
//remove all localstorage from room
function removestorage() {
    let turn = MyRoom.concat('turn');
    let score = MyRoom.concat('score');
    let box = MyRoom.concat('box');
    let line = MyRoom.concat('line');
    let sel = MyRoom.concat('selected');
    let boxxes = MyRoom.concat('boxes');
    localStorage.removeItem(sel);
    localStorage.removeItem(boxxes);
    localStorage.removeItem(turn);
    localStorage.removeItem(score);
    localStorage.removeItem(box);
    localStorage.removeItem(line);
}


// get instruction message before the start of game for the first player
getmessage(0);

//onclick listens for users click only to lines (not yet been clicked)
main.addEventListener('click', clickonline);
function clickonline(e) {
    let objectclick = e.target;
    let objectID = objectclick.id.replace('line','');

    //if the clicked object is a line & if the line is not yet clicked by other user
    //is a valid move
    if (objectclick.id == 'line' + objectID){
        if(selected.includes(objectID)){
            return;
        } else {
            //check ready, check my turn
            if(Ready){
                if(MyTurn){
                    console.log("1");
                    mygame(objectID);
                    setstorage();
                    socket.emit('mymove',[RoomCode, MyName, objectID]);
                } else {
                    alert("not your turn");
                }
            } else {
                alert("not ready, game not started");
            }
        }
    }
}

/**
 * mygame(ID)
 * contains all game logic
 */
function mygame(ID) {

    //mark the clicked line as selected
    selected.push(ID);
    storeline[ID] = currentturn;
    console.log(selected);
    //check for full box
    //change color
    //get next player's turn
    //update instruction messages
    getBoxUpdate(ID);
    AllLines[ID-1].style.backgroundColor = eval(`COLORP${currentturn}`);
    getnextturn();
    getmessage(4);

    //check for the end of game when all line is selected
    if (selected.length == 24){
        message="GAME OVER";
        getmessage(1);
        getwinner(player[1],player[2],player[3]);
        display();
        //remove all after end game
        removestorage();
    }

}

/**
 * getnextturn()
 * The player who completes a box, gets to add another (bonus) line
 * (gets a new turn)
 * otherwise, is the next player's turn.
 */
function getnextturn(){
    //newBoxTurn gets updated in getBoxUpdate
    //True when a new box is completed by the player, who should gets a bonus turn
    if (newBoxTurn == false){
        MyTurn = false;
        //message = `It is Player ${getplayername(currentturn)}'s turn`
    } else {
        message = `It is still Player ${getplayername(currentturn)}'s turn`
    }
    //update hover
    // AllLines.forEach(function (line) {
    //     line.classList.remove(`Lp${pastturn}`);
    //     line.classList.add(`Lp${currentturn}`);
    // });
    //update to initial val
    newBoxTurn = false;
}
/**
 * getBoxUpdate(ID)
 * ID: line ID
 * check if there is new full box gets updated from adding ID
 */
function getBoxUpdate(ID) {
    //get neighbor boxes of ID
    let myline = lines[ID];
    //console.log(ID);
    //for each neighbor box, add one number of line (each box is made of 4 line)
    myline.forEach(function (i) {
        //console.log(i);
        const box = boxes[i];
        boxes[i]++;
        //when completes a box
        if (boxes[i] == 4) {
            newBoxTurn = true;
            AllBoxes[i-1].style.backgroundColor = eval(`BGP${currentturn}`);
            //update player score
            const curP = player[currentturn];
            player[currentturn] = curP+1;
            storebox[i] = currentturn;
            //console.log(player);
            getscore();
        }
    });
}

/**
 * getmessage()
 * update message based on global value message
 */
function getmessage(t) {
    if(MyTurn){
        message = "YOUR TURN";

    } else {
        message = "NOT YOUR TURN";
    }
    if(t ===1){
        message = "GAME OVER";
    } else if (t ===0){
        message = "WAIT WHEN ALL PLAYER IS READY";
    }
    messagehere.textContent = message;
}

/**
 * getmessage()
 * update message based on global value message
 */
function getscore() {
    txt1.textContent = `${MyRoom[0]}: ${player[1]}`;
    txt2.textContent = `${MyRoom[1]}: ${player[2]}`;
    txt3.textContent = `${MyRoom[2]}: ${player[3]}`;
}

/**
 * getwinner(p1,p2,p3)
 * p1: score of player 1
 * p2: score of player 2
 * p3: score of player 3
 * find the game result
 */
function getwinner(p1,p2,p3) {
    //console.log(p1,p2,p3);
    if(p1 == p2 && p1==p3){
        resulttxt = "Tie"
    }
    else if(p1 > p2 && p1 > p3) {
        //p1
        resulttxt = `${MyRoom[0]} wins with score ${player[1]}`;
    }
    else if(p2 > p1 && p2 > p3) {
        //p2
        resulttxt = `${MyRoom[1]} wins with score ${player[2]}`;
    }
    else if(p3 > p2 && p3 > p1) {
        //p3
        resulttxt = `${MyRoom[2]} wins with score ${player[3]}`;
    }
    else if(p1 == p2 && p2 > p3) {
        //1 2
        resulttxt = `${MyRoom[0]} and ${MyRoom[1]} wins with score ${player[2]}`;
    }
    else if(p1 == p3 && p1 > p2) {
        //1 3
        resulttxt = `${MyRoom[0]} and ${MyRoom[2]} wins with score ${player[1]}`;
    }
    else if(p3 == p2 && p2 > p1) {
        //3 2
        resulttxt = `${MyRoom[1]} and ${MyRoom[2]} wins with score ${player[2]}`;
    }
}

/**
 * display()
 * pop up window displays the game result and ask for another game.
 * resourse from: https://www.w3schools.com/js/js_popup.asp
 * function is delayed for completion of other game fuction
 */
function display() {
    setTimeout(function(){
        let txt = ". Do you want to play again?"
        if (confirm(resulttxt.concat(txt))) {
            window.location.href = "index.html";
        } else {

        }
        document.getElementById("demo").innerHTML = txt;
    },1000);
}
    







