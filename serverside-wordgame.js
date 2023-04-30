let express = require('express'); //import express, because I want easier management of GET and POST requests.  
//let fs = require('fs');  //fs is used to manipulate the file system
let MySql = require('sync-mysql');  //MySql is used to manipulate a database connection
"use strict";

//set up the database connection 
const options = {
  user: 'mis113',
  password: 'LS1TGH',
  database: 'mis113jupiter',
  host: 'dataanalytics.temple.edu'
};

// create the database connection
const connection = new MySql(options);

let app = express();  //the express method returns an instance of a app object
app.use(express.urlencoded({extended:false}));  //use this because incoming data is urlencoded

app.use(function(req, res, next) {
    express.urlencoded({extended:false})
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();  //go process the next matching condition
  });

//supporting functions *******************************************************************
let makeGame = function(res,usertoken){
    let txtSQL1 = "SELECT word FROM words ORDER BY rand() LIMIT 1";
    let txtSQL2 = "INSERT INTO games (usertoken, secretword, displayword, " +
     "gussess, gussescounter, gamestatus) VALUES (?, ?, '_____',' ', 0, 'In Progress');";
     try{
        let result1 = connection.query(txtSQL1);
        let secretword = result1[0]['word'];
        var result2 = connection.query(txtSQL2,[usertoken, secretword]);
    }
    catch(e){
        console.log(e);
         // the e is called an exception, to get a more detailed view
        responseWrite(res, "Unexpected Error (makeGame)",500)
        return;
    }
    responseWrite(res,result2.insertId, 200);
    return;
 };

 let deleteGame =  function(res,gameid,usertoken){
    
    let txtSQL = "DELETE FROM games WHERE gameid =? AND usertoken =?";
    try{
       var result = connection.query(txtSQL,[gameid,usertoken]);
   }
   catch(e){
       console.log(e);
        // the e is called an exception, to get a more detailed view
       responseWrite(res, "Unexpected Error (deleteGame)",500)
       return;
   }
   responseWrite(res,"Gameid and Usertoken record deleted",200);
   return;
};

let putGame = function(res,gameid,usertoken,guess){
    guess = guess.toUpperCase();
    let txtSQL = "select secretword, displayword, gussess, " +
       " gussescounter, gamestatus " +
       " from games where gameid = ? and usertoken = ?";
  
    try{
      //note the use of var here.
        var results = connection.query(txtSQL, [gameid,usertoken]);
    } catch(e) {
      console.log(e);  // best practice 
      responseWrite(res,"Unexpected Error (getStatus)",500);
      return;  //woah.. 2 best practices in the same code block
    } // end try catch
  
    if (results.length == 0 ){
      responseWrite(res,"No game found (getStatus)",400);
      return;
    } else {
      let secretword = results[0]['secretword'];
      let displayword = results[0]['displayword'];
      let guesses = results[0]['gussess'];
      let guesscounter = results[0]['gussescounter'];
      let gamestatus = results[0]['gamestatus'];
      
      //console.log(secretword);
    
      if (gamestatus == 'In Progress'){
        if (secretword.indexOf(guess) >=0 ){
          //this IMHO is the tricky bit
          let newdisplayword = '';
          for(let i = 0; i < secretword.length; i++){
            if (secretword[i] == guess){
              newdisplayword = newdisplayword + guess;
            } else {
              newdisplayword = newdisplayword + displayword[i];
            }
          }
          if (newdisplayword.indexOf("_") == -1 ){
            gamestatus = "Win";
            createHistory(usertoken,secretword,gamestatus);
          }
  
       updateStatus(res,gameid,usertoken,newdisplayword,guesses,guesscounter,gamestatus,secretword);
  
        } else {
          //the guess was wrong
          guesscounter++;
          //console.log(guesscounter);
          //console.log(guesses);
          //console.log(");
          if (guesscounter > 5 && gamestatus=='In Progress'){
            gamestatus = 'Lost';
            guesscounter = 6;
            createHistory(usertoken,secretword,gamestatus);
          } else {
            guesses = guesses + guess + ' ';
          }
        updateStatus(res,gameid,usertoken,displayword,guesses,guesscounter,gamestatus,secretword);
        
        }
      } else {
        responseWrite(res,"The Game is already over. Start another game." + gamestatus,200);
        return;
      }
    }
   
  }; // end getStatus

  let updateStatus = function(res,gameid,usertoken,displayword,guesses,guesscounter,gamestatus,secretword){

    let txtSQL = "UPDATE games SET displayword = ?, " + 
    "gussess = ?, gussescounter = ?, gamestatus = ?, secretword = ? WHERE usertoken = ? AND gameid = ?";
    let txtSQL2 = "select * from games where gameid = ? and usertoken = ?"

    try{
       var result = connection.query(txtSQL,[displayword,guesses,guesscounter,gamestatus,secretword, usertoken, gameid]);
       var result2 = connection.query(txtSQL2,[gameid,usertoken])
   }
   catch(e){
       console.log(e);
        // the e is called an exception, to get a more detailed view
       responseWrite(res, "Unexpected Error (updateStatus)",500)
       return;
   }
   responseWrite(res,result2, 200);
   return;
};

  let historyTable = function(res,usertoken){
        
    let txtSQL = "SELECT * FROM history WHERE usertoken = ?";

    try{
       var result = connection.query(txtSQL,[usertoken]);
   }
   catch(e){
       console.log(e);
        // the e is called an exception, to get a more detailed view
       responseWrite(res, "Unexpected Error (historyTable)",500)
       return;
   }
   responseWrite(res,result, 200);
   return;

};

