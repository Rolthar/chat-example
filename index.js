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
  socket.on('join room', function (data) {
    //console.log("Raw Data Join Room: " + data);

    try {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }
    catch (error) {
      console.error(error);
      //error because already an object
    }


    try {
      socket.join(data.currentRoom);
      console.log(data.userID + ' connected to room : ' + data.currentRoom);
      io.sockets.in(data.currentRoom).emit('connectToRoom', data.userID + ' connected to room : ' + data.currentRoom);
    }
    catch (error) {
      console.error(error);
    }
  });

  //handle chat messages
  socket.on('chat message', function (data) {
    console.log("Raw Data chat message: " + data);


    try {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }
    catch (error) {
      console.error(error);
      //error because already an object
    }


    try {
      io.sockets.in(data.roomID).emit('chat message', '[Room ' + data.roomID + '] [' + data.userID + '] message: ' + data.message);
      console.log('chat message', '[Room ' + data.roomID + '] [' + data.userID + '] message: ' + data.message);
    }
    catch (error) {
      console.error(error);
    }
  });

  //user disconnect
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
