var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var List = require("collections/list");
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//list of users
var list = new List("big oof", "MAMMOTH");

io.on('connection', function (socket) {
  //user connected, log then bind events


  //JOIN THE ROOM
  socket.on('join room', function (roomname) {
    socket.join(roomname);
    console.log('a user connected to room : ' + roomname);
    io.sockets.in(roomname).emit('connectToRoom', "You are in room : " + roomname);
  });

  //handle chat messages
  socket.on('chat message', function (data) {
    io.sockets.in(data.roomID).emit('chat message', 'Room ' + data.roomID + '... chat message: ' + data.message);
    //io.emit('chat message', msg);
    console.log('chat message', 'Room ' + data.roomID + '... chat message: ', data.message);
  });

  //user disconnect
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
