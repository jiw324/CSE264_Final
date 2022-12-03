// Need to refactor this for speed

// Constants

const PORT = 3000;
const HOST = "127.0.0.1";

var http = require("http");
var express = require("express");
var app = express();
var path = require("path");
var publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

class Card{
    constructor(id, symbol){
        this.id = id;
        this.symbol = symbol;
    }
}

class Player{
    constructor(id, landlord, hand){
        this.id = id;
        this.landlord = landlord;
        this.hand = hand;
    }
}

let cardList = [];
let playerHand = [];
let playerCount = 3;
const cardranking = new Map();

function generatePlayer(){
    if(cardList.length === 0){
        generateCard();
    }
    if(playerCount = 3){
        let landlord = Math.floor(Math.random() * (2 - 0) + 0);
        shuffle(cardList);
        playerHand[0] = new Player(0, landlord === 0 ? true : false, cardList.slice(0, 17));
        playerHand[1] = new Player(1, landlord === 1 ? true : false, cardList.slice(18, 35));
        playerHand[2] = new Player(2, landlord === 2 ? true : false, cardList.slice(36, 53));
    }
}

function generateCard(){
    cardList[0] = new Card(0, 14); // Red Joker
    cardList[1] = new Card(1, 15); // Black Joker
    if(cardranking.size === 0){
        cardranking.set(14, 1);
        cardranking.set(15, 2);
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
    switch(set.length){
        case(1):
            return true;
            break;
        case(2):
            if(set[0].symbol === set[1].symbol){
                return true;
            }
            if(set[0].symbol === 14 && set[1].symbol == 15){
                return "rocket";
            }
            break;
        case(3):
            if(set[0].symbol === set[1].symbol && set[0].symbol === set[2].symbol){
                return true;
            }
            break;
        case(4):
            if(set[0].symbol === set[1].symbol && set[0].symbol === set[2].symbol && set[0].symbol === set[3].symbol){
                return "bomb";
            }

            break;
        case(5):
            break;
        case(6):
            break;
        case(8):
            break;
        case(10):
            break;
    }
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


app.get("/generateHand", (req, res) => {
    generatePlayer();
    header(res);
    res.write("asd");
    req.on('end', function () {
        io.sockets.emit("hand", playerHand);
    })
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
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*"
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