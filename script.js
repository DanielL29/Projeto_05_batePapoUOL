// Signin on Chat
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
}

function validateName(err) {
    document.querySelector('.name-section').classList.remove('hidden')
    document.querySelector('.loading').classList.add('hidden')
    document.querySelector('.name-error').innerHTML = `Erro ${err.response.status} - Nome já inserido no chat! Tente outro...`
    document.querySelector('.name-section input').value = ''
}

// Validating User on Server
function keepUserConnected() {
    const nameInput = document.querySelector('.name-section input').value
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', { name: nameInput })

    promise.then(res => res.data)
}