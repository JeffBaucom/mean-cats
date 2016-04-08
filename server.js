var mongojs = require('mongojs');
var express = require('express');
var bodyParser = require('body-parser');
var assert = require('assert');
var path = require('path');
var crypto = require('crypto');
var morgan = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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

passport.use(new LocalStrategy(
	function(username, password, done) {
		db.users.findOne({user: username}, function(err, doc) {
			if (err) {return done(err);}
			if (!doc) {
				return done(null, false, {message: 'Incorrect username.'});
			}
			if (!validatePassword(doc, password)) {
				return done(null, false, {message: 'Incorrect password.'});
			}
			console.log("success");
			return done(null, doc);

		});
	}
));

validatePassword = function (userDoc, password) {
	var out = false;
	crypto.pbkdf2(password, userDoc.salt, 7000, 256, 
	    function (err, hash) {
	       
	        if (userDoc.salt && 
	        	(userDoc.hash === (new Buffer(hash).toString('hex')))) {
	        	out = true;
	        }
	    });
	console.log(out);
	return out;
};

app.use(express.static(__dirname + '/public'));

app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/views/login.html'));
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.send('Super dope successful login yo!');
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