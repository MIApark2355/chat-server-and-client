# chat-server-and-client

The function of multi-room chat server:
![image](https://user-images.githubusercontent.com/112423825/230694283-834f697c-80df-44bc-abfb-43a9934b11b0.png)
![image](https://user-images.githubusercontent.com/112423825/230694313-44c50773-8faa-4951-959c-73bcd3741d8d.png)
![image](https://user-images.githubusercontent.com/112423825/230694346-692751b7-c30b-4789-bfd7-f21169a66d7a.png)
![image](https://user-images.githubusercontent.com/112423825/230694415-1da09d19-e039-4200-9683-befe9c838a81.png)



1. Administration of user created chat rooms:

    a. Users can create chat rooms with an arbitrary room name
    
    b. Users can join an arbitrary chat room
    
    c. The chat room displays all users currently in the room
    
    d. A private room can be created that is password protected
    
    e. Creators of chat rooms can temporarily kick others out of the room
    
    f. Creators of chat rooms can permanently ban users from joining that particular room
    
    
2. Messaging:

    a. A user's message shows their username and is sent to everyone in the room
    
    b. Users can send private messages to another user in the same room
    
    
4. Other:

    a. Creators of a room can hand over 'creator' authority to a user in the chatroom and then leave the room.
    
    b. Disconnected users get removed from the chatroom. If they happen to be the creator of the room, the chatroom will be deleted.
