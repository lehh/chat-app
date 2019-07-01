const socket = io();

const retrieveRooms = () => {
    socket.emit('retrieveRooms', (roomList) => {
        document.querySelector('#roomsTable').getElementsByTagName('tbody')[0].innerHTML = '';
        let noRoomsInfo = document.querySelector('#noRoomsInfo');

        if (roomList.length > 0) {
            roomList.forEach((room) => {
                appendToRoomTable(room.name, room.owner, room.onlineUsers.length);
            });

            noRoomsInfo.style.display = 'none';
        } else {
            noRoomsInfo.style.display = 'block';
        }
    });
}

retrieveRooms();

//Socket listeners
socket.on('updateRooms', () => { //Maybe this can be improved adding specific updates, like remove room or update online users.
    retrieveRooms();
});

socket.on('newUserLoggedIn', (message) => {
    let div = document.createElement('div');
    div.appendChild(createStrongText(message.username));
    div.append(" just entered the chat.");

    appendToOnlineUsersContainer(message.username);
    appendToMessagesContainer(div, message.time);
});

socket.on('receiveMessage', (message) => {
    let div = document.createElement('div');
    div.appendChild(createStrongText(`${message.username} says: `));
    div.append(message.text);

    appendToMessagesContainer(div, message.time);
});

socket.on('userDisconnected', (message) => {
    let div = document.createElement('div');
    div.appendChild(createStrongText(message.username));
    div.append(" disconnected.");

    removeOnlineUser(message.username);
    appendToMessagesContainer(div, message.time);
});
//---------------

//Javascript listeners
document.querySelector("#indexForm").addEventListener("submit", (event) => {
    event.preventDefault();

    let room = event.target.elements.room.value;

    socket.emit('createRoom', room, (error) => {
        if (!error)
            enterRoom(room);
        else
            alert(`Error: ${error}`);
    });
});

document.addEventListener('click', (event) => { //Listener for .room class tr's.
    let parentNode = event.target.parentNode;
    if (event.target && parentNode.className === 'room') {
        let room = parentNode.dataset.name;
        enterRoom(room);
    }
});

document.querySelector("#sendBtn").addEventListener('click', (event) => {
    let text = document.querySelector("#text");
    sendMessage(text.value);
    text.value = "";
});

document.querySelector("#text").addEventListener("keypress", (event) => {
    if (event.which == 13) {
        document.querySelector('#sendBtn').click();
        event.target.value = "";
        event.preventDefault();
    }
});

document.querySelector('#quitBtn').addEventListener('click', () => {
    socket.emit('quitRoom');

    document.querySelector('#messagesContainer').innerHTML = '';
    document.querySelectorAll('.onlineUser').forEach((onlineUser) => {
        onlineUser.remove();
    });

    document.querySelector('#hiddenChat').style.display = 'none';
    document.querySelector('#indexForm').style.display = 'initial';

    retrieveRooms();
});

document.querySelector("#location").addEventListener("click", () => {
    if (!navigator.geolocation)
        return alert('Geolocation not supported.');

    navigator.geolocation.getCurrentPosition((position) => {
        let latLong = `${position.coords.latitude},${position.coords.longitude}`;
        let sessionLatLong = sessionStorage.getItem("latLong");

        if (sessionLatLong && latLong === sessionLatLong) {
            sendMessage(sessionStorage.getItem("locationMessage"));
        } else {
            getAddress(latLong).then((address) => {
                let concatAddress = `${address.District} - ${address.City} - ${address.State}`;
                let message = `That's my live location ${concatAddress}`;

                sendMessage(message);

                sessionStorage.setItem("locationMessage", message);
                sessionStorage.setItem("latLong", latLong);
            }).catch((error) => {
                alert(`Error while fetching the address: ${error}`);
            });
        }
    });
});
//-----------------------

//Javascript functions
let appendToMessagesContainer = (div, time) => {
    let messagesDiv = document.querySelector("#messagesContainer");
    let timeDiv = createTimeDiv(time);

    div.insertAdjacentElement("afterbegin", timeDiv);

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; //Scroll down to the bottom of the messages container
}

let createTimeDiv = (time) => {
    let timeDiv = document.createElement('div');
    let formatedTime = moment(time).format("ddd, MMMM Do YYYY - h:mm:ss a");

    timeDiv.setAttribute('class', 'time');
    timeDiv.append(formatedTime);

    return timeDiv;
}

let createStrongText = (text) => {
    let strongElement = document.createElement('strong');
    strongElement.append(text);

    return strongElement;
}

let appendToOnlineUsersContainer = (username) => {
    let userDiv = document.createElement('div');
    userDiv.setAttribute('class', 'onlineUser');
    userDiv.setAttribute('id', username.replace(' ', ''));
    userDiv.append(username);

    document.querySelector('#onlineUsersContainer').appendChild(userDiv);
}

let removeOnlineUser = (username) => {
    document.querySelector(`#${username.replace(' ', '')}`).remove();
}

let appendToRoomTable = (roomName, ownerId, numberOfUsers) => {
    let roomTr = document.createElement('tr');
    roomTr.setAttribute('class', 'room');
    roomTr.setAttribute('data-id', ownerId);
    roomTr.setAttribute('data-name', roomName);

    let nameTd = document.createElement('td');
    nameTd.append(roomName);

    let numberTd = document.createElement('td');
    numberTd.append(numberOfUsers);

    roomTr.appendChild(nameTd);
    roomTr.appendChild(numberTd);

    document.querySelector('#roomsTable').getElementsByTagName('tbody')[0].appendChild(roomTr);
}

const enterRoom = (room) => {
    debugger;
    let form = document.querySelector("#indexForm");

    let usernameInput = form.elements.username;

    if (usernameInput.reportValidity()) {
        let username = usernameInput.value;

        socket.emit('joinRoom', { username, room }, (error, onlineUsers) => {
            if (!error) {
                debugger;
                document.querySelector('#hiddenChat').style.display = 'flex';
                document.querySelector('#indexForm').style.display = 'none';

                onlineUsers.forEach((user) => {
                    appendToOnlineUsersContainer(user.username);
                });
            } else {
                alert(`Error: ${error}`);
            }
        });
    }
}

let sendMessage = (message) => {
    socket.emit('sendMessage', { text: message, createdAt: new Date().getTime() })
}

let getAddress = (latLong) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', `/address/${latLong}`);
        xhr.onload = () => {
            if (xhr.status === 200) {
                let address = JSON.parse(xhr.responseText);
                resolve(address);
            }
            else {
                reject(xhr.responseText);
            }
        }
        xhr.send();
    });
}
//-----------------------