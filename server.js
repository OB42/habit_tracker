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
var Datastore = require('nedb');
var db = {
	actions: new Datastore({ filename: __dirname + '/actions_db' })
}
db.actions.loadDatabase();
var API_PATH = '/API';
function formToDoc(body)
{
	return ({
		name: body.name,
		time_goal: parseFloat(body.duration),
		priority: parseFloat(body.priority),
		minimum_duration: parseFloat(body.split),
		availability: {
			//this is garbage
			min: parseInt(body.min.split(":")[0]) + body.min.split(":")[1] / 60,
			max: parseInt(body.max.split(":")[0]) + body.max.split(":")[1] / 60,
			week: [!!body['Monday'], !!body['Tuesday'], !!body['Wednesday'], !!body['Thursday'], !!body['Friday'], !!body['Saturday'], !!body['Sunday']]
		}
	})
}
var TMP_ID = "LPa8n7FtrVvXZMTU";//TODO:replace with auth' user id
function insertAction(data, callback)
{
	console.log('Creating action...', newDoc);
	db.actions.insert(data, callback);
}
function updateAction(ids, data, callback)
{
	console.log('Updating action...', newDoc);
	db.actions.update(ids, data, callback);
}
function removeAction(ids, callback)
{
	console.log('Removing action...', newDoc);
	db.actions.remove(ids, {}, callback);
}
function habitReminder(actions, hours)
{
	actions = JSON.parse(JSON.stringify(actions))
	var tmp = actions.filter(h => h.min <= hours && h.max >= hours && h.progress < h.duration);
	tmp.sort((a, b) => a.priority > b.priority);
	tmp = tmp.filter(x => x.priority == tmp[0].priority);
	tmp.sort((a, b) => ((a.split < (a.duration - a.progress)) ? a.split : (a.duration - a.progress)) - ((b.split < (b.duration - b.progress)) ? b.split : (b.duration - b.progress)));
	return (tmp);
}
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
}))
.post(API_PATH + '/actions', function (req, res) {
	try {
		var tmp_action = formToDoc(req.body).
		tmp_action.user_id = "blabla";
		createAction(tmp_action, (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(201);
			res.end();
		})
	}
	catch (err) { return tmp_err(res, err); }
})
//action update(badly implemented), use PATCH http verb
.post(API_PATH + '/actions/edit/:id', function (req, res) {
	try {
		updateAction({user_id: 'none for now', _id: req.params.id}, formToDoc(req.body), (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(201);
			res.end();
		})
	}
	catch (err) { return tmp_err(res, err); }
})
.del(API_PATH + '/actions/:id', function (req, res) {
	try {
		removeAction({"none for now": id, _id: req.params.id}, (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(200);
			res.end();
		});
	}
	catch (err) { return tmp_err(res, err); }
})
.get(API_PATH + '/actions', function (req, res) {
	try {
		var id = TMP_ID;//TODO:replace with authentified user id
		db.actions.find({ user_id: id }, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(docs));
		});
	}
	catch (err) { return tmp_err(res, err); }
})
.get(API_PATH + '/recommendations', function (req, res) {
	try {
		var id = TMP_ID;//TODO:replace with authentified user id
		db.actions.find({ user_id: id }, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(habitReminder(docs)));
		});
	}
	catch (err) { return tmp_err(res, err); }
});

// Register User
app.post('/register', function(req, res){
  var password = req.body.password;
	var newUser = {
    login: req.body.login,
    password: req.body.password
  };
  User.createUser(newUser, function(err, user){
    if(err) throw err;
		//redirect
    res.send(user).end()
  });
});
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(    {
        usernameField: 'login',
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
		res.send(req.user.login);
	});

// Endpoint to get current user
app.get('/user', function(req, res){
  res.send(req.user.login);
})
app.get('/', function(req, res){
	res.setHeader('Content-Type', 'text/html'); //or text/plain
  res.end(`
		<form method="POST" action="login">
		<input name="login">
		<input name="password"><input type="submit"></form>
		<form method="POST" action="register">
		<input name="login">
		<input name="password"><input type="submit"></form>
		`);
})

// Endpoint to logout
app.get('/logout', function(req, res){
  req.logout();
  res.send(null)
});
app.listen(8080);

/*
	 { duration: 1,
		 name: 'math',
		 min: 0,
		 max: 24,
		 split: 0.5,
		 priority: 2,
		 progress: 0 }
*/
