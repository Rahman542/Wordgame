"use strict";

/* SOME CONSTANTS */
let endpoint01 = "https://misdemo.temple.edu/auth";
let endpoint02 = "https://mis3502-rmohammed.com/8213";
//let endpoint02 = "";

/* SUPPORTING FUNCTIONS */
let playGame = function(){
	$("#message_error").html("")
	$("#message_error").removeClass()
	var the_serialized_data = $("#form-play").serialize();
	console.log(the_serialized_data);
	var guess = $("#guesses").val()
	guess = guess.toUpperCase()
if (guess = ""  || guess < "A" || guess > "Z"){
	$("#message_error").html("The guess must not be a number and can not be blank.")
	$("#message_error").addClass("alert alert-danger")
	return;
}

	$.ajax({
		"url": endpoint02 + "/game", 
		"method": "PUT",
		"data": the_serialized_data,
		success: function(result){
			console.log(result)

			if (result[0].gamestatus == "In Progress"){
				$("#display_word").html(result[0]["displayword"]);
				$("#message_pastgussess").html("Past guesses: " + result[0]["gussess"]);
				$("#message_play").html("Guess Counter: " + result[0]["gussescounter"]);
				$("#guesses").focus()
				$("#guesses").val("")
			} else if(result[0].gamestatus == "Win") {
				$("#display_word").html(result[0]["displayword"]);
				$("#message_pastgussess").html("Past guesses: " + result[0]["gussess"]);
				$("#message_play").html("You Win!");
				$("#guesses").focus()
				$("#guesses").val("")
			} else if(result[0].gamestatus == "Lost"){
				$("#display_word").html(result[0]["displayword"]);
				$("#message_pastgussess").html("Past guesses: " + result[0]["gussess"]);
				$("#message_play").html("You Lost! The Correct Word was: " + result[0]["secretword"]);
				$("#guesses").focus()
				$("#guesses").val("")
			} else{
				$("#message_play").html("Your game is over. Please start another game.");
				$("#message_play").removeClass();
				$("#message_play").addClass("alert alert-danger");
				$("#guesses").focus()
				$("#guesses").val("")
			}

		},
		error: function(data){
			console.log(data);
		}
	
	}
	);
}

let makeGame = function(){
	let the_serialized_data = $("#form-play").serialize();
	console.log(the_serialized_data);
	$.ajax({
		"url": endpoint02 + "/game", 
		"method": "POST",
		"data": the_serialized_data,
		success: function(result){
			console.log(result);
			$("#gameid").val(result);
		},
		error: function(data){
			console.log(data);
		}
	
	}
	);
}

let deleteGame = function(){
	let the_serialized_data = $("#form-play").serialize();
	console.log(the_serialized_data);
	$.ajax({
		"url": endpoint02 + "/game", 
		"method": "DELETE",
		"data": the_serialized_data,
		success: function(result){
			console.log(result);
		
		},
		error: function(data){
			console.log(data);
		}
	
	}
	);

}

let getHistory = function(){
	console.log("Get History");
	let the_serialized_data = "usertoken="+localStorage.usertoken;
	console.log(the_serialized_data)
	$("#history-table").html('<tr><th colspan = "2" class = "text-white" style="background-color: #0492C2;">History</th></tr><tr><th>Secret Word</th><th>Result</th></tr>')
	$.ajax({
		"url": endpoint02 + "/history", 
		"method": "GET",
		"data": the_serialized_data,
		success: function(results){
			//$("#gameid").val(results);

			console.log(results)
			for(let i =0; i<results.length; i++){
				let txtRow ="<tr>";
				txtRow=txtRow+"<td>"+results[i]["secretword"]+"</td>";
				txtRow=txtRow+"<td>"+results[i]["gamestatus"]+"</td>";
				txtRow=txtRow+"</tr>";
				$("#history-table").append(txtRow); 
		}
		},
		error: function(data){
			console.log(data);
		}
	});
}
let loginController = function(){
	//clear any previous messages
	$('#login_message').html("");
	$('#login_message').removeClass();

	//first, let's do some client-side 
	//error trapping.
	let username = $("#username").val();
	let password = $("#password").val();
	if (username == "" || password == ""){
		$('#login_message').html('The user name and password are both required.');
		$('#login_message').addClass("alert alert-danger text-center");
		return; //quit the function now!  Get outta town!  Stop. 
	}
	
	//whew!  We didn't quit the function because of an obvious error
	//what luck!  Let's go make an ajax call now

	//go get the data off the login form
	let the_serialized_data = $('#form-login').serialize();
	//the data I am sending
	console.log(the_serialized_data);;
	$.ajax({
		"url" : endpoint01,
		"method" : "GET",
		"data" : the_serialized_data,
		"success" : function(result){
			console.log(result); //the result I got back
			if (typeof result === 'string'){
				// login failed.  Remove usertoken 
				localStorage.removeItem("usertoken");
				$('#login_message').html("Login Failed. Try again.");
				$('#login_message').addClass("alert alert-danger text-center");
			} else {
				//login succeeded.  Set usertoken.
				localStorage.usertoken = result['user_id']; 
				//console log the result ... a bad idea in prodcution
				//but useful for teaching, learning and testing
				console.log(result);
				//manage the appearence of things...
				$('#login_message').html('');
				$('#login_message').removeClass();
				$('.secured').removeClass('locked');
				$('.secured').addClass('unlocked');
				$('#div-login').hide(); //hide the login page
				$('#div-play').show();   //show the default page
				$("#guess").focus(); //set the focus
				$("#usertoken").val(localStorage.usertoken);
				$("#message_play").addClass("alert alert-info");
				$("#message_play").html("Guess Counter:");
				$("#message_pastgussess").html("Past guesses:");
				$("#message_pastgussess").addClass("alert alert-info");
				makeGame();
			}	
		},
		"error" : function(data){
			console.log("Something went wrong");
			console.log(data);
		},
	}); //end of ajax 

	//scroll to top of page
	$("html, body").animate({ scrollTop: "0px" });
};


