const app = require('./app');
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    let username = "";

    socket.on('sendUser', (user) => {
        username = user;
        io.emit("receiveMessage", `${username} just entered the chat!`);
    });

    socket.on('sendMessage', (text) => {
        io.emit("receiveMessage", text);
    });

    socket.on('disconnect', () => {
        io.emit("receiveMessage", `${username} disconnected`);
    });
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
})