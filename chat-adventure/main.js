const stageContainer = document.querySelector('.stage-container');

const gptChat = [];
let genre;

function addChatMessage(message) {
    gptChat.push(message);
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

function renderStage(ambientazione, azioni) {
    const stageTpl = document.querySelector('#stage-tpl');
    const stageEl = stageTpl.content.cloneNode(true);    
    stageEl.querySelector('.stage-desc').innerText = ambientazione;

    if(!azioni.length) {        
        gameover(ambientazione);
        return;
    }

    let actionsHTML = '';
    azioni.forEach(function(azione) {
        actionsHTML += `<button class="action">${azione}</button>`;
    });

    stageEl.querySelector('.actions-list').innerHTML = actionsHTML;
    stageContainer.appendChild(stageEl);

    const actions = document.querySelectorAll('.action');
    actions.forEach(function(el) {
        el.addEventListener('click', function() {
            const action = el.innerText;
            addChatMessage({
                role: 'user',
                content: action
            });
            setStage();
        });
    });
}

async function setStage() {

    stageContainer.innerHTML = "";
    isLoading(true);

    const chatJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/chat/completions', {
        model: _CONFIG_.GPT_MODEL,
        messages: gptChat,
        temperature: 0.6
    });

    const message = chatJSON.choices[0].message;

    try {        
        const {ambientazione, azioni} = JSON.parse(message.content);
        renderStage(ambientazione, azioni);
        addChatMessage(message);
        isLoading(false);
        
        const imageJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/images/generations', {
            prompt: `questa è una storia basata su ${genre}. ${ambientazione}`,
            n: 1,
            size: '512x512',
            response_format: 'url'
        });
    
        const image = imageJSON.data[0].url;
        document.querySelector('.stage-image').innerHTML = `<img src="${image}" alt="${ambientazione}" />`;
    } catch (error) {
        console.error(error);
        gameover(error);
        isLoading(false);
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
    stageContainer.appendChild(gameoverHTML);
}

function startGame(genre) {
    console.log('GENRE: ', genre);
    document.body.classList.add('game-start');
    addChatMessage({
        role: 'system', 
        content: `Voglio che ti comporti come se fossi un classico gioco di avventura testuale. Io sarò il protagonista e giocatore principale. Non fare riferimento a te stesso. L\'ambientazione di questo gioco sarà a tema ${genre}. Ogni ambientazione ha una descrizione di 150 caratteri seguita da una array di 3 azioni possibili che il giocatore può compiere. Una di queste azioni conduce il giocatore alla morte, il gioco termina immediatamente. Non chiedere mai di ricominciare il gioco. Non aggiungere mai altre spiegazioni. Le tue risposte sono solo in formato JSON. Non scrivere altro testo che non sia in formato JSON. Questo è il modello di risposta: {"ambientazione":"descrizione ambientazione","azioni":["azione 1", "azione 2", "azione 3"]}`
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