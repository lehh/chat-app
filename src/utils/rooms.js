let rooms = [];

const insertRoom = (userId, room) => {
    return new Promise((resolve, reject) => {
        try {
            if (roomIsValid(userId, room)) {
                let newRoom = { owner: userId, name: room };
                rooms.push(newRoom);
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

const updateRoomOwner = (ownerId, newOwnerId) => {
    let roomIndex = rooms.findIndex((room) => {
        return ownerId === room.owner;
    })

    if (roomIndex >= 0)
        rooms[roomIndex].owner = newOwnerId;
    else
        throw `Update Room Owner: Room with Owner Id ${ownerId} was not found`;

}

const retrieveRoom = (ownerId) => {
    let room = rooms.find((value) => {
        return ownerId === value.owner;
    });

    if (room)
        return room;
    else
        return false;
}

const retrieveAllRooms = () => {
    return rooms;
}

const removeRoom = (ownerId) => {
    let roomIndex = rooms.findIndex((value) => {
        return ownerId === value.owner;
    });

    if (roomIndex >= 0)
        rooms.splice(roomIndex, 1);
    else
        throw `Remove Room: Room with Owner Id ${ownerId} was not found`;
}

const roomIsValid = (ownerId, room) => {
    let isValid = true;

    if (!room)
        throw "Please, fill in the room name.";

    //An user can only create one room at a time.
    rooms.forEach((roomObj) => {
        if (roomObj.owner === ownerId)
            throw "You already has an active room";
    });

    return isValid;
}

module.exports = {
    insertRoom,
    retrieveRoom,
    removeRoom,
    updateRoomOwner,
    retrieveAllRooms
}