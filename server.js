// var request = require("request");
var API = require('./API');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require("fs");
var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var User = require('./user')
var API_ROUTE = '/API';
app.use(bodyParser.json())
	.use(bodyParser.urlencoded({ extended: false }))
	.use(cookieParser())
	.use(session({
		secret: 'secret',
		saveUninitialized: true,
		resave: true
 	}))
 	.use(passport.initialize())
	.use(passport.session())
	.use(express.static(__dirname + '/public'))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({extended: true}));
app.post(API_ROUTE + '/actions', API.insertFunction)
	.post(API_ROUTE + '/actions/edit/:id', API.updateAction)
	.del(API_ROUTE + '/actions/:id', API.removeAction)
	.get(API_ROUTE + '/actions', API.getUserActions)
	.get(API_ROUTE + '/recommendations', API.getRecommendations);
// Register User
app.post('/register', function(req, res){
	var newUser = {
		email: req.body.email,
		password: req.body.password
	};
	User.createUser(newUser, function(err){
		//todo catch err
		if (err) {
			console.error(err);
		}
		res.redirect('/')
	});
});
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
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
				if(isMatch)
					return done(null, user);
				else
					return done(null, false, {message: 'Invalid password'});
	 		});
		});
	}
));
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});
app.post('/login', passport.authenticate('local'),
	(req, res) => res.redirect('/dashboard'));
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});
app.get('/dashboard', function(req, res) {
	if (!req.user)
		return res.redirect('/');
	res.render('dashboard.ejs', {title: "Dashboard", user: req.user});
});
app.get('/', function(req, res) {
	res.render('index.ejs', {title: "LifeCoach", user: req.user});
});
app.listen(port);
