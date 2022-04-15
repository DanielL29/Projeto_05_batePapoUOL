let userToSend = 'Todos';
let messageStatus = 'Público';
let lastMessage, typeMessage, getHour, hourFormatted, dataFormatted;
let count = 0;
let prevMess, curMess;

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

// Validating user on server
function keepUserConnected() {
    const nameInput = document.querySelector(".name-section input").value;
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", { name: nameInput });

    promise.then((res) => res.data);
}

// Get all messages - refatorar
function getMessages() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    const nameInput = document.querySelector(".name-section input").value;

    promise.then((res) => {
        document.querySelector("main").innerHTML = "";

        if (document.querySelector("main").innerHTML) document.querySelector(".loading-messages").classList.remove("hidden");
        else document.querySelector(".loading-messages").classList.add("hidden");

        for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].type === 'status') typeMessage = 'in-out-color';
            else if (res.data[i].type === 'message') typeMessage = '';

            getHour = res.data[i].time.split(':')[0];
            hourFormatted = Number(getHour - 3);

            if (hourFormatted <= 0) hourFormatted = (hourFormatted + 12).toString();

            if (hourFormatted < 10) hourFormatted = `0${hourFormatted}`;
            else hourFormatted = hourFormatted.toString();

            dataFormatted = res.data[i].time.replace(getHour, hourFormatted);

            if (res.data[i].type === "private_message") {
                if (res.data[i].to === nameInput || res.data[i].from === nameInput) {
                    document.querySelector("main").innerHTML += `
                        <div class="message reserved-color">
                            <p class="text">
                                <span class="hour">(${dataFormatted})</span>
                                <strong>${res.data[i].from}</strong> reservadamente para <strong>${res.data[i].to}</strong>: ${res.data[i].text}
                            </p>
                        </div>
                    `;
                }
            } else {
                document.querySelector("main").innerHTML += `
                    <div class="message ${typeMessage}">
                        <p class="text">
                            <span class="hour">(${dataFormatted})</span>
                            <strong>${res.data[i].from}</strong> para <strong>${res.data[i].to}</strong>: ${res.data[i].text}
                        </p>
                    </div>
                `;
            }
        }
        //  Scroll to Last Message
        let length = res.data.length - 1

        if (count === 0) {
            prevMess = res.data[length].time
            if(curMess !== null) {
                if (prevMess !== curMess) {
                    let screenHeight = "" + window.innerHeight / 8;
                    document.querySelector(".message:last-child").scrollIntoView(false);
                    window.scrollBy(0, screenHeight);
                }
            }
            count++
        } else if (count === 1) {
            curMess = res.data[length].time
            count++
            if (prevMess === curMess) {
                count = 0
            } else {
                let screenHeight = "" + window.innerHeight / 8;
                document.querySelector(".message:last-child").scrollIntoView(false);
                window.scrollBy(0, screenHeight);
                count = 0
            }
        }
    });
}

// Send Message - refatorar
function sendMessage() {
    const nameInput = document.querySelector(".name-section input").value;
    let messageInput = document.querySelector("footer input");

    let to = userToSend !== undefined ? userToSend : "Todos";
    let type;
    if (messageStatus !== undefined) {
        if (messageStatus === "Público") type = "message";
        else if (messageStatus === "Reservadamente") type = "private_message";
    } else {
        type = "message";
    }

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

// Get All Users Connected - talvez refatorar
function getAllUsersConnected() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    let getUserStillActive = '';

    promise.then((res) => {
        document.querySelector(".users-connected").innerHTML = "";

        for (let i = 0; i < res.data.length; i++) {
            if (userToSend === res.data[i].name) getUserStillActive = 'selected';
            else getUserStillActive = '';

            document.querySelector(".users-connected").innerHTML += `
                <div class="user ${getUserStillActive}" onclick="selectUser(this)">
                    <ion-icon name="person-circle"></ion-icon>
                    <p>${res.data[i].name}</p>
                    <img src="images/check.png" alt="check">
                </div>
            `;
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
        userToSend = user.querySelector('p').innerHTML;
        toUser.innerHTML = `Enviando para ${userToSend} (Público)`;
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