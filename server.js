var bodyParser = require('body-parser')
var http = require('http');
var fs = require("fs");
var db = fs.existsSync(__dirname + "/data.json") ? JSON.parse(fs.readFileSync(__dirname + "/data.json").toString()) : {};
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

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
.post('/habit/add', function (req, res) {
	console.log(req.body);
 	var tmp = {name: req.body.name,
		duration: parseFloat(req.body.duration),
		priority: parseFloat(req.body.priority),
		split: parseFloat(req.body.split),
		min: parseInt(req.body.min.split(":")[0]) + req.body.min.split(":")[1] / 60,
		max: parseInt(req.body.max.split(":")[0]) + req.body.max.split(":")[1] / 60,
		week: [!!req.body['Monday'], !!req.body['Tuesday'], !!req.body['Wednesday'], !!req.body['Thursday'], !!req.body['Friday'], !!req.body['Saturday'], !!req.body['Sunday']]
	}
	console.log(tmp)
	res.send('Hello World')
});
function habitReminder(habits, hours)
{
	habits = JSON.parse(JSON.stringify(habits))
	var tmp = habits.filter(h => h.min <= hours && h.max >= hours && h.progress < h.duration);
	tmp.sort((a, b) => a.priority > b.priority);
	tmp = tmp.filter(x => x.priority == tmp[0].priority);
	tmp.sort((a, b) => ((a.split < (a.duration - a.progress)) ? a.split : (a.duration - a.progress)) - ((b.split < (b.duration - b.progress)) ? b.split : (b.duration - b.progress)));
	return (tmp);
}
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	socket.on('ask_recommendations', function (data) {
		socket.emit('new_recommendations', habitReminder(db[data.login].habits, data.hours))
	});
	socket.on('add_habit', function (data) {
		try {
			if (!db[data.pseudo])
				db[data.pseudo] = {habits: [], locked: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
		//TODO: IMPORTANT, SANITIZE INPUT U LAZY MORON
			db[data.pseudo].habits[data.habit.name] = data.habit;
		}
		catch(err)
		{
			console.error(err)
			socket.emit('error', 'add_habit_error');
		}
	});
	socket.on('remove_habit', function (data) {
		try {
			delete db[data.pseudo].habits[data.habit];
		}
		catch(err)
		{
			console.error(err);
			socket.emit('error', 'remove_habit_error');
		}
	});
	socket.on('choose_habit', function (data) {
		db[data.pseudo]
		try {
			db[data.pseudo].habits[data.habit].progress -= data.duration;
		}
		catch(err)
		{
			console.error(err);
			socket.emit('error', 'choose_habit_error');
		}
	});
	socket.on('lock_time', function (data) {
		try {
			db[data.pseudo].locked = data.locked
		}
		catch(err)
		{
			console.error(err);
			socket.emit('error', 'lock_time_error');
		}
	});
});

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
