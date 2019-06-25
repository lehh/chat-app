const socket = io();

//Socket listeners
socket.on('loggedIn', () => {
    document.querySelector('#hiddenChat').style.display = 'flex';
    document.querySelector('#userForm').style.display = 'none';

    socket.on('newUserLoggedIn', (username) => {
        let div = document.createElement('div');
        div.appendChild(createStrongText(`${username}`));
        div.append(" just entered the chat.");

        appendDivToMessagesContainer(div);
    });

    socket.on('receiveMessage', (text, username) => {
        let div = document.createElement('div');
        div.appendChild(createStrongText(`${username} says: `));
        div.append(text);

        appendDivToMessagesContainer(div);
    });

    socket.on('userDisconnected', (username) => {
        let div = document.createElement('div');
        div.appendChild(createStrongText(`${username}`));
        div.append(" disconnected.");

        appendDivToMessagesContainer(div);
    });
});
//---------------

//Javascript listeners
document.querySelector("#userForm").addEventListener("submit", (event) => {
    event.preventDefault();
    let username = event.target.elements.username.value;
    socket.emit('sendUser', username);
});

document.querySelector("#sendBtn").addEventListener('click', (event) => {
    let text = document.querySelector("#text");
    socket.emit('sendMessage', text.value);
    text.value = "";
});

document.querySelector("#text").addEventListener("keypress", (event) => {
    if (event.which == 13) {
        document.querySelector('#sendBtn').click();
        event.target.value = "";
        event.preventDefault();
    }
})

document.querySelector("#location").addEventListener("click", () => {
    if (!navigator.geolocation)
        return alert('Geolocation not supported.');

    navigator.geolocation.getCurrentPosition((position) => {
        let latLong = `${position.coords.latitude},${position.coords.longitude}`;
        let sessionLatLong = sessionStorage.getItem("latLong");

        if (sessionLatLong && latLong === sessionLatLong) {
            socket.emit("sendMessage", sessionStorage.getItem("locationMessage"));
        } else {
            getAddress(latLong).then((address) => {
                let concatAddress = `${address.District} - ${address.City} - ${address.State}`;
                let message = `That's my live location ${concatAddress}`;

                socket.emit("sendMessage", message);

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
let appendDivToMessagesContainer = (div) => {
    let messagesDiv = document.querySelector("#messages");

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; //Scroll down to the bottom of the messages container
}

let createStrongText = (text) => {
    let strongElement = document.createElement('strong');
    strongElement.append(text);

    return strongElement;
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