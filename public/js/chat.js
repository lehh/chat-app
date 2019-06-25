const socket = io();

//Socket listeners
socket.on('loggedIn', () => {
    document.querySelector('#hiddenChat').style.display = 'flex';
    document.querySelector('#userForm').style.display = 'none';

    socket.on('newUserLoggedIn', (message) => {
        let div = document.createElement('div');
        div.appendChild(createStrongText(message.username));
        div.append(" just entered the chat.");
        
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

        appendToMessagesContainer(div, message.time);
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
    sendMessage(text.value);
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
    let messagesDiv = document.querySelector("#messages");
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