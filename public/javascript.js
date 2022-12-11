let currentPlayer = 0;
let selectCards = new Set();
    let numPlayer = 0;
    const HOST = "127.0.0.1:3000";
    var socket = io.connect(HOST);
    $(function(){
      $("#startbtn").hide();
      $("#timer").hide();
      $("#myplayer").hide();
      $("#PassAndPlay").hide();
      $("#start").click(function (e) {
        doAjaxCall("GET", "start", null, (result) => {
          if(result == 0) alert("Not enough players! \nThree Players needed! \nCurrent number of players is: " + (numPlayer + 1));
      });
      });
      $("#1").click(()=>{
        doAjaxCall("POST", "login", {name: $("#myName").val()}, (result) => {
          currentPlayer = result;
        });
        $("#loginBox").hide();
        $("#startbtn").show();
      });

      socket.on("curPlayer", (arg) => {
        if(arg === 4) $("#start").hide();
        numPlayer = arg;
      });

      socket.on("hand", (arg) => {
        let landlord = -1;
        arg.forEach((player) => {
            if(player.landlord === true) landlord = player.id;
        });
        displayTurn(landlord);
        $("#myplayer").show();
        let left = true;
        $("#name").html(arg[currentPlayer].name);
          createHand(arg[currentPlayer].hand);
          for(let i = 0; i < arg.length; i++){
            if(i != currentPlayer && left){
              $("#leftName").html(arg[i].name);
              $("#lefttop").css("background-color", "gray");
              let table = "<table id='lefttable'";
              for(let j = 0; j < arg[i].hand.length; j++){
                table+= "<tr><td id='leftPlayerHand'>  </td><tr>"
              }
              $("#lefttop").html(table + "</table>");
              left = false;
            }else if(i != currentPlayer && !left){
              $("#rightName").html(arg[i].name);
              $("#righttop").css("background-color", "gray");
              let table = "<table id='righttable'";
              for(let j = 0; j < arg[i].hand.length; j++){
                table+= "<tr><td id='rightPlayerHand'>  </td><tr>"
              }
              $("#righttop").html(table + "</table>");
            }
          }
      });

      socket.on("prev", (arg)=>{
        let table = "<table id='middle'><tr>";
        for(let i = 0; i < arg.length - 1; i++){
          if(arg[i].symbol === 1 )
            table+= `<td class='middlehand'>${"A"}</td>`;
          else if(arg[i].symbol === 11)
            table+= `<td class='middlehand'>${"J"}</td>`;
          else if(arg[i].symbol === 12)
            table+= `<td class='middlehand'>${"Q"}</td>`;
          else if(arg[i].symbol === 13)
            table+= `<td class='middlehand'>${"K"}</td>`;
          else
            table+= `<td class='middlehand'>${arg[i].symbol}</td>`;
        }
        $("#centertop").html(table + "</tr></table>");
      });

      socket.on("timer", (arg)=>{
        $("#timer").show();
        $("#timer").html(arg);
        if(arg === 0){
          clickPass();
        }
      });

      socket.on("landlord", (arg)=>{
        displayTurn(arg);
      });

      socket.on("winner", (arg)=>{
        alert("Winner: " + arg);
      });
    })

    function displayTurn(landlord){
      if(landlord === currentPlayer){
        $("#PassAndPlay").show();
        $("#wait").hide();
      }else{
        $("#wait").show();
        $("#PassAndPlay").hide();
      }
    }


    function clickCard(card){
      if(card.id==='111'){
        if(selectCards.has(1)){
          $('#111').css("background-color","white");
          selectCards.delete(1);
        }
        else{
          $('#111').css("background-color","yellow");
          selectCards.add(1);
        }
      }
      else{
        if(selectCards.has(card.id)){
          $(`#${card.id}`).css("background-color","white");
          selectCards.delete(card.id);
        }
        else{
          $(`#${card.id}`).css("background-color","yellow");
          selectCards.add(card.id);
        }
      }
    }
    function doAjaxCall(method,  cmd, params, fcn) {
        $.ajax(
        "http://127.0.0.1:3000/" + cmd,
        {
            type: method,
            processData: true,
            data: params,
            dataType: "json",
            success: function (result) {  fcn(result) },
        });
    }
    function clickPass(){
      doAjaxCall("POST", "submit", {id: currentPlayer, set: "null"}, (result) => {
        console.log("was null");
      });
    }
    function clickPlay(){
      console.log("ClickPlay");
      console.log(selectCards);
      doAjaxCall("POST", "submit", {id: currentPlayer, set: JSON.stringify(Array.from(selectCards))}, (result) => {
        if(result)
        selectCards.clear();
        else console.log(result);
      });
    }
    function createHand(arg){
      arg=sortHand(arg);
      let mytable ="<tr>";
      for(let i=0;i<arg.length;i++){
        let mydisplay ="";
        if(parseInt(arg[i].symbol)===14){
          if(i===arg.length-1){
            mydisplay="Joker";
            mytable+=`<td class='seJ' id='${arg[i].id}' onclick = clickCard(this)>`+mydisplay+"</td>";
          }
          else{
            mydisplay="Joker";
            mytable+=`<td class='sfJ' id='${arg[i].id}' onclick = clickCard(this)>`+mydisplay+"</td>";
          }
        }
        else if(parseInt(arg[i].symbol)===15){
          if(i===arg.length-1){
            mydisplay="Joker";
            mytable+=`<td class='beJ' id='111' onclick = clickCard(this)>`+mydisplay+"</td>";
          }
          else{
            mydisplay="Joker";
            mytable+=`<td class='bfJ' id='111' onclick = clickCard(this)>`+mydisplay+"</td>";
          }
        }
        else{
          if(parseInt(arg[i].symbol)===11)
          {
            mydisplay="J";
          }
          else if(parseInt(arg[i].symbol)===12){
            mydisplay="Q";
          }
          else if(parseInt(arg[i].symbol)===13){
            mydisplay="K";
          }
          else if(parseInt(arg[i].symbol)===1){
            mydisplay="A";
          }
          else{
            mydisplay=arg[i].symbol;
          }
          if(i===arg.length-1){
            mytable+=`<td class='end' id='${arg[i].id}' onclick = clickCard(this)>`+mydisplay+"</td>";
          }
          else{
            mytable+=`<td class='front' id='${arg[i].id}' onclick = clickCard(this)>`+mydisplay+"</td>";
          }
        }
      }
      mytable+="</tr>";
      $("#myhand").html(mytable);
    }
    function sortHand(arg)
    {
      for(let i=0;i<arg.length-1;i++)
      {
        for(let j=i+1;j<arg.length;j++)
        {
          let a=parseInt(arg[i].symbol);
          let b=parseInt(arg[j].symbol);
          if(a>13){
            a+=3;
          }
          if(b>13){
            b+=3;
          }
          if(a<3){
            a+=13;
          }
          if(b<3){
            b+=13;
          }
          if(a<b)
          {
            let temp=arg[i];
            arg[i]=arg[j];
            arg[j]=temp;
          }
        }
      }
      return arg;
    }
