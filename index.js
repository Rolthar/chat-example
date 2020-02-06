var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var List = require("collections/list");
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});



io.on('connection', function (socket) {
  //user connected, log then bind events

  socket.on('delete room', function (data) {
    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }

    try {
      var clients = findClientsSocket(data.currentRoom);
      console.log('Deleting room : ' + data.currentRoom);
      for (var client in clients) {
        client.leave(client.currentRoom);
        console.log(client.userID + ' left room : ' + data.currentRoom);

      }
    }
    catch (error) {
      console.error(error);
    }
  });


  //JOIN THE ROOM
  socket.on('join room', function (data) {
    //console.log("Raw Data Join Room: " + data);

    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
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

  socket.on('leave room', function (data) {
    //console.log("Raw Data Join Room: " + data);

    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }


    try {
      socket.leave(data.currentRoom);
      console.log(data.userID + ' left room : ' + data.currentRoom);
      io.sockets.in(data.currentRoom).emit('leave room', data.userID + ' left room : ' + data.currentRoom);
    }
    catch (error) {
      console.error(error);
    }
  });



  //handle chat messages
  socket.on('chat message', function (data) {


    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
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

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
