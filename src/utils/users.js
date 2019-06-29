const { updateRoomOwner, retrieveRoom, removeRoom } = require('./rooms');

let users = [];

const insertUser = (id, username, room) => {
    return new Promise((resolve, reject) => {
        try {
            if (usernameIsValid(username)) {
                //username = username.trim().toLowerCase();
                //room = room.trim().toLowerCase();

                let user = { id, username, room };

                users.push(user);

                resolve(user);
            }
        } catch (error) {
            reject(error);
        }
    });
}

const retrieveUser = (userId) => {
    let user = users.find((value) => {
        return userId === value.id;
    });

    if (user)
        return user;
    else
        return false;
}

const retrieveUsersInRoom = (room) => {
    //room = room.trim().toLowerCase();

    return users.filter((user) => {
        return user.room === room;
    });
}

const removeUser = (userId) => {
    return new Promise((resolve, reject) => {
        try {
            let userIndex = users.findIndex((user) => {
                return userId === user.id;
            });

            if (userIndex >= 0) {
                users.splice(userIndex, 1);

                let room = retrieveRoom(userId);

                if (room) {
                    let onlineUsers = retrieveUsersInRoom(room.name);

                    if (onlineUsers.length > 0) {
                        updateRoomOwner(userId, onlineUsers[0].id)
                    } else {
                        removeRoom(userId);
                    }
                }

                resolve();
            } else {
                throw `User Id ${userId} not found in users array.`;
            }
        } catch (error) {
            reject(`Remove User: [Error] ${error}`);
        }
    });
}

// const removeUser = (userId) => {
//     let userIndex = users.findIndex((user) => {
//         return userId === user.id;
//     });

//     if (userIndex >= 0) {
//         let room = retrieveRoom(user.id);

//         if (room) {
//             let onlineUsers = retrieveUsersInRoom(room.name);
//             if (onlineUsers.length > 0) {
//                 updateRoomOwner(user.id, onlineUsers[0].id);
//             }
//         }


//         users.splice(userIndex, 1);
//         return true;
//     } else {
//         return false;
//     }
// }

//Support functions
const usernameIsValid = (username, room) => {
    let isValid = true;

    if (!username)
        throw "Please, fill in the username";

    users.forEach((user) => {
        if (user.username === username && user.room === room)
            throw "There's already a user with the same username in this room.";
    });

    return isValid;
}

module.exports = {
    insertUser,
    removeUser,
    retrieveUser,
    retrieveUsersInRoom
}