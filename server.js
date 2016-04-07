var mongojs = require('mongojs');
var express = require('express');
var bodyParser = require('body-parser');
var assert = require('assert');
var path = require('path');
var crypto = require('crypto');
var morgan = require('morgan');

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
var collections = ['cats', 'users', 'corrals'];
var db = mongojs(dbUrl, collections);

db.on('connect', function () {
    console.log('database connected');
});

app.use(express.static(__dirname + '/public'));

app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/views/login.html'));
});

app.post('/login', function(req, res) {
  if (!req.body.user || !req.body.pass) {  
    res.send('Username and password both required');
    return;
  }

  crypto.randomBytes(128, function (err, salt) {
    if (err) { throw err; }
    db.users.findOne({user: req.body.user}, function(err, doc) {
    	if (err) {res.send('there was an error logging in'); return;}
    	if (!doc) {res.send('could not find user'); return;}
	    crypto.pbkdf2(req.body.pass, doc.salt, 7000, 256, 
	      function (err, hash) {
	        if (err) { throw err; }
	        	if (err) {res.send('there was an error logging in'); return;}

	        	if (!doc) {res.send('could not find user'); return;}
	        	if (doc.salt && (doc.hash === (new Buffer(hash).toString('hex')))) {

	        		res.send('you are now logged in as ' + req.body.user);
	        	}
	           });
	      });
  });

});

app.get('/register', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/views/regform.html'));
});

app.post('/register', function (req, res) {
  if (!req.body.user || !req.body.pass) {  
    res.send('Username and password both required');
    return;

  }
  
  crypto.randomBytes(128, function (err, salt) {
    if (err) { throw err; }
    salt = new Buffer(salt).toString('hex');
    crypto.pbkdf2(req.body.pass, salt, 7000, 256, 
      function (err, hash) {
        if (err) { throw err; }
        db.users.save({user: req.body.user, 
        	salt : salt, hash : (new Buffer(hash).toString('hex'))});
        res.send('Thanks for registering ' + req.body.user);
      });
  });
});

app.listen(3000, function() {
	console.log('Server opened on 3000');
});