let createHistory =function(usertoken, secretword, gamestatus){
  let txtSQL = "INSERT INTO history (usertoken, secretword, gamestatus) VALUES (?,?,?) "
  try{
    var result = connection.query(txtSQL,[usertoken, secretword, gamestatus]);
}
catch(e){
    console.log(e);
     // the e is called an exception, to get a more detailed view
    //responseWrite(res, "Unexpected Error (createHistory)",500)
    return;
}
};
//responseWrite is a supporting function.  It sends 
// output to the API consumer and ends the response.
// This is hard-coded to always send a json response.
let responseWrite = function(res,Output,responseStatus){
    res.writeHead(responseStatus, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(Output));
    res.end();
};

//error trapping ************************************************************************
app.post("/game", function(req,res,next){
    let usertoken = req.body.usertoken;

    if (usertoken == undefined || usertoken == "" || isNaN(usertoken)){
        responseWrite(res, "POST to game requires a valid usertoken.", 400);
        return;
    }

    next();
});
app.delete("/game", function(req,res,next){
    let gameid = req.body.gameid;
    let usertoken = req.body.usertoken;

    if (gameid == undefined || gameid == "" || isNaN(gameid) ){
        responseWrite(res, "POST to game requires a valid gameid.", 400);
        return;
    }

    if (usertoken == undefined || usertoken == "" || isNaN(usertoken)){
        responseWrite(res, "POST to game requires a valid usertoken.", 400);
        return;
    }

    next();

});
app.put("/game", function(req,res,next){
    let gameid = req.body.gameid;
    let usertoken = req.body.usertoken;
    let guess = req.body.guess;

    if (gameid == undefined || gameid == "" || isNaN(gameid) ){
        responseWrite(res, "PUT to game requires a valid gameid.", 400);
        return;
    }

    if (usertoken == undefined || usertoken == "" || isNaN(usertoken)){
        responseWrite(res, "PUT to game requires a valid usertoken.", 400);
        return;
    }
    if (guess == undefined || guess == "" ){
        responseWrite(res, "PUT to game requires a valid guess.", 400);
        return;
    }
    
    next();

});
app.get("/history", function(req,res,next){
    
    let usertoken = req.query.usertoken;

    if (usertoken == undefined || usertoken == "" || isNaN(usertoken)){
        responseWrite(res, "GET to history requires a valid usertoken.", 400);
        return;
    }

    next();

    });

//event handlers ************************************************************************
app.post("/game", function(req,res){
    let usertoken = req.body.usertoken;
    makeGame(res,usertoken);
});

app.delete("/game", function(req,res){
    let usertoken = req.body.usertoken;
    let gameid = req.body. gameid;
    deleteGame(res, gameid, usertoken);

});
app.put("/game", function(req,res){
    let usertoken = req.body.usertoken;
    let gameid = req.body. gameid;
    let guess = req.body.guess;
    putGame(res, gameid, usertoken, guess);

});
app.get("/history", function(req,res){
    let usertoken = req.query.usertoken;
    historyTable(res, usertoken);
});
//what the app should do when it received a "GET" against the root
app.get('/', function(req, res) {
    //what to do if request has no route ... show instructions
    let message = [];
    
    message[message.length] = "POST to ./game with a usertoken to create a game. A gameid is returned.";
    message[message.length] = "DELETE on ./game sending a gameid and usertoken to end (delete) the game record.";
    message[message.length] = "PUT to ./game with a usertoken, gameid and guess to get a JSON response. The JSON " + 
    "response will indicate gamestatus (Win,Lost,In Progress), letters guessed, a word to display, and a message.";
    message[message.length] = "GET from /history with a usertoken. The JSON response will hold all win/loss history for that user.";
    message[message.length] = "This API was created by Rahman Mohammed."

	responseWrite(res,message,200);
    return
});
  
//This piece of code creates the server  
//and listens for requests on a specific port
//we are also generating a message once the 
//server is created
let server = app.listen(8213, "0.0.0.0" ,function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("The endpoint server is listening on port:" + port);
});