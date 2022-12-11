// Need to refactor this for speed

// Constants

const PORT = 3000;
const HOST = "127.0.0.1";

var http = require("http");
var express = require("express");
var path = require("path");
var publicPath = path.resolve(__dirname, "public");

class Card{
    constructor(id, symbol){
        this.id = id;
        this.symbol = symbol;
    }
}

class Player{
    constructor(id, name, landlord, hand){
        this.id = id;
        this.name = name;
        this.landlord = landlord;
        this.hand = hand;
    }
}

let cardList = [];
let playerHand = [];
let hands = [];
let playerName = [];
let playerCount = -1;
const cardranking = new Map();
let test = [];
let previousPlay = [];

function generatePlayer(){
    if(cardList.length === 0){
        generateCard();
    }
    let landlord = Math.floor(Math.random() * (2 - 0) + 0);
    shuffle(cardList);
    hands[0] = new Set(cardList.slice(0, 17));
    hands[1] = new Set(cardList.slice(18, 35));
    hands[2] = new Set(cardList.slice(36, 53));
    playerHand[0] = new Player(0, playerName[0], landlord === 0 ? true : false, Array.from(hands[0]));
    playerHand[1] = new Player(1, playerName[1], landlord === 1 ? true : false, Array.from(hands[1]));
    playerHand[2] = new Player(2, playerName[2], landlord === 2 ? true : false, Array.from(hands[2]));    
}

function generateCard(){
    cardList[0] = new Card(0, 14); // black Joker
    cardList[1] = new Card(1, 15); // red Joker
    if(cardranking.size === 0){
        cardranking.set(15, 1);
        cardranking.set(14, 2);
        cardranking.set(2, 3);
        cardranking.set(1, 4);
        cardranking.set(13, 5);
        cardranking.set(12, 6);
        cardranking.set(11, 7);
        cardranking.set(10, 8);
        cardranking.set(9, 9);
        cardranking.set(8, 10);
        cardranking.set(7, 11);
        cardranking.set(6, 12);
        cardranking.set(5, 13);
        cardranking.set(4, 14);
        cardranking.set(3, 15);
    }
    let tmp = 1;
    for(let i = 2; i <= 53; i+=4){
        cardList[i] = new Card(i, tmp);
        cardList[i+1] = new Card(i+1, tmp);
        cardList[i+2] = new Card(i+2, tmp);
        cardList[i+3] = new Card(i+3, tmp);
        tmp++;
    }
}

// Do a frequency sort on set before inputting
function Combination(set){
    let temp = [];
    for(let i = 0; i < set.length; i++){
        if(temp[set[i].symbol] === undefined){
            temp[set[i].symbol] = new Card(set[i].symbol, 1);
        }else{
            temp[set[i].symbol].symbol += 1;
        }
    }
    temp = temp.filter(function( element ) {
        return element !== undefined;
     });
    temp.sort(function(a,b){return b.symbol - a.symbol});
    switch(set.length){
        case(1):
            return true;
        case(2):
            if(temp[1].symbol === 2) return true;
            if(set[0].symbol === 14 && set[1].symbol == 15) return "rocket";
            return false;
        case(3):
            if(temp[0].symbol === 3) return true;
            return false;
        case(4):
            if(temp[0].symbol === 4)return "bomb";
            else if(temp[0].symbol === 3 && temp[1].symbol === 1) return true;
            return false;
        case(5):
            if(temp[0].symbol === 3 && temp[1].symbol === 2){
                return "bomb";
            }else return sequenceSet(temp);
        case(6):
            if(temp[0].symbol === 4 && temp[1].symbol === 1 && temp[2].symbol === 1){
                return true;
            } else return sequenceSet(temp);
        case(8):
        if(temp[0].symbol === 4 && temp[1].symbol === 2 && temp[2].symbol === 2){
            return true;
        }else return sequenceSet(temp);
        default:
            return sequenceSet(temp);
    }
}

function sequenceSet(temp){
    console.log(temp);
    let counter = 1;
    let additionalCards = 0;
    // checks 3-of-a-kind Sequence (at least 2): 7-7-7-8-8-8
    for(let i = 1; i < temp.length; i++){
        if(temp[i].symbol === 3 && temp[i-1].symbol === 3 && temp[i].id - 1 === temp[i-1].id) counter+=1;
    }
    additionalCards = counter;
    if(counter > 1 && temp.length - counter != counter) return false;
    else if(counter > 1){
        // checks 3-of-a-kind Sequence plus cards: 10-10-10-J-J-J-3-5
        for(let i = 0; i < additionalCards; i++){
            if(temp[i + additionalCards].symbol === 1) counter+=1;
        }
        if(counter === temp.length) return true;
        counter = additionalCards;
        // 3-of-a-kind Sequence plus pairs: Q-Q-Q-K-K-K-3-3-9-9
        for(let i = 0; i < additionalCards; i++){
            if(temp[i + additionalCards].symbol === 2) counter+=1;
        }
        if(counter === temp.length) return true;
        counter = 0;
    }
    // checks Pair Sequence (at least 3 pairs): 4-4-5-5-6-6
    for(let i = 1; i < temp.length; i++){
        if(temp[i].symbol === 2 && temp[i-1].symbol === 2 && temp[i].id - 1 === temp[i-1].id) counter+=1;
    }
    if(counter === temp.length) return true;
    counter = 0;
    // checks Sequence (at least 5 cards): 3-4-5-6-7
    for(let i = 1; i < temp.length; i++){
        if(temp[i].id - 1 != temp[i-1].id) counter+=1;
    }
    if(counter === temp.length) return true;
    return false;
}


//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

var bodyParser = require('body-parser');
var app = express();

// create application/json parser
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(express.static(publicPath));


app.post("/login", (req, res) => {
    header(res);
    playerName[playerCount] = req.body.name;
    playerCount += 1;
    io.sockets.emit("curPlayer", playerCount);
    if(playerCount == 2) {
        generatePlayer();
        res.write(JSON.stringify(2));
        res.end();
    }else {
        res.write(JSON.stringify(playerCount));
        res.end();
    }
});

app.get("/start", (req, res) => {
    header(res);
    if(playerCount === 2){
        io.sockets.emit("curPlayer", 4);
        io.sockets.emit("hand", playerHand);
        res.write(JSON.stringify(1));
        res.end();
    }else{
        res.write(JSON.stringify(0));
        res.end();
    }
});

app.get("/submit", (req, res) => {
    header(res);
    test[0] = new Card(1, 4);
    test[1] = new Card(2, 4);
    test[2] = new Card(3, 4);
    test[3] = new Card(4, 4);
    test[4] = new Card(5, 5);
    test[5] = new Card(6, 5);
    test[6] = new Card(5, 7);
    test[7] = new Card(6, 7);
    //test[8] = new Card(5, 1);
   // test[9] = new Card(6, 1);
    let result = Combination(test);
    if(result) previousPlay = test;
    res.write(JSON.stringify(result));
    res.end();
});


/*
 * Header adds a Content-Type header to the response indicating that all output
 * will be json formatted.
 */
function header(res) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
}

// Broadcast the current hand to all players.
function updateHand() {
    io.sockets.emit("hand", "world");
}

var server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

// Set up socket.io connection for sending card grids and player lists
var clientList = new Object();
io.on('connection',
  function (socket) {
    var clientIPAddress = socket.request.remoteAddress;
    console.log("New Connection from " + clientIPAddress);
    clientList[clientIPAddress] = 0;
  },
);

server.listen(PORT, HOST, () => { console.log(`Server running at http://${HOST}:${PORT}/`); });