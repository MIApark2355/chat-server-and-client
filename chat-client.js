let curr_room_id;
let curr_user="sia";
let is_creator = false;

const showUser = document.getElementById("showUser");

//default
$('#private_pw').hide();

//if you click private for a room type, an input box for private room pw will show up
document.getElementById("private").addEventListener("checked",function open(e){
    $('#private_pw').show();
})

//if you click public for a room type, an input box for private room pw will dissapear
document.getElementById("public").addEventListener("checked",function open(e){
    $('#private_pw').hide();
})


//get input information (creating room)
const room_name_input = document.querySelector(".new_room");
const room_type_input = document.querySelector(".room_type");

//chat-log
const chat_msge = document.querySelector('.chat_log');

//send_button
const send_msg = document.getElementById('send_message');

//curr_room_name
const curr_room_name = document.getElementById('curr_room');

const socketio = io.connect();

//receiving a new_user from server
//this new user will be a current user
socketio.on("new_user", function(data) {
    if(curr_user==null && data.new_user != null && data.new_user.user_id == socketio.user_id) {
      curr_user = data.new_user;
      showUser.innerHTML = "username: " + curr_user.username;
      let rooms = data.chatrooms
      for(let i = 0; i<rooms.length; i++) {
        addRoom(rooms[i]);
      }
    }
    var display_users = document.getElementById("usernames");
    display_users.innerHTML = ""
    for(var k = 0; k<data.users.length; k++) {
      display_users.innerHTML += "" + data.users[k].username + "<br>";
    }
});

function create_rooom(){
    const room_name = room_name_input.value;
    const radio1 = document.getElementById("public");
    const radio2 = document.getElementById("private");
    let room_type = "";
    let room_PW = "";
    // console.log(radio1.checked);
    // console.log(radio2.checked);
    // console.log(radio2.value);
    if (roomName === "") {
      alert("Please fill the input field");
      return;
    }else if(radio1.checked !== true && radio2.checked !==true){
        alert("Please check a type of a chat room");
      return;
    }else if(radio2.checked && document.getElementById("private_pw").value === ""){
        alert("Password is missing");
      return;
    }


    if(document.getElementById('public').checked) {
        roomType = document.getElementById('public').value;
      }else if(document.getElementById('private').checked) {
        roomType = document.getElementById('private').value;
        roomPW = document.getElementById("private_pw").value;
      }
      console.log(roomType);

    let creator = current_user.username;
    socketio.emit("new_chatroom_to_s", {room_name:room_name, creator:creator, password: room_pw});

}

//new chat room receive from server
socketio.on("new_chatroom_to_c", function(data) {
    add_room_data(data.chat_room);
    // if(data.chat_room.creator.user_id == socketio.user_id) {
    //   clearInputs();
    // }
});

function add_room_data(room){
}

//DOM
function show_curr_room(room){
    curr_room_name.innerText = room;
}



socketio.on("message_to_client",function(data) {
    
});

//to show on HTML (DOM)
function show_msg(message){
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('name_time');
    p.innerText = message.username;

    //could be an creative portion??
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const msg_input = document.createElement('p');
    msg_input.classList.add('text');
    msg_input.innerText = message.text;
    div.appendChild(msg_input);
    document.querySelector('.chat_log').appendChild(div);
}

//message receive from server
socketio.on('message', message=>{
    console.log(message);
    show_msg(message);
})

//emit is to send something to server
function send_message(e){
    let msg = document.getElementById("message_input").value;
    socketio.emit("message_to_server", {message:msg});

    //clearing message text box
    e.target.elements.message_input.value = '';
}
send_msg.addEventListener("click", send_message, false); 

//when user click a button to leave chat room
document.getElementById('leave_btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      curr_room_id = "";
    } 
  });