var http = require('http');
var fs = require("fs");
var db = fs.exists(__dirname + "./data.json") ? JSON.parse(fs.readFileSync(__dirname + "./data.json").toString()) : {};
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


var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
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
