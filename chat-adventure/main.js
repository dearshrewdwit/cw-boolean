const stageContainer = document.querySelector('.stage-container');

const gptChat = [];
let genre;

function addChatMessage(message) {
    gptChat.push({
        role: 'user',
        content: `${message}. If this action is fatal the action list is empty. Don't give any text other than a JSON object. Your responses are only in JSON format like this example:\n\n###\n\n {"setting": "
you died for this reason", "actions": []}###`
    });
}

async function makeRequest(url, data) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${_CONFIG_.API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(data)
    });

    const jsonData = await response.json();
    return jsonData;
}

function renderActions(actions) {
    let actionsHTML = '';
    actions.forEach(function(action) {
        actionsHTML += `<button>${action}</button>`;
    });

    document.querySelector('.stage-actions').innerHTML = actionsHTML;

    const buttons = document.querySelectorAll('button');
    buttons.forEach(function(el) {
        el.addEventListener('click', function() {
            const action = el.innerText;
            addChatMessage(action);
            setStage();
        });
    });
}

async function setStage() {
    stageContainer.innerHTML = "";
    isLoading(true);
    console.log(gptChat);
    const chatJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/chat/completions', {
        model: _CONFIG_.GPT_MODEL,
        messages: gptChat,
        temperature: 0.7
    });

    // Todo: try...catch
    const message = chatJSON.choices[0].message;
    const content = JSON.parse(message.content);
    console.log(content);
    const {setting, actions} = content;

    isLoading(false);

    if(actions.length) {
        const stageTpl = document.querySelector('#stage-tpl');
        const stageEl = stageTpl.content.cloneNode(true);
        stageEl.querySelector('.stage-desc').innerText = setting;
        stageContainer.appendChild(stageEl);
        gptChat.push(message);

        const imageJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/images/generations', {
            prompt: `this is a story based on ${genre}. ${setting}`,
            n: 1,
            size: '512x512',
            response_format: 'url'
        });

        const image = imageJSON.data[0].url;
        renderActions(actions);
        document.querySelector('.stage-image').innerHTML = `<img src="${image}" alt="${setting}" />`;
    } else {
        gameover(setting);
    }
}

function isLoading(state) {
    const loadingScreen = document.querySelector('.loading');
    if(state) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }
}

function gameover(message) {
    const gameoverTpl = document.querySelector('#gameover-tpl');
    const gameoverHTML = gameoverTpl.content.cloneNode(true);
    gameoverHTML.querySelector('.gameover-message').innerText = message;
    gameoverHTML.querySelector('button').addEventListener('click', function() {
        window.location.reload();
    })
    stageContainer.appendChild(gameoverHTML);
}

function startGame(genre) {
    console.log('GENRE: ', genre);
    document.body.classList.add('game-start');
    gptChat.push({
        role: 'system',
        content: `
I want you to play like a classic text adventure game. I will be the protagonist and main player. Don't refer to yourself. The setting of this game will have a theme of ${genre}. Each setting has a description of 150 characters followed by an array of 3 possible actions that the player can perform. One of these actions is fatal and ends the game. Never add other explanations. Don't refer to yourself. Your responses are just in JSON format like this example:\n\n###\n\n {"setting":"setting description","actions":["action 1", "action 2", "action 3"]}###`
    });
    setStage();
}

function init() {
    const genres = document.querySelectorAll('.genre');
    genres.forEach(function(el) {
        el.addEventListener('click', function() {
            startGame(el.dataset.genre);
        });
    });
}

init();
