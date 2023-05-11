const stageContainer = document.querySelector('.stage-container');

const gptChat = [];

function addChatMessage(message) {
    gptChat.push(message);
    
}

function createRequestData(chat) {
    return {
        model: _CONFIG_.GPT_MODEL,
        messages: chat,
        temperature: 0.6
    };
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

    if(azioni.length) {
        stageEl.querySelector('.actions-list').innerHTML = azioni
        .map(action => `<button class="action btn text-base font-mono btn-block mb-4 bg-slate-600 hover:bg-slate-800">${action}</button>`)
        .join('');
    } else {
        stageEl.querySelector('.actions-list').innerHTML = '<div class="font-mono text-3xl text-center font-extrabold text-slate-50">Sei morto 💀💀💀</div>';
    }

    stageContainer.appendChild(stageEl);

    const actions = document.querySelectorAll('.action');
    actions.forEach(function(el) {
        el.addEventListener('click', function() {
            const action = el.innerText;
            console.log(action);
            const message = {
                role: 'user',
                content: action
            };
            addChatMessage(message);
            setStage();
        });
    });
}

async function setStage() {
    const data = createRequestData(gptChat);
    console.log(data);
    
    stageContainer.innerText = "";
    isLoading(true);

    const chatJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/chat/completions', data);
    const message = chatJSON.choices[0].message;

    try {        
        const {ambientazione, azioni} = JSON.parse(message.content);
        renderStage(ambientazione, azioni/*, image*/);
        isLoading(false);

        const imageJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/images/generations', {
            prompt: `questa è una storia basata su ${genere}. ${ambientazione}`,
            n: 1,
            size: '512x512',
            response_format: 'url'
        });
    
        const image = imageJSON.data[0].url;
        document.querySelector('.stage-image').innerHTML = `<img src="${image}" alt="${ambientazione}" />`;
        document.querySelector('.stage-image').classList.remove('invert');
        
        addChatMessage(message);
        
    } catch (error) {
        console.error(error);

        document.querySelector('.stage-container').innerHTML = '<div class="font-mono text-3xl text-center font-extrabold text-slate-50">Sei morto 💀💀💀</div>';            
        isLoading(false);
    }
}

function isLoading(state) {
    const loadingScreen = document.querySelector('#loading-screen');
    if(state) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }
}

let genere; 
function init() {
    const selectGenere = document.querySelectorAll('.select-genere');
    selectGenere.forEach(function(el) {
        el.addEventListener('click', function() {
            genere = el.dataset.genere;
            console.log('GENERE: ', genere);
            addChatMessage({
                role: 'system', 
                content: `Voglio che ti comporti come se fossi un classico gioco di avventura testuale. Io sarò il protagonista e giocatore principale. Non fare riferimento a te stesso. L\'ambientazione di questo gioco sarà a tema ${genere}. Ogni ambientazione ha una descrizione di 150 caratteri seguita da una array di 3 azioni possibili che il giocatore può compiere. Una di queste azioni conduce il giocatore alla morte, il gioco termina immediatamente. Non chiedere mai di ricominciare il gioco. Non aggiungere mai altre spiegazioni. Le tue risposte sono solo in formato JSON. Non scrivere altro testo che non sia in formato JSON. Questo è il modello di risposta: {"ambientazione":"descrizione ambientazione","azioni":["azione 1", "azione 2", "azione 3"]}`
            });
            
            setStage();
        });
    });

    
}



init();