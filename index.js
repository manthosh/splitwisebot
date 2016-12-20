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
	  .waitForSelector('.dropdown-toggle')
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
var previousBalance = 38.98;
var friendIDToBePolled = 2635429;
var data = [];

var fetchBalance = function() {
		isRunning = true;
		var response = getFriend(friendIDToBePolled);
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

					if(data.length == 10) {
						data.splice(0, 1);
					}
					data.push([firstName, balance, Date.now()]);

					if(balance == 0) {
						addExpense(firstName, 38.98);
						// addExpense(firstName, previousBalance);
					}
					else {
						previousBalance = balance;
					}
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

app.get('/currentid', (req, res) => {
	return res.end("<h1>Current ID : "+friendIDToBePolled+"</h1>");
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
})

app.get('/status', (req, res) => {
	var body = "<table><thead><tr><td>Name</td><td>Balance</td><td>Time</td></tr></thead><tbody>";

	for(var i=data.length-1;i>-1;i--) {
		var color = data[i][1] == 0?"rgb(191, 114, 136)":"rgb(125, 191, 114)";
		body += "<tr style='background-color:"+color+"'><td>"+data[i][0]+"</td><td>"+data[i][1]+"</td><td><script>document.write(new Date("+data[i][2]+"))</script></td></tr>";
	}

	body += "</tbody></table>";

    res.writeHead(200, {
		'Content-Length': body.length,
		'Content-Type': 'text/html' });
	res.end(body);
})

http.createServer(app).listen(process.env.PORT || 30165)
