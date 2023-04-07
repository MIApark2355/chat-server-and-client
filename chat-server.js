// Require the packages we will use:
const http = require("http"),
    fs = require("fs");


// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(http, {
    wsEngine: 'ws'
});


const port = 3456;
const file = "client.html";
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
const server = http.createServer(function (req, res) {
    // This callback runs when a new connection is made to our HTTP server.

    switch (req.url) {
        case "/style.css" :
          fs.readFile("style.css", function(err, data){
          // This callback runs when the client.css file has been read from the filesystem.
          if(err) return res.writeHead(500);
          res.writeHead(200, {'Content-Type': 'text/css'});
          res.end(data);
        });
        break;
        default :
        fs.readFile(file, function (err, data) {
            // This callback runs when the client.html file has been read from the filesystem.
            if (err) return res.writeHead(500);
            res.writeHead(200);
            res.end(data);
        });
      }
});
server.listen(port);



// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(server);

//locally creating a data instead of using mysql
//[user]
class User {
    constructor(username, user_id) {
        this.username = username;
        this.user_id = user_id;
    }
    
  }
//[chat roooms]
class Room{
constructor(room_name, creator, room_type, password) {
    this.room_name = room_name;
    this.creator = creator;
    this.room_type = room_type;
    this.password = password;
    this.members = [];
    this.banned = [];
} 
}


let users_lst = [];
let rooms_lst = [];

/////helper function//////
function in_room(user_input , room_input){
    for(i=0;i<rooms_lst.length;i++){
        if(rooms_lst[i].room_name === room_input){
            if(rooms_lst[i].members.includes(user_input)){
                return true;
            }
        }
        
    }
    return false;
}

function get_id(username_input){
    for(i = 0; i<users_lst.length ; i++){
        if(users_lst[i].username === username_input){
            return users_lst[i].user_id;
        }
    }
    return "";
}



function get_username(user_id_input){
    for(i = 0; i<users_lst.length ; i++){
        if(users_lst[i].user_id === user_id_input){
            return users_lst[i].username;
        }
    }
    return "";
}

function get_user(username){
    for(u in users_lst){
        if(u.username === username){
            return u;
        }
    }
    return null;
}


io.sockets.on("connection", function (socket) {

    //////////////////////USERS STUFF////////////////////////
    console.log("connected");
    //received new user
  socket.on('new_user', function(data) {
   
    console.log("new_user information received from client ",data);
    //check if a new username is available
    let check_username = data["username"];

    socket.user = check_username;

    let check_user_id = socket.id;
    if(check_username === ""){
        io.in(check_user_id).emit("error1", {message:"Username cannot be empty string"});
        return;
    }
    let already_exist = false;
    for(let i = 0; i < users_lst.length ; i++){
        //console.log(users_lst[i].username);
        if (users_lst[i].username === check_username){
            already_exist = true;
            break;
        }
    }
    console.log("new_user valid? ", !(already_exist));
    if(already_exist){
        //sending error to curr user
        io.in(check_user_id).emit("error1", {message:"The username is already taken"});
        return;
    }

    let new_user = new User(check_username, check_user_id);
    users_lst.push(new_user);
    console.log("users list updated",users_lst);
    //io.in(check_user_id).emit('new_user', {username:check_username,user_id:check_user_id,users_lst:users_lst,rooms_lst:rooms_lst});
    io.sockets.emit('new_user',{username:check_username,user_id:check_user_id,users_lst:users_lst,rooms_lst:rooms_lst});
  });


  //ban function
  //passed data : room_name:joined_room_name, username:to_be_banned, user_id:socketio.id
  socket.on('ban_user', function(data) {
    let room_to_leave = data["room_name"];
    let user_banned = data["username"];
    let user_banned_id;
    let room_num = -1;
    let creator_name;
    //updating banned container
    for (let j = 0 ; j < rooms_lst.length; j++){
        if(rooms_lst[j].room_name === room_to_leave){
            room_num = j;
            creator_name =rooms_lst[j].creator;
            if(!rooms_lst[j].banned.includes(user_banned)){
                rooms_lst[j].banned.push(user_banned);
            }
            
        }
    }
    //updating members container
    let new_member_array;
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === room_to_leave){
                room_num = j;
                creator_name = rooms_lst[j].creator;
                new_member_array = rooms_lst[j].members;
            }
        }
        for(let i = 0 ; i < new_member_array.length ;i++){
            if(new_member_array[i] === user_banned){
                new_member_array.splice(i,1);
        }
    }
    for (let j = 0 ; j < rooms_lst.length; j++){
        if(rooms_lst[j].room_name === room_to_leave){
            rooms_lst[j].members = new_member_array;
        }
    }
    for(let j=0; j<users_lst.length; j++) {
      if(users_lst[j].username=== user_banned) {
        user_banned_id =users_lst[j].user_id;
        break;
      }
    }
    console.log("room list after ban ",rooms_lst);
    io.in("room"+room_to_leave).emit('ban_user', {room_name:room_to_leave,user_banned: user_banned, creator_name:creator_name, users_lst:users_lst, rooms_lst:rooms_lst, room_index:room_num});
  });
