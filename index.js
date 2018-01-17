const PORT = process.env.PORT || 3000;

const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const moment     = require('moment');
const anchorme   = require('anchorme').default;
const _          = require('lodash');
const server     = require('http').createServer(app);
const io         = require('socket.io')(server);

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

var chatrooms = [];
var userList  = [];
var userListColor = [];

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`)
});

io.on('connection', onConnection);

function onConnection(socket) {
    
    var colors = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    
    io.to(socket.chatroom).emit('message', {
        usernameColor: socket.usernameColor,
        username: socket.username,
        text: `has joined the room.`
    });

    socket.on('joinRoom', onJoinRoom);
    socket.on('leaveRoom', onLeaveRoom);
    socket.on('systemMsg', onSystemMsg);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
	socket.on('requesttodraw', onRequestToDraw);
	socket.on('drawing', onDrawing);
	socket.on('uploadimg', onUploadImg);

    function onJoinRoom(data) {
        socket.chatroom = data.chatroom;
        socket.usernameColor = colors[Math.floor(Math.random()*colors.length)];
        socket.username = data.username;
        socket.join(socket.chatroom);
        if (_.includes(chatrooms, data.chatroom)) {
            var i = _.indexOf(chatrooms, data.chatroom);
            userList[i].push(data.username);
            userListColor[i].push(socket.usernameColor);
        } else {
            chatrooms.push(data.chatroom);
            userList.push([data.username]);
            userListColor.push([socket.usernameColor]);
        }
        console.log(chatrooms);
        console.log(userList);
        console.log(userListColor);
        var i = _.indexOf(chatrooms, data.chatroom);
        io.to(socket.chatroom).emit('updateRoom', {
            userCount: userList[i].length,
            userList: userList[i],
            userListColor: userListColor[i]
        });
    }

    function onLeaveRoom(data) {
        socket.chatroom = data.chatroom;
        socket.usernameColor = colors[Math.floor(Math.random()*colors.length)];
        socket.username = data.username;
        
        var i = _.indexOf(chatrooms, data.chatroom);
        var n = _.indexOf(userList[i], data.username);
        console.log(i);
        console.log(n);
        userList[i].splice(n, 1);
        userListColor[i].splice(n, 1);

        io.to(socket.chatroom).emit('updateRoom', {
            userCount: userList[i].length,
            userList: userList[i],
            userListColor: userListColor[i]
        });
    }
    
    function onSystemMsg() {
        var message = {};
        message.usernameColor = socket.usernameColor;
        message.username = socket.username;
        message.text = 'has joined the room';
        message.timestamp = moment.valueOf();
        io.to(socket.chatroom).emit('systemMsg', message);
    }
    
    function onDisconnect() {
        var message = {};
        message.usernameColor = socket.usernameColor;
        message.username = socket.username;

        message.text = 'has left the room';
        message.timestamp = moment.valueOf();

        io.to(socket.chatroom).emit('systemMsg', message);
    }
    
    function onMessage(message) {   
        message.text = anchorme(message.text, { attributes: [{name: "target",value: "_blank"}]
        });
        message.usernameColor = socket.usernameColor;
        message.username = socket.username;
        io.to(socket.chatroom).emit('message', message);
    }
    
    // update all users html to create a canvas for drawing
    function onRequestToDraw(data) {
        socket.to(socket.chatroom).emit('requesttodraw', data);
    }
    
    function onDrawing(data) {
        socket.to(socket.chatroom).emit('drawing', data);
    }
    
    function onUploadImg(data) {
        socket.to(socket.chatroom).emit('uploadimg', data);
    }
}

