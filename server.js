var API = require('./API')
var bodyParser = require('body-parser')
var http = require('http');
var fs = require("fs");
var express = require('express');
var bcrypt = require('bcryptjs');
var app      = express();
var port     = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var User = require('./user')
function tmp_err(res, err)
{
	console.error("ERROR", err)
	res.status(520);
	res.end()
}

var API_PATH = '/API';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app
.use(express.static(__dirname + '/public'))
.get('/user/:user', function (req, res) {
	console.log(req.params)
	res.send('Hello World')
})
.use( bodyParser.json())
.use(bodyParser.urlencoded({
	extended: true
}));
app.post(API_PATH + '/actions', API.insertFunction)
	.post(API_PATH + '/actions/edit/:id', API.updateAction)
	.del(API_PATH + '/actions/:id', API.removeAction)
	.get(API_PATH + '/actions', API.getUserActions)
	.get(API_PATH + '/recommendations', API.getRecommendations);
// Register User
app.post('/register', function(req, res){
  var password = req.body.password;
	var newUser = {
    email: req.body.email,
    password: req.body.password
  };
	console.log('reg')
  User.createUser(newUser, function(err, user){
    if(err) throw err;
		//redirect
		console.log(err, user)
    res.send(user).end()
  });
});
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(    {
        usernameField: 'email',
        passwordField: 'password'
    },
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
     	if(isMatch){
     	  return done(null, user);
     	} else {
     	  return done(null, false, {message: 'Invalid password'});
     	}
     });
   });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
// Endpoint to login
app.post('/login', passport.authenticate('local'),
	function(req, res) {
		console.log("log", req.user)
		res.send(req.user.email);
	});
// Endpoint to get current user
app.get('/user', function(req, res){
  res.send(req.user.email);
})
app.get('/', function(req, res){
	res.setHeader('Content-Type', 'text/html'); //or text/plain
  res.end(`
		<form method="POST" action="login">
		<input name="email">
		<input name="password"><input type="submit"></form>
		<form method="POST" action="register">
		<input name="email">
		<input name="password"><input type="submit"></form>
		`);
})
app.get('/logout', function(req, res){
  req.logout();
  res.send(null)
});
app.listen(port);

/*
	 { duration: 1,
		 name: 'math',
		 min: 0,
		 max: 24,
		 split: 0.5,
		 priority: 2,
		 progress: 0 }
*/