/*This "logging out" is too complicated since we not only have to delete all the rooms that 'to_be_removed' have made and
but also should "leave" the room if the user is joining one.

  socket.on('remove_user', function(data) {
    let to_be_removed = data.username;
    let to_be_removed_id = data.user_id;
    //first we need to remove all the chat rooms that to-be-removed user has made
    for (let j = 0 ; j < rooms_lst.length; j++){
        if(rooms_lst[j].creator === to_be_removed){
            rooms_lst.splice(j,1);
        }
    }


    for(let i = 0; i < users_lst.length ; i++){
        if (users_lst[i].username === to_be_removed){
            users_lst.splice(i,1);
            break;
        }
    }
    console.log("users list after removed",users_lst);
    io.in(to_be_removed_id).emit('remove_user', {username:to_be_removed,user_id:to_be_removed_id,users_lst:users_lst,rooms_lst:rooms_lst, room_name:data["room_name"],room_index:room_num});
    if(data["room_name"] !== ""){
        socket.leave("room"+data["room_name"]);
    }
  });

  */

    //////////////////////ROOM STUFF////////////////////////

    socket.on('create_room', function(data) {

        console.log("new ROOM information received from client ",data);
        //check if a new room name is available
        let check_name = data["room_name"];
        let check_user_id = data["creator_id"]
        if(check_name === ""){
            io.in(check_user_id).emit("error1", {message:"room name cannot be empty string"});
            return;
        }
        let already_exist = false;
        for(let i = 0; i < rooms_lst.length ; i++){
            if (rooms_lst[i].room_name === check_name){
                already_exist = true;
                break;
            }
        }
        console.log("new room name valid? ", !(already_exist));
        if(already_exist){
            //sending error to curr user
            io.in(check_user_id).emit("error1", {message:"The room name is already exists"});
            return;
        }

        let roomType = data["room_type"];
        let pw = "";
        if(roomType === "private"){
            pw = data["password"];
        }
        let new_room = new Room(check_name, data["creator"], roomType, pw);
        //new_room.members.push(data["creator"]);
        rooms_lst.push(new_room);
        console.log("rooms list updated after creating ",rooms_lst);
        io.sockets.emit('create_room',{room: new_room,rooms:rooms_lst,username:data["creator"]});
      });

      

    //could be creative portion --> creator can also remove a chat room
    socket.on('remove_room', function(data) {
        let to_be_removed = data["room_name"];
        let room_num;
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === to_be_removed){
                room_num = j;
                rooms_lst.splice(j,1);
            }
        }
        let room = rooms_lst[room_num];
        console.log("room list after removed",rooms_lst);
        io.sockets.emit('remove_room', {rooms_lst:rooms_lst, room_name:to_be_removed,room:room});
      });


      //check if the room is private or public
      socket.on('check_room', function(data) {
        let check_room_name = data["room_name"];
        let is_private = false;
        //let true_pw="";
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === check_room_name){
                console.log("line256:", rooms_lst[j].room_type);
                if(rooms_lst[j].room_type === "public"){
                    is_private = false;
                }else if(rooms_lst[j].room_type === "private"){
                    is_private = true;
                    //true_pw = rooms_lst[j].password;
                }
            }
        }
        console.log("room private?",is_private);
        socket.emit('check_room', {room_name:check_room_name, is_private:is_private});
      });


      //data passed: room_name_to_join:data["room_name"],curr_room_name: joined_room_name, username:curr_user,  user_id:socketio.id,password:check_pw
      socket.on('join_room', function(data) {
        let check_room = data["room_name_to_join"];
        if(check_room === ""){
            io.in(user_id).emit("error1", {message:"No room has been created!"});
            return;
        }
        let joining_user = data["username"];
        let is_creator = false;
        let user_id = data["user_id"];
        let room_num = -1;
        let creator_name;
        let curr_room_name = data["curr_room_name"];
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === check_room){
                if(rooms_lst[j].password !== data["password"]){
                    io.in(user_id).emit("error1", {message:"Password is wrong"});
                        return;
                }
                room_num = j;
                creator_name =rooms_lst[j].creator;
                if(rooms_lst[j].creator === joining_user){
                    is_creator =true;
                    
                }if(rooms_lst[j].banned.includes(joining_user)){
                    io.in(user_id).emit("error1", {message:"You are not allowed to join this chat room!"});
                        return;
                }

                //to avoid showing user's name several time when they switch among several rooms
                if(!rooms_lst[j].members.includes(joining_user)){
                    rooms_lst[j].members.push(joining_user);
                }
                
            }
        }
        socket.join("room"+check_room);
        console.log("room list after a member joined",rooms_lst);
        io.in("room"+check_room).emit('join_room', {rooms_lst:rooms_lst,username:joining_user, room_name:check_room, creator_name:creator_name ,room_index:room_num});
      });

      socket.on('leave_room', function(data) {
        let room_to_leave = data["room_name"];
        let user_leaving = data["username"];
        let creator_name;
        let room_num;
        let new_member_array=[];
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === room_to_leave){
                room_num = j;
                creator_name = rooms_lst[j].creator;
                new_member_array = rooms_lst[j].members;
            }
        }
        for(let i = 0 ; i < new_member_array.length ;i++){
            if(new_member_array[i] === user_leaving){
                new_member_array.splice(i,1);
            }
        }
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === room_to_leave){
                rooms_lst[j].members = new_member_array;
            }
        }
        console.log("room list after a member left",rooms_lst);
        io.in("room"+room_to_leave).emit('leave_room', {user_leaving: user_leaving, creator_name:creator_name, users_lst:users_lst, rooms_lst:rooms_lst, room_index:room_num});
        socket.leave("room"+room_to_leave);
      });

      socket.on('kick_user', function(data) {
        let room_to_leave = data["room_name"];
        let user_kicked = data["username"];
        let user_kicked_id;
        let creator_name;
        let room_num;
        let new_member_array;
        for (let j = 0 ; j < rooms_lst.length; j++){ // find room number to execute
            if(rooms_lst[j].room_name === room_to_leave){
                room_num = j;
                creator_name = rooms_lst[j].creator;
                new_member_array = rooms_lst[j].members;
            }
        }
        for(let i = 0 ; i < new_member_array.length ;i++){ // remove user from array
            if(new_member_array[i] === user_kicked){
                new_member_array.splice(i,1);
            }
        }
        for (let j = 0 ; j < rooms_lst.length; j++){ // update current member array
            if(rooms_lst[j].room_name === room_to_leave){
                rooms_lst[j].members = new_member_array;
            }
        }
        for(let j=0; j<users_lst.length; j++) { // find kicked user's id
            if(users_lst[j].username=== user_kicked) {
                user_kicked_id =users_lst[j].user_id;
                break;
            }
        }
        console.log("room list after a member kicked out of room",rooms_lst);
        io.in("room"+room_to_leave).emit('kick_user', {room_name:room_to_leave,user_kicked: user_kicked, creator_name:creator_name, users_lst:users_lst, rooms_lst:rooms_lst, room_index:room_num});

      });

    socket.on('leave_room_socket',function(data){
        let room_to_leave = data["room_name"];
        socket.leave("room"+room_to_leave);
    })


        ////////////////////CREATIVE PORTION/////////////////////

        
    //when a user disconnects 
    //leaving socket rooms
    //delete from rooms_lst
    socket.on('disconnect',()=>{
        console.log(socket.id);

        //console.log(socket.room);
        
        const username_disconnect = get_username(socket.id);

        let removed_rooms = [];
        let leaving_rooms = [];

        let new_array = [];

        for(j=0; j<rooms_lst.length ; j++){
            console.log("new_array: ",j,"th ",new_array);
            if(in_room_or_creator(username_disconnect, rooms_lst[j].room_name)){
                // if the creator is disconnecting the room will be gone
                if (rooms_lst[j].creator === username_disconnect){
                        //console.log("room list after removed",rooms_lst);
                        removed_rooms.push(rooms_lst[j]);
                        console.log("removed rooms", j,"th ",removed_rooms);
                        //rooms_lst.splice(j,1);
                }else{
                    for(let i = 0 ; i <  rooms_lst[j].members.length ;i++){

                        if(rooms_lst[j].members[i] === username_disconnect){
                            socket.leave("room"+rooms_lst[j].room_name);
                            leaving_rooms.push(rooms_lst[j]);
                            //let c = rooms_lst[j].creator;
                            //io.in("room"+rooms_lst[j].room_name).emit('leave_room', {user_leaving: username_disconnect, creator_name:c, users_lst:users_lst, rooms_lst:rooms_lst, room_index:j});
                            rooms_lst[j].members.splice(i,1);
                            new_array.push(rooms_lst[j]);
                            break;
                        }
                    }
                }
                
            }else{
                new_array.push(rooms_lst[j]);
            }
            
        }

        //replace data
        rooms_lst = new_array;
           //delete from users_lst
        for(i=0; i<users_lst.length; i++){
			if(users_lst[i].username === username_disconnect){
				users_lst.splice(i,1);
                break;
			}
        }
         //**should broadcast to other users ==> update userlist*/
         console.log(username_disconnect," disconnected");
         console.log("USERS LIST after one disconnected", users_lst);
         console.log("ROOMS LIST after one disconnected", rooms_lst);
         console.log("removed rooms", removed_rooms);
         console.log("left rooms", leaving_rooms);
        io.sockets.emit('update_after_disconnection', {users_lst:users_lst, rooms_lst:rooms_lst,disconnect_username:username_disconnect , removed_rooms:removed_rooms, leaving_rooms:leaving_rooms});
     
       
     });


    socket.on('message', function (data) {
        // This callback runs when the server receives a new message from the client.
        let receiver = data["receiver"];
        let receiver_id = get_id(receiver);
        console.log("received from client","message: " ,data["message"],"time: " , data["time"]);

        
       if(receiver ==="all"){
        io.in("room" + data["room_name"]).emit("message", { message: data["message"],username:data["username"] ,time:data["time"]}) // broadcast the message to other users

       }else{
        io.in(receiver_id).emit("message", { message: data["message"],username:data["username"] ,time:data["time"]});
       }
    });



    socket.on('transfer', function(data) {
        let transfer_user = data["transfer"];
        let room_to_transfer = data["room_name"];
        let room_num = -1;
        let creator_name = data["username"];
        
        //updating members container
        let new_member_array;
            for (let j = 0 ; j < rooms_lst.length; j++){
                if(rooms_lst[j].room_name === room_to_transfer){
                    room_num = j;
                    rooms_lst[j].creator = transfer_user; // update creator to be target user
                    new_member_array = rooms_lst[j].members;
                }
            }
            for(let i = 0 ; i < new_member_array.length ;i++){
                if(new_member_array[i] === creator_name){
                    new_member_array.splice(i,1); // kick original creator out of the room
            }
        }
        for (let j = 0 ; j < rooms_lst.length; j++){
            if(rooms_lst[j].room_name === room_to_transfer){
                rooms_lst[j].members = new_member_array;
            }
        }
        
        console.log("room list after transfer ",rooms_lst);
        io.in("room"+room_to_transfer).emit('transfer', {room_name:room_to_transfer,transfer: transfer_user, prev_creator:creator_name, users_lst:users_lst, rooms_lst:rooms_lst, room_index:room_num});
    });
});