const app = require('./app');
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

let onlineUsers = [];

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    let username = "";

    socket.on('sendUser', (user) => {
        username = user;
        //onlineUsers.push(user);
        socket.emit('loggedIn');
        io.emit('newUserLoggedIn', username)
    });

    socket.on('sendMessage', (text) => {
        io.emit("receiveMessage", text, username);
    });

    socket.on('disconnect', () => {
        if (username)
            io.emit("userDisconnected", username);
    });
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
})