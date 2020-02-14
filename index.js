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
  var currentRoomId;

  socket.on('Update Client Rosters', function (data) {

    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }


    try {
      //broadcast to all clients in room except room host
      socket.broadcast.to(data.currentRoom).emit('Client Update Roster', data);
    }
    catch (error) {
      console.error(error);
    }
  });



  socket.on('delete room', function (data) {
    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }

    try {
      console.log('Deleting room : ' + data.currentRoom);

      io.sockets.in(data.currentRoom).emit('delete room', "The room [" + data.currentRoom + "] has been closed...");

      io.of('/').in(data.currentRoom).clients((error, socketIds) => {
        if (error) throw error;

        socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(data.currentRoom));
        console.log("A user Left room " + data.currentRoom);
      });

    }
    catch (error) {
      console.error(error);
    }
  });

  //   var room = io.sockets.adapter.rooms['my_room'];
  // return room.length > 0;
  socket.on('Does Room Exist', function (data) {
    //console.log("Raw Data Join Room: " + data);

    if (isJson(data)) {
      var parseddata = JSON.parse(data);
      data = parseddata;
    }


    try {

      var room = io.sockets.adapter.rooms[data.currentRoom];

      socket.emit('Does Room Exist', room.length > 0);
    }
    catch (error) {
      console.error(error);
      socket.emit('Does Room Exist', false);

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
      currentRoomId = data.currentRoom;
      console.log(data.userID + ' connected to room : ' + data.currentRoom);
      io.sockets.in(data.currentRoom).emit('connectToRoom', data.userID + ' connected to room : ' + data.currentRoom);

      //update host roster
      io.sockets.in(data.currentRoom).emit('Host Room Roster Update', data.userID);
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
      //io.sockets.in(data.currentRoom).emit('leave room', data.userID + ' left room : ' + data.currentRoom);
      io.sockets.in(data.currentRoom).emit('leave room', data);
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
  socket.on('disconnect', function (socket) {
    console.log(data.currentRoom + ' host user disconnected');
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
