const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const { buildMessage } = require('./utils/messages');
const { insertUser, retrieveUsersInRoom, retrieveUser, removeUser } = require('./utils/users');
const { insertRoom, retrieveAllRooms } = require('./utils/rooms');

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

//TODO:
//Styles!

io.on('connection', (socket) => {
    let guestRoom = 'guest';

    console.log('New WebSocket connection ' + socket.id);
    socket.join(guestRoom);

    socket.on('retrieveRooms', (callback) => {
        let rooms = retrieveAllRooms();

        rooms.forEach((room) => {
            room.onlineUsers = retrieveUsersInRoom(room.name);
        })

        callback(rooms);
    })

    socket.on('createRoom', (roomName, callback) => {
        insertRoom(socket.id, roomName).then(() => {
            callback(undefined);
        }).catch((error) => {
            callback(error);
        });
    });

    socket.on('joinRoom', ({ username, room }, callback) => {
        let onlineUsers = retrieveUsersInRoom(room);

        insertUser(socket.id, username, room).then(() => {
            socket.leave(guestRoom);
            socket.join(room);

            io.to(room).emit('newUserLoggedIn', buildMessage("", username));
            io.to(guestRoom).emit("updateRooms");

            callback(undefined, onlineUsers);

        }).catch((error) => {
            callback(error);
        });
    });

    socket.on('quitRoom', () => {
        let user = retrieveUser(socket.id);
        
        if (user) {
            socket.leave(user.room);
            socket.join(guestRoom);

            removeUser(socket.id).then(() => {
                io.to(user.room).emit("userDisconnected", buildMessage("", user.username));
                io.to(guestRoom).emit("updateRooms");
            }).catch((error) => {
                console.log(error);
            });
        }
    });

    socket.on('sendMessage', (message) => {
        if (message.text) {
            let user = retrieveUser(socket.id);

            message.username = user.username;
            io.to(user.room).emit("receiveMessage", message);
        }
    });

    socket.on('disconnect', () => {
        let user = retrieveUser(socket.id);

        if (user) {
            removeUser(socket.id).then(() => {
                io.to(user.room).emit("userDisconnected", buildMessage("", user.username));
                io.to(guestRoom).emit("updateRooms");
            }).catch((error) => {
                console.log(error);
            });
        }

        console.log(`${socket.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
})