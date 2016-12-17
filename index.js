'use strict'
const http = require('http');
const express = require('express');
// const OAuth = require('../lib/oauth.js').OAuth;
const AuthAPI = require('splitwise-node');
const Horseman = require('node-horseman');

let app = express();

// let oa = new OAuth(
// 		'https://secure.splitwise.com/api/v3.0/get_request_token',
// 		'https://secure.splitwise.com/api/v3.0/get_access_token',
// 		'XtcFcRpKBdw3Xo593e2eAQqIVv01tfrNgJcRNxcj',
// 		'yBy1YRKY3MHfa9kaELSyqszNwYSvd8tmU94XmtmT',
// 		'1.0',
// 		'https://test-splitwise.herokuapp.com/',
// 		'HMAC-SHA1'
// 	);

let horseman = new Horseman();
var loginAction = function(actionCB) {
	horseman
	  .userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
	  .open('https://www.splitwise.com')
	  .click('.btn.btn-mint')
	  .type('#user_session_email', 'manthosh@gmail.com')
	  .type('#user_session_password', 'tvrM1991')
	  .click('input[type=submit]')
	  .wait(10000)
	  .log();
	  // .do(actionCB)
	  // .close();
}

var userOAuthToken, userOAuthTokenSecret;
var authApi;

var init = function() {
	try {
		// console.log('Init');
		// authApi = new AuthAPI(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
		// var userAuthUrl = authApi.getOAuthRequestToken()
		// 						.then(({ token, secret }) => {

	 //    								[userOAuthToken, userOAuthTokenSecret] = [token, secret];
	 //    								return authApi.getUserAuthorisationUrl(token);
		// 							});
		// userAuthUrl.then((uri) => {
		// 	loginAction(function() {
	 //      		horseman.openTab(uri)
	 //      				.click('input[value=Authorize]')
	 //      				.wait(10000);
		// 	});
		// }); 
		loginAction();
	}
	catch(err) {
		setTimeout(init,2000);
	}						
}

init();

app.get('/', (req, res) => {
    return res.end("<h1>Hello World</h1>");
})



app.get('/requestAccess', (req, res) => {
	init();
	res.end("Done!!");   							
})

app.get('/callback', (req, res) => {
	console.log("verifier");
	console.log(req.query.oauth_verifier);
	authApi.getOAuthRequestToken()
			.then(({ token, secret }) => {
				[userOAuthToken, userOAuthTokenSecret] = [token, secret];
				console.log("secrets");
				console.log(userOAuthToken);
				console.log(userOAuthTokenSecret);
				return res.end("<h1>Magizhchi</h1>");
			});				
})

var intervalTimeoutObj, splitwiseApi = null;
app.get('/start', (req, res) => {

	// horseman.do(function() {
	// loginAction(function() {	
	// 	if(splitwiseApi == null) {
	// 		splitwiseApi = authApi.getSplitwiseApi(userOAuthToken, userOAuthTokenSecret);
	// 	}
	// 	console.log(splitwiseApi);

	// 	splitwiseApi.getFriends().then((friendRes) => {
	// 								console.log("Manthosh");
	// 								console.log(friendRes);
	// 							});

	// 	splitwiseApi.__auth.get('https://secure.splitwise.com/api/v3.0/get_friend/2635429', splitwiseApi.oAuthToken, splitwiseApi.oAuthTokenSecret, function(response) {
	// 								console.log(response);
	// 								//return res.end("<h1>"+JSON.stringify(response)+"</h1>");
	// 							});
	// });	

	// if(splitwiseApi == null) {
	// 	splitwiseApi = authApi.getSplitwiseApi(userOAuthToken, userOAuthTokenSecret);
	// }

	// horseman.open('https://www.splitwise.com')
	// 		.wait(10000)
	// 		.evaluate(function(splitwiseApi) {
				
	// 				console.log(splitwiseApi);

	// 				splitwiseApi.getFriends().then((friendRes) => {
	// 											console.log("Manthosh");
	// 											console.log(friendRes);
	// 										});

	// 				splitwiseApi.__auth.get('https://secure.splitwise.com/api/v3.0/get_friend/2635429', splitwiseApi.oAuthToken, splitwiseApi.oAuthTokenSecret, function(response) {
	// 											console.log(response);
	// 											//return res.end("<h1>"+JSON.stringify(response)+"</h1>");
	// 										});
	// 		}, splitwiseApi)
	// 		 .close();

	horseman.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
			.open('https://secure.splitwise.com/api/v3.0/get_friend/2635429')
			.waitForSelector('pre')
			.html('pre')
			.then(function(response) {
				console.log(response);
				return res.end("<h1>"+JSON.stringify(response)+"</h1>")
			})
			.close();

    // return res.end("<h1>Started</h1>");	
})

app.get('/stop', (req, res) => {
	clearInterval(intervalTimeoutObj);
    return res.end("<h1>Stopped</h1>");
})

app.get('/status', (req, res) => {
	if(splitwiseApi == null) {
		splitwiseApi = authApi.getSplitwiseApi(userOAuthToken, userOAuthTokenSecret);
	}
	splitwiseApi.isServiceOk().then((status) => {
		return res.end("<h1>"+status+"</h1>");	
	});
    
})

// var getRequestToken = function(req, res) {
// 	oa.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {

// 	});
// }



http.createServer(app).listen(process.env.PORT || 3000)