// Signin on chat
function signin() {
    const nameInput = document.querySelector('.name-section input').value
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', { name: nameInput })

    document.querySelector('.name-section').classList.add('hidden')
    document.querySelector('.loading').classList.remove('hidden')

    promise.then(getInChat)
    promise.catch(validateName)
}

function getInChat() {
    document.querySelector('.name-error').innerHTML = ''
    document.querySelector('.signin').classList.add('hidden')

    setInterval(keepUserConnected, 5000)
    setInterval(getMessages, 3000)
}

function validateName(err) {
    document.querySelector('.name-section').classList.remove('hidden')
    document.querySelector('.loading').classList.add('hidden')
    document.querySelector('.name-error').innerHTML = `Erro ${err.response.status} - Nome já inserido no chat! Tente outro...`
    document.querySelector('.name-section input').value = ''
}

// Validating user on server
function keepUserConnected() {
    const nameInput = document.querySelector('.name-section input').value
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', { name: nameInput })

    promise.then(res => res.data)
}

// Get all messages
function getMessages() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')

    promise.then(res => {
        document.querySelector('main').innerHTML = ''
        document.querySelector('main').innerHTML ? document.querySelector('.loading-messages').classList.remove('hidden') : document.querySelector('.loading-messages').classList.add('hidden')

        for (let i = 0; i < res.data.length; i++) {
            let inOut = res.data[i].type === 'status' ? 'in-out-color' : ''
            let reserved = res.data[i].type === 'private_message' ? 'reserved-color' : ''
            let typeMessage = res.data[i].type ? inOut : reserved

            document.querySelector('main').innerHTML += `
                <div class="message ${typeMessage}">
                    <p class="text">
                        <span class="hour">${res.data[i].time}</span>
                        <strong>${res.data[i].from}</strong> para <strong>${res.data[i].to}</strong>: ${res.data[i].text}
                    </p>
                </div>
            `
        }
        // Scroll to Last Message
        let screenHeight = '' + window.innerHeight / 8
        document.querySelector('main').lastElementChild.scrollIntoView(false)
        window.scrollBy(0, screenHeight)
    })
}