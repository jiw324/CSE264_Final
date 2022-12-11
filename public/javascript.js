let currentPlayer = 0;
    let numPlayer = 0;
    const HOST = "127.0.0.1:3000";
    var socket = io.connect(HOST);
    $(function(){
      $("#start").hide();
      $("#start").click(function (e) { 
        doAjaxCall("GET", "start", null, (result) => {
          if(result == 0) alert("Not enough players! \nThree Players needed! \nCurrent number of players is: " + (numPlayer + 1));
      });
      });
      let username = $("#myName").val();
      $("#1").click(function (e) {
        doAjaxCall("POST", "login", {name: username}, (result) => {
          currentPlayer = result; 
        });
        $("#loginBox").hide();
        $("#start").show();
      });

      socket.on("curPlayer", (arg) => {
        if(arg === 4) $("#start").hide();
        numPlayer = arg;
      });

      socket.on("hand", (arg) => {
          createHand(arg[currentPlayer].hand);
      });


    })

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




    function createHand(arg){
      arg=sortHand(arg);
      let mytable ="<tr>";
      for(let i=0;i<arg.length;i++){
        let mydisplay ="";
        if(parseInt(arg[i].symbol)===14){
          if(i===arg.length-1){
            mydisplay="Joker";
            mytable+="<td class='seJ'>"+mydisplay+"</td>";
          }
          else{
            mydisplay="Joker";
            mytable+="<td class='sfJ'>"+mydisplay+"</td>";
          }
        }
        else if(parseInt(arg[i].symbol)===15){
          if(i===arg.length-1){
            mydisplay="Joker";
            mytable+="<td class='beJ'>"+mydisplay+"</td>";
          }
          else{
            mydisplay="Joker";
            mytable+="<td class='bfJ'>"+mydisplay+"</td>";
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
            mytable+="<td class='end'>"+mydisplay+"</td>";
          }
          else{
            mytable+="<td class='front'>"+mydisplay+"</td>";
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