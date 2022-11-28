/**
 * code.js
 * javascript file for dot and boxes
 * Yuqi Su
 */

/*initialization of additionals in A3 */
let gameMode = "";
let playerNum = 0;
let ready = false;
let enemyReady = false;
//let shotfired = -1

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
let currentturn = 1;
let selected = [];
let boxes = [0,0,0,0,0,0,0,0,0,0];
let newBoxTurn = false;
let player = [0,0,0,0];
let message = `It is Player${currentturn}'s turn`;
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

/**
 * getnewturn(cur)
 * update new player turn based on current turn
 */
function getnewturn(cur){
    switch(cur){
        case 1: 
        case 2: currentturn++; break;
        case 3: currentturn = 1;
    }
}

// get instruction message before the start of game for the first player
getmessage();

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
            mygame(objectID); 
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
    
    //check for full box
    //change color
    //get next player's turn
    //update instruction messages
    getBoxUpdate(ID);
    AllLines[ID-1].style.backgroundColor = eval(`COLORP${currentturn}`);
    getnextturn();
    getmessage();

    //check for the end of game when all line is selected
    if (selected.length == 24){
        message="GAME OVER"
        getmessage();
        getwinner(player[1],player[2],player[3]);
        display();
    }

}

/**
 * getnextturn()
 * The player who completes a box, gets to add another (bonus) line
 * (gets a new turn)
 * otherwise, is the next player's turn.
 */
function getnextturn(){
    const pastturn = currentturn;
    //newBoxTurn gets updated in getBoxUpdate
    //True when a new box is completed by the player, who should gets a bonus turn
    if (newBoxTurn == false){
        getnewturn(currentturn);
        message = message = `It is Player${currentturn}'s turn`
    } else {
        message = `It is still Player${currentturn}'s turn`
    }
    //update hover
    AllLines.forEach(function (line) {
        line.classList.remove(`Lp${pastturn}`);
        line.classList.add(`Lp${currentturn}`);
    });
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
            //console.log(player);
            getscore();
        }
    });
}

/**
 * getmessage()
 * update message based on global value message
 */
function getmessage() {
    messagehere.textContent = message;
}

/**
 * getmessage()
 * update message based on global value message
 */
function getscore() {
    txt1.textContent = `PLAYER 1: ${player[1]}`;
    txt2.textContent = `PLAYER 2: ${player[2]}`;
    txt3.textContent = `PLAYER 3: ${player[3]}`;
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
        resulttxt = `PLAYER 1 wins with score ${player[1]}`;
    }
    else if(p2 > p1 && p2 > p3) {
        //p2
        resulttxt = `PLAYER 2 wins with score ${player[2]}`;
    }
    else if(p3 > p2 && p3 > p1) {
        //p3
        resulttxt = `PLAYER 3 wins with score ${player[3]}`;
    }
    else if(p1 == p2 && p2 > p3) {
        //1 2
        resulttxt = `PLAYER 1 and PLAYER 2 wins with score ${player[2]}`;
    }
    else if(p1 == p3 && p1 > p2) {
        //1 3
        resulttxt = `PLAYER 1 and PLAYER 3 wins with score ${player[1]}`;
    }
    else if(p3 == p2 && p2 > p1) {
        //3 2
        resulttxt = `PLAYER 2 and PLAYER 3 wins with score ${player[2]}`;
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
            window.location.href = "main.html";
        } else {

        }
        document.getElementById("demo").innerHTML = txt;
    },1000);
}
    







