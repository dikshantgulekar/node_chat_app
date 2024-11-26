const socket = io("http://localhost:4000");

socket.on("connect", () => {
    console.log(`Connected to server with ID: ${socket.id}`);
});

// DOM Elements
const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');


const messageTone = new Audio('/message-tone.mp3')
// Update total connected clients
socket.on('clients-total', (data) => {
    clientsTotal.innerHTML = `Total Users: ${data}`;
});

// Form submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

function sendMessage() {
    if (messageInput.value.trim() === "") return;

    const data = {
        name: nameInput.value || "Anonymous",
        message: messageInput.value.trim(),
        dateTime: new Date()
    };

    socket.emit('message', data);
    // addMessageToUi(true, data);
    messageInput.value = ''; // Clear input field
}

socket.on('chatMessage', (data) => {
    messageTone.play();
    const isOwnMessage = socket.id === data.id
    addMessageToUi(isOwnMessage, data);
}); 

function addMessageToUi(isOwnMessage, data) {
    const element = `
        <li class="${isOwnMessage ? "message-right" : "message-left"}">
            <p class="message">
               ${data.message}
               <span>${data.name} ${moment(data.dateTime).fromNow()}</span>
            </p>
        </li>
    `;

    messageContainer.insertAdjacentHTML('beforeend', element);
    messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll
    clearFeedback()
}


messageInput.addEventListener('focus', (e)=>{
    socket.emit('feedback', {
        feedback : `${nameInput.value} is typing a message`
    })
})

messageInput.addEventListener('keypress', (e)=>{
    socket.emit('feedback', {
        feedback : `${nameInput.value} is typing a message`
    })
})

messageInput.addEventListener('blur', (e)=>{
    socket.emit('feedback', {
        feedback : "",
    })
})

socket.on('feedback', (data)=>{
    clearFeedback()
    const element = 
    `<li class="message-feedback">
                <p class="feedback" id="feedback">
                    ${data.feedback}
                </p>
    </li>`

    messageContainer.innerHTML += element;
})

function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(element =>{
        element.parentNode.removeChild(element)
    })
}