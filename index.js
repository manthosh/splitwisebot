'use strict'
const http = require('http');
const express = require('express');

let app = express();


app.get('/', (req, res) => {
    return res.end("<h1>Hello World</h1>");
})


http.createServer(app).listen(process.env.PORT || 3000)