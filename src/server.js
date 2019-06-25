const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const { buildMessage } = require('./utils/messages');

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    let username = "";

    socket.on('sendUser', (user) => {
        username = user;
        socket.emit('loggedIn');
        io.emit('newUserLoggedIn', buildMessage("", username))
    });

    socket.on('sendMessage', (message) => {
        if (message.text){
            message.username = username;
            io.emit("receiveMessage", message);
        } 
    });

    socket.on('disconnect', () => {
        if (username)
            io.emit("userDisconnected", buildMessage("", username));
    });
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
})