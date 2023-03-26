// Require the packages we will use:
const http = require("http"),
    fs = require("fs");

const port = 3456;
const file = "client.html";
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
const server = http.createServer(function (req, res) {
    // This callback runs when a new connection is made to our HTTP server.

    fs.readFile(file, function (err, data) {
        // This callback runs when the client.html file has been read from the filesystem.

        if (err) return res.writeHead(500);
        res.writeHead(200);
        res.end(data);
    });
});
server.listen(port);

//locally creating a data instead of using mysql
//[user]
class User {
    constructor(username, user_id) {
        this.username = username;
        this.user_id = user_id;
    }
    
  }
//[chat roooms]
class Chatroom{
constructor(room_name, room_id, creator, password) {
    this.room_name = room_name;
    this.room_id = room_id;
    this.creator = creator;
    this.password = password;
    this.members = [];
    this.banned = [];
    this.messages = [];
} 
}

//[messages]
class Message{
    constructor(msg_id, room_id, text) {
        this.msg_id = msg_id;
        this.room_id = room_id;
        this.text = text;
}
}

let users_lst = [];
let rooms_list = [];


// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(http, {
    wsEngine: 'ws'
});

// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(server);
io.sockets.on("connection", function (socket) {

    //received new user
  socket.on('new_user', function(data) {
    //check if a new username is available
    let user;
    for(let i=0; i<users_lst.length; i++) {
      user = users_lst[i];
      if(user.username == data.username) {
        // console.log(cur.id);
        if(user.user_id == null) {
          user.user_id = data.user_id;
          // console.log(cur.id);
          io.in(data.user_id).emit('new_user', {new_user:user, users_lst:users_lst, chatrooms:chatrooms });
        }
        else {
          io.in(data.user_id).emit("error", {message:"The username is already taken"});
        }
        return;
      }
    }

    var new_user = new User(data.username, data.id);
    users.push(new_user);
    io.sockets.emit('new_user', {new_user:new_user, users:users, chatrooms:chatrooms});
  });


    // This callback runs when a new Socket.IO connection is established.

     //when a user connects
    socket.broadcast.emit('messgae',"A user has joined the room");


    //when a user disconnects
    socket.on('disconnect',()=>{
         io.emit('messgae',"A user has left the room");
     })

    socket.on('message_to_server', function (data) {
        // This callback runs when the server receives a new message from the client.

        console.log("message: " + data["message"]); // log it to the Node.JS output
        
       

        //sending it down to all the clients
        //cf. io.emit==> could print the message twice
        io.sockets.emit("message_to_client", { message: data["message"] }) // broadcast the message to other users
        //(=)socket.broadcast.emit("message_to_client", { message: data["message"] })
    });
});