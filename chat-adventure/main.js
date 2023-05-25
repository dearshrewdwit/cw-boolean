const stageContainer = document.querySelector('.stage-container');

const gptChat = [];
let genre;

function addChatMessage(message) {
    gptChat.push({
        role: 'user',
        content: `${message}. Se questa azione è mortale l'elenco delle azioni è vuoto. Non dare altro testo che non sia un oggetto JSON. Le tue risposte sono solo in formato JSON come questo esempio:\n\n###\n\n {"ambientazione": "sei morto per questa motivazione", "azioni": []}###`
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
    const {ambientazione, azioni} = content;

    isLoading(false);

    if(azioni.length) {        
        const stageTpl = document.querySelector('#stage-tpl');
        const stageEl = stageTpl.content.cloneNode(true);   
        stageEl.querySelector('.stage-desc').innerText = ambientazione;
        stageContainer.appendChild(stageEl);
        gptChat.push(message);

        const imageJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/images/generations', {
            prompt: `questa è una storia basata su ${genre}. ${ambientazione}`,
            n: 1,
            size: '512x512',
            response_format: 'url'
        });
    
        const image = imageJSON.data[0].url;
        renderActions(azioni);
        document.querySelector('.stage-image').innerHTML = `<img src="${image}" alt="${ambientazione}" />`;
    } else {
        gameover(ambientazione);
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
        content: `Voglio che ti comporti come se fossi un classico gioco di avventura testuale. Io sarò il protagonista e giocatore principale. Non fare riferimento a te stesso. L\'ambientazione di questo gioco sarà a tema ${genre}. Ogni ambientazione ha una descrizione di 150 caratteri seguita da una array di 3 azioni possibili che il giocatore può compiere. Una di queste azioni è mortale e termina il gioco. Non aggiungere mai altre spiegazioni. Non fare riferimento a te stesso. Le tue risposte sono solo in formato JSON come questo esempio:\n\n###\n\n {"ambientazione":"descrizione ambientazione","azioni":["azione 1", "azione 2", "azione 3"]}###`
    });
    setStage();
}

function init() {
    const genres = document.querySelectorAll('.genre');
    genres.forEach(function(el) {
        el.addEventListener('click', function() {
            startGame(el.innerText);
        });
    });
}

init();