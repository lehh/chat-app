const socket = io();

document.querySelector("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();

    let text = event.target.elements.text.value;
    socket.emit('sendMessage', text);
});

document.querySelector("#sendUser").addEventListener('click', () => {
    let username = document.querySelector("#username").value;
    socket.emit('sendUser', username);

    socket.on('receiveMessage', (text) => {
        let div = document.createElement('div');
        div.append(text);
        document.getElementById("messages").appendChild(div);
    });
});

document.querySelector("#text").addEventListener("keypress", (event) => {
    if (event.which == 13){
        document.querySelector('#submit').click();
        event.target.value = "";
        event.preventDefault();
    }
})

document.querySelector("#location").addEventListener("click", () => {
    if (!navigator.geolocation)
        return alert('Geolocation not supported.');

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
    });
});