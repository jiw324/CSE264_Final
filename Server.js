// Need to refactor this for speed

// Constants

const PORT = 3000;
const HOST = "127.0.0.1";

var http = require("http");
var express = require("express");
var path = require("path");
var publicPath = path.resolve(__dirname, "public");

/**
 * Card Object
 * ID for IDing each tag in html and for grabbing cards from array
 * Symbol is the actual value of the card, i.e what players see
 */
class Card{
    constructor(id, symbol){
        this.id = id;
        this.symbol = symbol;
    }
}

/**
 * PLayer object
 * ID of player 
 * Landlord for turn
 * Hand of player
 */
class Player{
    constructor(id, name, landlord, hand){
        this.id = id;
        this.name = name;
        this.landlord = landlord;
        this.hand = hand;
    }
}

// Generates a 54 cards
let cardList = [];
// A list of 3 players
let players = [];
// Current hand each player has
let playerHand = [];
// Name of each player
let playerName = [];
// Current player count
let playerCount = -1;
// A ranking of each card value
const cardranking = new Map();

let test = [];
// Holds the previously played set
let previousPlay = [];
// rank of the previously played set
let prevRank = -1;

// Generates 3 players with IDs 0,1,2, randomly picks a landlord and give each a 17 cards
function generatePlayer(){
    if(cardList.length === 0){
        generateCard();
    }
    let landlord = Math.floor(Math.random() * (2 - 0) + 0);
    shuffle(cardList);
    playerHand[0] = new Set(cardList.slice(0, 17));
    playerHand[1] = new Set(cardList.slice(18, 35));
    playerHand[2] = new Set(cardList.slice(36, 53));
    players[0] = new Player(0, playerName[0], landlord === 0 ? true : false, Array.from(playerHand[0]));
    players[1] = new Player(1, playerName[1], landlord === 1 ? true : false, Array.from(playerHand[1]));
    players[2] = new Player(2, playerName[2], landlord === 2 ? true : false, Array.from(playerHand[2]));    
}

// Generates a list of 54 cards and sets the ranking of each
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

// Checks a submitted set of cards for a valid submittion
function Combination(set){
    // Do a frequency sort on set before inputting
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

    // Check if submitted set is higher rank
    if(cardranking.get(temp[0].id) > prevRank) return false;
    switch(set.length){
        case(1):    // Checks single play card
            prevRank = cardranking.get(set[0].symbol);
            return true;
        case(2):    // Checks Pair or Two jokers
            if(temp[0].symbol === 2){
                prevRank = cardranking.get(temp[1].id);
                return true;
            }
            if(set[0].symbol === 14 && set[1].symbol == 15){
                prevRank = -1;
                return "rocket";
            }
            return false;
        case(3):    // Checks Triplets
            if(temp[0].symbol === 3){
                prevRank = cardranking.get(temp[0].id);
                return true;
            } 
            return false;
        case(4):    // Checks Quadplex 
            if(temp[0].symbol === 4){
                prevRank = 0;
                return "bomb";
            }       // Checks a Triplet and a single card
            else if(temp[0].symbol === 3 && temp[1].symbol === 1){
                prevRank = cardranking.get(temp[0].id);
                return true;
            }
            return false;
        case(5):    // Checks a Triplet and a Pair
            if(temp[0].symbol === 3 && temp[1].symbol === 2){
                prevRank = cardranking.get(temp[0].id);
                return true;
            }else return sequenceSet(temp); // Checks set for sequence set
        case(6):    // Checks a Quadplex plus two single cards
            if(temp[0].symbol === 4 && temp[1].symbol === 1 && temp[2].symbol === 1){
                prevRank = cardranking.get(temp[0].id);
                return true;
            } else return sequenceSet(temp); // Checks set for sequence set
        case(8):    // Checks a Quadplex and two pairs
        if(temp[0].symbol === 4 && temp[1].symbol === 2 && temp[2].symbol === 2){
            prevRank = cardranking.get(temp[0].id);
            return true;
        }else return sequenceSet(temp); // Checks set for sequence set
        default:
            return sequenceSet(temp); // Checks set for sequence set
    }
}

function sequenceSet(temp){
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
        if(counter === temp.length){
            prevRank = cardranking.get(temp[0].id);
            return true;
        }
        counter = additionalCards;
        // 3-of-a-kind Sequence plus pairs: Q-Q-Q-K-K-K-3-3-9-9
        for(let i = 0; i < additionalCards; i++){
            if(temp[i + additionalCards].symbol === 2) counter+=1;
        }
        if(counter === temp.length){
            prevRank = cardranking.get(temp[0].id);
            return true;
        }
        counter = 0;
    }
    // checks Pair Sequence (at least 3 pairs): 4-4-5-5-6-6
    for(let i = 1; i < temp.length; i++){
        if(temp[i].symbol === 2 && temp[i-1].symbol === 2 && temp[i].id - 1 === temp[i-1].id) counter+=1;
    }
    if(counter === temp.length){
        prevRank = 20;
        return true;
    }
    counter = 0;
    // checks Sequence (at least 5 cards): 3-4-5-6-7
    for(let i = 1; i < temp.length; i++){
        if(temp[i].id - 1 != temp[i-1].id) counter+=1;
    }
    if(counter === temp.length){
        prevRank = 20;
        return true;
    }
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
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(publicPath));

// Logs a player in and increment the number of players
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

// Starts the game only when there is enough players and deals each player a hand
app.get("/start", (req, res) => {
    header(res);
    if(playerCount === 2){
        io.sockets.emit("curPlayer", 4);
        io.sockets.emit("hand", players);
        res.write(JSON.stringify(1));
        res.end();
    }else{
        res.write(JSON.stringify(0));
        res.end();
    }
});

// Submittion of a combination of cards and checks it for validity 
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
   if(previousPlay[previousPlay.length] === req.body.id) prevRank = 20;
    let result = Combination(test);
    if(result){
        previousPlay = test;
        previousPlay[previousPlay.length] = req.body.id;
        changeTurn();
        timer();
    }
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

// Change a players turn by changing landlord status
function changeTurn(){
    let landlord = -1;
    players.forEach((player) => {
        if(player.landlord === true){
            landlord = player.id;
            player.landlord = false;
        } 
    });
    landlord = landlord - 1;
    if(landlord === -1) landlord = 2;
    players[landlord].landlord = true;
}


//https://stackoverflow.com/questions/31559469/how-to-create-a-simple-javascript-timer
function timer(){
    let landlord = -1;
    players.forEach((player) => {
        if(player.landlord === true) landlord = player.id;
    });
    var sec = 30;
    var timer = setInterval(function(){
        io.sockets.emit("landlord", landlord);
        io.sockets.emit("timer", sec);
        sec--;
        if (sec < 0) {
            clearInterval(timer);
        }
    }, 1000);
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