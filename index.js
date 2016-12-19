'use strict'
const http = require('http');
const express = require('express');
const Horseman = require('node-horseman');

let app = express();

let horseman = new Horseman();
horseman.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0');
var loginAction = function() {
	console.log("Logging in...");
	horseman
	  .open('https://www.splitwise.com')
	  .click('.btn.btn-mint')
	  .type('#user_session_email', 'manthosh@gmail.com')
	  .type('#user_session_password', 'tvrM1991')
	  .click('input[type=submit]')
	  .wait(10000)
	  .text('.dropdown-toggle')
	  .then((text) => {
	            console.log(text);
	   });
}

var getFriend = function(id) {
	return new Promise((fulfill, reject) => {
		horseman.open('https://secure.splitwise.com/api/v3.0/get_friend/'+id)
				.waitForSelector('pre')
				.html('pre')
				.then(function(response) {
					// console.log(response);
					// return JSON.parse(response);
					fulfill(JSON.parse(response));
				});
	});
}

var addExpense = function(firstName, amount) {
	console.log("Adding Expense...");
	horseman.open('https://secure.splitwise.com/#/all')
			.waitForSelector('a[data-original-title=Quick-add]')
			.click('a[data-original-title=Quick-add]')
			.type('#quickadd',firstName+' owes me '+amount)
			.click('button[data-loading-text=Add]')
			.wait(10000);
}

var isRunning = false;
var previousBalance = 0;
var friendIDToBePolled = 2635429;
var fetchBalance = function() {
		isRunning = true;
		var response = getFriend(friendIDToBePolled);
		// var response = getFriend(238606);
		response.then((friend) => {
			// console.log("Manthosh");
			// console.log(friend);

			if(friend) {
				if(friend.error == "Invalid API Request: you are not logged in") {
					loginAction();
					// fetchBalance();
				}
				else {
					var firstName = friend.friend.first_name;
					var balance = parseFloat(friend.friend.balance[0].amount);

					console.log(firstName+"=>"+balance);

					if(balance == 0) {
						addExpense(firstName, previousBalance);
					}
					previousBalance = balance;
				}
			}

		});
}

fetchBalance();
var intervalTimeoutObj = setInterval(fetchBalance, 30000);

app.get('/', (req, res) => {
    return res.end("<h1>Hello World</h1>");
})

app.get('/start', (req, res) => {
	if(isRunning) {
		return res.end("<h1>Alerady Running</h1>");	
	}
	else {
		fetchBalance();
		intervalTimeoutObj = setInterval(fetchBalance, 30000);
		return res.end("<h1>Started</h1>");	
	}
})

app.get('/stop', (req, res) => {
	if(isRunning) {
		clearInterval(intervalTimeoutObj);
		isRunning = false;
	    return res.end("<h1>Stopped</h1>");
	}
	else {
		return res.end("<h1>Already Stopped</h1>");	
	}
})

app.get('/changeid/:friendid', (req, res) => {
		var currentID = friendIDToBePolled;
		var newID = req.params.friendid;

		if(newID) {
			if(isNaN(newID)) {
				return res.end("<h1>Give a valid FriendID. So using the existing ID : "+currentID+"</h1>");
			}
			else {
				friendIDToBePolled = parseInt(newID);
				return res.end("<h1>Changed the ID from "+currentID+" to "+friendIDToBePolled+"</h1>");
			}
		}
		else {
			return res.end("<h1>Current ID : "+currentID+"</h1>");
		}
})

http.createServer(app).listen(process.env.PORT || 3000)