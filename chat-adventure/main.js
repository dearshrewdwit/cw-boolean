const gptChat = [];

function addChatMessage(message) {
    gptChat.push(message);
    
}

function createRequestData(chat) {
    return {
        model: _CONFIG_.GPT_MODEL,
        messages: chat,
        temperature: 0.2
    };
}

function renderStage(stage) {
    const stageTpl = document.querySelector('#stage-tpl');
    const stageEl = stageTpl.content.cloneNode(true);    
    const stageContainer = document.querySelector('.stage-container');
    const actionsList = document.querySelector('.actions-list');

    stageEl.querySelector('.stage-desc').innerText = stage.descrizione;
    stageContainer. innerHTML = "";
    stageContainer.appendChild(stageEl);

    actionsList.innerHTML = stage.azioni
        .map(action => `<button class="action btn mb-4">${action}</button>`)
        .join('');

    const actions = document.querySelectorAll('.action');
    actions.forEach(function(el) {
        el.addEventListener('click', function() {
            const action = el.innerText;
            console.log(action);
            const message = {
                role: 'user',
                content: action
            };
            console.log();
            addChatMessage(message);
            setStage();
        });
    });
}

function setStage() {
    const data = createRequestData(gptChat);
    console.log(data);
    makeRequest('/chat/completions', data)
        .then(function(response) {
            const message = response.choices[0].message;
            try {
                const stage = JSON.parse(message.content);
                renderStage(stage);
                addChatMessage(message);  
            } catch (error) {
                console.log(message.content);
            }      
        });
}

function init() {
    addChatMessage({
        role: 'system', 
        content: 'Voglio che ti comporti come se fossi un classico gioco di avventura testuale. Io sarò il protagonista e giocatore principale. Non fare riferimento a te stesso. L\'ambientazione di questo gioco sarà a tema horror. Ogni ambientazione ha una descrizione di 150 caratteri seguita da una lista di 3 azioni possibili che il giocatore può compiere. Una di queste azioni conduce il giocatore alla morte, il gioco termina immediatamente.. Non chiedere mai di ricominciare il gioco. Non aggiungere mai altre spiegazioni. Le tue risposte sempre in formato JSON. Inizia dalla prima ambientazione e aspetta il mio comando.'
    });

    setStage();
}



init();