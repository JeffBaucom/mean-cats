var mongojs = require('mongojs');
var express = require('express');
var bodyParser = require('body-parser');
var assert = require('assert');

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

var dbUrl = 'mongodb://localhost:27017/mean-cats';
var db = mongojs(dbUrl, ['cats']);

app.get('/api/cats', function(req, res) {
	db.collection('cats').find(function(err, docs) {
		res.send(docs);
	});
});

app.post('/api/cats', function(req, res) {
	db.collection('cats').insert(req.body, function(err, docs) {
		assert.equal(null, err);
		res.send('successful insert');
	});

});

app.get('/*', function(req, res) {
	res.send('successfully connected to mean-cat');

});

app.listen(3000, function() {
	console.log('Server opened on 3000');
});