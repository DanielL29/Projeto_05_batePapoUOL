let userToSend = 'Todos';
let messageStatus = 'Público';
let typeMessage, dataFormatted, type, to, prevMess, curMess, getHour, hourFormatted;
let count = 0;
let getUserStillActive = '';

// Signin on chat
function signin() {
    const nameInput = document.querySelector(".name-section input").value;
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nameInput });

    document.querySelector(".name-section").classList.add("hidden");
    document.querySelector(".loading").classList.remove("hidden");

    promise.then(getInChat);
    promise.catch(validateName);
}

function getInChat() {
    document.querySelector(".name-error").innerHTML = "";
    document.querySelector(".signin").classList.add("hidden");

    setInterval(keepUserConnected, 5000);
    setInterval(getMessages, 3000);
    setInterval(getAllUsersConnected, 10000);
}

function validateName(err) {
    document.querySelector(".name-section").classList.remove("hidden");
    document.querySelector(".loading").classList.add("hidden");
    document.querySelector(".name-error").innerHTML = `Erro ${err.response.status} - Nome já inserido no chat! Tente outro...`;
    document.querySelector(".name-section input").value = "";
}

// Reset and load messages
function resetAndLoadMessages() {
    document.querySelector("main").innerHTML = "";

    if (document.querySelector("main").innerHTML) document.querySelector(".loading-messages").classList.remove("hidden");
    else document.querySelector(".loading-messages").classList.add("hidden");
}

// Validating user on server
function keepUserConnected() {
    const nameInput = document.querySelector(".name-section input").value;
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", { name: nameInput });

    promise.then((res) => res.data);
}

// Message color
function messageColorByType(type) {
    if (type === 'status') typeMessage = 'in-out-color';
    else if (type === 'message') typeMessage = '';
}

// Get hour formatted from server to - 3 hours
function getHourFormatted(hour) {
    getHour = hour.split(':')[0];
    hourFormatted = Number(getHour - 3);

    if (hourFormatted <= 0) hourFormatted = (hourFormatted + 12).toString();

    if (hourFormatted < 10) hourFormatted = `0${hourFormatted}`;
    else hourFormatted = hourFormatted.toString();

    dataFormatted = hour.replace(getHour, hourFormatted);
}

// Load messages HTML
function loadMessages(to, from, type, text) {
    const nameInput = document.querySelector(".name-section input").value;

    if (type === "private_message") {
        if (to === nameInput || from === nameInput) {
            document.querySelector("main").innerHTML += `
                <div class="message reserved-color">
                    <p class="text">
                        <span class="hour">(${dataFormatted})</span>
                        <strong>${from}</strong> reservadamente para <strong>${to}</strong>: ${text}
                    </p>
                </div>
            `;
        }
    } else {
        document.querySelector("main").innerHTML += `
            <div class="message ${typeMessage}">
                <p class="text">
                    <span class="hour">(${dataFormatted})</span>
                    <strong>${from}</strong> para <strong>${to}</strong>: ${text}
                </p>
            </div>
        `;
    }
}

// Scroll to every new message
function scrollToEveryNewMessage(message) {
    let length = message.length - 1;

    if (count === 0) {
        prevMess = message[length].time;
        if (curMess !== null) {
            if (prevMess !== curMess) {
                let screenHeight = "" + window.innerHeight / 8;
                document.querySelector(".message:last-child").scrollIntoView(false);
                window.scrollBy(0, screenHeight);
            }
        }
        count++;
    } else if (count === 1) {
        curMess = message[length].time;
        count++;
        if (prevMess === curMess) count = 0;
        else {
            let screenHeight = "" + window.innerHeight / 8;
            document.querySelector(".message:last-child").scrollIntoView(false);
            window.scrollBy(0, screenHeight);
            count = 0;
        }
    }
}

// Get all messages
function getMessages() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");

    promise.then((res) => {
        resetAndLoadMessages();

        for (let i = 0; i < res.data.length; i++) {
            messageColorByType(res.data[i].type);
            getHourFormatted(res.data[i].time);
            loadMessages(res.data[i].to, res.data[i].from, res.data[i].type, res.data[i].text);
        }
        scrollToEveryNewMessage(res.data);
    });
}

// Get user selected and status selected
function getUserAndStatus() {
    to = userToSend !== undefined ? userToSend : "Todos";

    if (messageStatus !== undefined) {
        if (messageStatus === "Público") type = "message";
        else if (messageStatus === "Reservadamente") type = "private_message";
    } else {
        type = "message";
    }
}

// Send Message
function sendMessage() {
    const nameInput = document.querySelector(".name-section input").value;
    let messageInput = document.querySelector("footer input");

    getUserAndStatus();

    let messageValues = {
        from: nameInput,
        to: to,
        text: messageInput.value,
        type: type,
    };

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", messageValues);

    promise.then((res) => res.data);
    promise.catch((err) => {
        alert(`${err.response.status} Usuário saiu da sala`);
        window.location.reload();
    });

    messageInput.value = "";
}

// Load users HTML
function loadUsers(name) {
    if (userToSend === name) getUserStillActive = 'selected';
    else getUserStillActive = '';

    document.querySelector(".users-connected").innerHTML += `
        <div class="user ${getUserStillActive}" onclick="selectUser(this)">
            <ion-icon name="person-circle"></ion-icon>
            <p>${name}</p>
            <img src="images/check.png" alt="check">
        </div>
    `;
}

// Get All Users Connected 
function getAllUsersConnected() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

    promise.then((res) => {
        document.querySelector(".users-connected").innerHTML = "";

        for (let i = 0; i < res.data.length; i++) {
            loadUsers(res.data[i].name);
        }
    });
}

// Toggle Users Connected Sidebar
function toggleUserSidebar() {
    document.querySelector("aside").classList.add('active');
    document.querySelector(".black-screen").classList.remove('hidden');

    document.querySelector(".black-screen").onclick = () => {
        document.querySelector("aside").classList.remove('active');
        document.querySelector(".black-screen").classList.add('hidden');
    }
}

// Select User or "Todos"
function selectUser(user) {
    const selected = document.querySelector(".selected");
    let toUser = document.querySelector('.to-message h4');

    if (selected !== null) selected.classList.remove("selected");
    user.classList.add("selected");

    if (user.classList.contains("selected")) {
        if(user.querySelector('p').innerHTML === "Todos") {
            messageStatus = "Público";
            document.querySelectorAll('.visibility div').forEach(visible => visible.classList.remove('status'));
        }
        userToSend = user.querySelector('p').innerHTML;
        toUser.innerHTML = `Enviando para ${userToSend} (${messageStatus})`;
    }
}

// Select Visibility Private or Public
function selectVisibility(visible) {
    const status = document.querySelector(".status");
    let toUser = document.querySelector('.to-message h4');

    if (status !== null) status.classList.remove("status");
    visible.classList.add("status");

    if (visible.classList.contains("status")) {
        messageStatus = visible.querySelector('h3').innerHTML;
        toUser.innerHTML = `Enviando para ${userToSend} (${messageStatus})`;
    }
}

// Send Input on Enter
function sendInputOnEnter() {
    document.querySelector('footer input').addEventListener('keydown', e => e.key === 'Enter' ? sendMessage() : false);
    document.querySelector('.signin-container input').addEventListener('keydown', e => e.key === 'Enter' ? signin() : false);
}
sendInputOnEnter();