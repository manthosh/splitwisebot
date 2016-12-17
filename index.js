'use strict'
const http = require('http');
const express = require('express');
// const OAuth = require('../lib/oauth.js').OAuth;
const AuthAPI = require('splitwise-node');

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

app.get('/', (req, res) => {
    return res.end("<h1>Hello World</h1>");
})


var userOAuthToken, userOAuthTokenSecret;
var authApi;
app.get('/requestAccess', (req, res) => {
	authApi = new AuthAPI(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
	var userAuthUrl = authApi.getOAuthRequestToken()
    							.then(({ token, secret }) => {

        								[userOAuthToken, userOAuthTokenSecret] = [token, secret];
        								return authApi.getUserAuthorisationUrl(token);
    								});
	userAuthUrl.then((uri) => {
		var body = "Click <a href='"+uri+"'>here</a> to authenticate.";						
	    res.writeHead(200, {
	                    'Content-Length': body.length,
	                    'Content-Type': 'text/html' });
	    // console.log("Manthosh");
	    // console.log(uri);
	    return res.end(body);
	});    							
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
	if(splitwiseApi == null) {
		splitwiseApi = authApi.getSplitwiseApi(userOAuthToken, userOAuthTokenSecret);
	}
	console.log(splitwiseApi);

	// intervalTimeoutObj = setInterval(() => {
		// var vaishnavi = splitwiseApi.getFriend('2635429');
		// console.log(vaishnavi);
		// vaishnavi.then((friendRes) => {
		// 	console.log("Manthosh");
		// 	console.log(friendRes);
		// 	return res.end(friendRes);
		// });
		splitwiseApi.__auth.get('https://secure.splitwise.com/api/v3.0/get_friend/2635429', splitwiseApi.oAuthToken, splitwiseApi.oAuthTokenSecret, function(response) {
			console.log(response);
			return res.end("<h1>"+response+"</h1>");
		});
	// }, 10000);
		
    
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