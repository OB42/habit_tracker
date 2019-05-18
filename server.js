var bodyParser = require('body-parser')
var http = require('http');
var fs = require("fs");
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var Datastore = require('nedb');
// var io = require('socket.io')(server);
function tmp_err(res, err)
{
	console.error("ERROR", err)
	res.redirect("/");
}
var db = {
	actions: new Datastore({ filename: __dirname + '/actions_db' })
}
db.actions.loadDatabase();
var API_PATH = '/API'
app
.get('/', function (req, res) {
	res.send('Hello World')
})
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
		var tmp = {
			name: req.body.name,
			time_goal: parseFloat(req.body.duration),
			priority: parseFloat(req.body.priority),
			minimum_duration: parseFloat(req.body.split),
			availability: {
				//this is garbage
				min: parseInt(req.body.min.split(":")[0]) + req.body.min.split(":")[1] / 60,
				max: parseInt(req.body.max.split(":")[0]) + req.body.max.split(":")[1] / 60,
				week: [!!req.body['Monday'], !!req.body['Tuesday'], !!req.body['Wednesday'], !!req.body['Thursday'], !!req.body['Friday'], !!req.body['Saturday'], !!req.body['Sunday']]
			}
		}
		db.actions.insert(tmp, function (err, newDoc) {
			if (err) return tmp_err(res, err);
			console.log('Added new habit.', newDoc);
			res.status(201);
			res.end();
		});
	}
	catch (err) { return tmp_err(res, err); }
})
.get(API_PATH + '/actions', function (req, res) {
	try {
		var tmp_id = "LPa8n7FtrVvXZMTU";//TODO:replace with auth' user id
		db.actions.find({ user_id: tmp_id }, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(docs));
		});
	}
	catch (err) { return tmp_err(res, err); }
});
function habitReminder(actions, hours)
{
	actions = JSON.parse(JSON.stringify(actions))
	var tmp = actions.filter(h => h.min <= hours && h.max >= hours && h.progress < h.duration);
	tmp.sort((a, b) => a.priority > b.priority);
	tmp = tmp.filter(x => x.priority == tmp[0].priority);
	tmp.sort((a, b) => ((a.split < (a.duration - a.progress)) ? a.split : (a.duration - a.progress)) - ((b.split < (b.duration - b.progress)) ? b.split : (b.duration - b.progress)));
	return (tmp);
}
// var io = require('socket.io').listen(server);
//
// io.sockets.on('connection', function (socket) {
// 	socket.on('ask_recommendations', function (data) {
// 		socket.emit('new_recommendations', habitReminder(db[data.login].actions, data.hours))
// 	});
// 	socket.on('add_habit', function (data) {
// 		try {
// 			if (!db[data.pseudo])
// 				db[data.pseudo] = {actions: [], locked: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
// 		//TODO: IMPORTANT, SANITIZE INPUT U LAZY MORON
// 			db[data.pseudo].actions[data.habit.name] = data.habit;
// 		}
// 		catch(err)
// 		{
// 			console.error(err)
// 			socket.emit('error', 'add_habit_error');
// 		}
// 	});
// 	socket.on('remove_habit', function (data) {
// 		try {
// 			delete db[data.pseudo].actions[data.habit];
// 		}
// 		catch(err)
// 		{
// 			console.error(err);
// 			socket.emit('error', 'remove_habit_error');
// 		}
// 	});
// 	socket.on('choose_habit', function (data) {
// 		db[data.pseudo]
// 		try {
// 			db[data.pseudo].actions[data.habit].progress -= data.duration;
// 		}
// 		catch(err)
// 		{
// 			console.error(err);
// 			socket.emit('error', 'choose_habit_error');
// 		}
// 	});
// 	socket.on('lock_time', function (data) {
// 		try {
// 			db[data.pseudo].locked = data.locked
// 		}
// 		catch(err)
// 		{
// 			console.error(err);
// 			socket.emit('error', 'lock_time_error');
// 		}
// 	});
// });

server.listen(8080);

/*
	 { duration: 1,
		 name: 'math',
		 min: 0,
		 max: 24,
		 split: 0.5,
		 priority: 2,
		 progress: 0 }
*/