/*
//the old Login Controller ... it used the getJSON method 
let loginController = function(){
	//clear any previous messages
	$('#login_message').html("");
	$('#login_message').removeClass();

	//first, let's do some client-side 
	//error trapping.
	let username = $("#username").val();
	let password = $("#password").val();
	if (username == "" || password == ""){
		$('#login_message').html('The user name and password are both required.');
		$('#login_message').addClass("alert alert-danger text-center");
		return; //quit the function now!  Get outta town!  Stop. 
	}
	
	//whew!  We didn't quit the function because of an obvious error
	//what luck!  Let's go make an ajax call now

	//go get the data off the login form
	let the_serialized_data = $('#form-login').serialize();
	//the data I am sending
	console.log(the_serialized_data);;
	$.getJSON(endpoint01,the_serialized_data, function(result){
		if (typeof result === 'string'){
			// login failed.  Remove usertoken 
			localStorage.removeItem("usertoken");
			$('#login_message').html(result);
			$('#login_message').addClass("alert alert-danger text-center");
		} else {
			//login succeeded.  Set usertoken.
			localStorage.usertoken = result['user_id']; 
			//console log the result ... a bad idea in prodcution
			//but useful for teaching, learning and testing
			console.log(result);
			//manage the appearence of things...
			$('#login_message').html('');
			$('#login_message').removeClass();
			$('.secured').removeClass('locked');
			$('.secured').addClass('unlocked');
			$('#div-login').hide(); //hide the login page
			$('#div-ABC').show();   //show the default page
		}
	}); //end of getJSON

	//scroll to top of page
	$("html, body").animate({ scrollTop: "0px" });
};
*/



//document ready section
$(document).ready(function (){
	$("#div-history").hide()
    /* ----------------- start up navigation -----------------*/	
    /* controls what gets revealed when the page is ready     */

    /* this reveals the default page */
	if (localStorage.usertoken){
		$("#div-play").show();
		$("#guesses").focus();
		$("#usertoken").val(localStorage.usertoken);
		$(".secured").removeClass("locked");		
		$(".secured").addClass("unlocked");
		$("#display_word").html("_____");
		$("#message_play").addClass("alert alert-info");
		$("#message_play").html("Guess Counter:");
		$("#message_pastgussess").html("Past guesses:");
		$("#message_pastgussess").addClass("alert alert-info");
		makeGame()
	}
	else {
		$("#div-login").show();
		$(".secured").removeClass("unlocked");
		$(".secured").addClass("locked");
	}

    /* ------------------  basic navigation -----------------*/	
    /* this controls navigation - show / hide pages as needed */

	/* links on the menu */
		
	/* what happens if the link-AAA anchor tag is clicked? */
	$('#link-login').click(function(){
		$(".content-wrapper").hide(); 	/* hide all content-wrappers */
		$("#div-login").show(); /* show the chosen content wrapper */
	});
		
	/* what happens if the link-BBB anchor tag is clicked? */
	
	$('#link-newgame').click(function(){
		$("#display_word").html("_____");
		$(".content-wrapper").hide(); 	
		$("#div-play").show(); 
		$("#message_play").removeClass();
		$("#message_play").addClass("alert alert-info");
		$("#message_play").html("Guess Counter:");
		//$("#message_play").addClass("alert alert-success");
		$("#message_pastgussess").html("Past guesses:");
		$("#message_pastgussess").addClass("alert alert-info");
		$("#message_error").html("")
		$("#message_error").removeClass()
		$("#guesses").val("")
		makeGame();
	});
	
	$('#link-play').click(function(){
		$(".content-wrapper").hide(); 	
		$("#div-play").show(); 
	});

	$('#link-history').click(function(){
		$(".content-wrapper").hide(); 	
		$("#div-history").show(); 
		getHistory();
	});

	/* what happens if any of the navigation links are clicked? */
	$('.nav-link').click(function(){
		$("html, body").animate({ scrollTop: "0px" }); /* scroll to top of page */
		$(".navbar-collapse").collapse('hide'); /* explicitly collapse the navigation menu */
	});

	$('#arrow').click(function(){
		//$("#message_play").removeClass();
		//$("#message_play").addClass("alert alert-success");
		//$("#message_pastgussess").html("Past guesses:");
		//$("#message_pastgussess").addClass("alert alert-info");
		playGame();
	});
	

	/* what happens if the login button is clicked? */
	$('#btnLogin').click(function(){
		loginController();
	});

	/* what happens if the logout link is clicked? */
	$('#link-logout').click(function(){
		// First ... remove usertoken from localstorage
		localStorage.removeItem("usertoken");
		deleteGame();
		// Now force the page to refresh
		window.location = "./index.html";
	});

}); /* end the document ready event*/