var mongojs = require('mongojs');
var express = require('express');
var bodyParser = require('body-parser');
var assert = require('assert');
var path = require('path');

var app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// set CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use(morgan('dev'));

var dbUrl = 'mongodb://localhost:27017/mean-cats';
var db = mongojs(dbUrl, ['cats']);

app.use(express.static(__dirname + '/public'));

app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/views/index.html'));
});

app.listen(3000, function() {
	console.log('Server opened on 3000');
});