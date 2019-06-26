const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const { buildMessage } = require('./utils/messages');

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

let onlineUsers = [];

io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    socket.emit("connected", onlineUsers.length);

    let username = "";

    socket.on('sendUser', (user) => {
        let isValid = true;

        onlineUsers.forEach((username) => {
            if (username == user)
                isValid = false; return false;
        })

        if (isValid){
            username = user;

            socket.emit('loggedIn', onlineUsers);
            onlineUsers.push(username);
            io.emit('newUserLoggedIn', buildMessage("", username));
        } 
    });

    socket.on('sendMessage', (message) => {
        if (message.text){
            message.username = username;
            io.emit("receiveMessage", message);
        } 
    });

    socket.on('disconnect', () => {
        if (username){
            onlineUsers = onlineUsers.filter((value) => {
                return value !== username;
            })

            io.emit("userDisconnected", buildMessage("", username));
        }
    });
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
})