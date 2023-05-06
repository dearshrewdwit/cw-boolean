const defaultActions = [
    'salutare nel tuo modo più iconico',
    'dare un consiglio di stile in base ai tuoi gusti',
    'raccontare la tua ultima avventura',
    'svelarmi i tuoi sogni',
    'dirmi chi è il tuo migliore amico',
    'scrivere la tua bio di linkedin'
];

const modal = document.querySelector('.modal');
const modalTitle = modal.querySelector('.modal-title');
const modalContent = modal.querySelector('.modal-content');
const modalClose = modal.querySelector('.modal-close');
modalClose.addEventListener('click', function() {
    modal.classList.add('modal-hidden');
});

async function playCharacter(character) {
    const action = getRandomArrayItem(defaultActions);
    const temperature = Math.random();
    const data = createRequestData(character, action, temperature);

    isLoading(true);

    const response = await fetch(_CONFIG_.API_BASE_URL + '/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${_CONFIG_.API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(data)
    })

    const jsonData = await response.json();
    modalTitle.innerHTML = character;
    modalContent.innerText = jsonData.choices[0].message.content;
    modal.classList.remove('modal-hidden');

    isLoading(false);
    logInfo(`Character: ${character}, Action: ${action}, Temperature: ${temperature.toFixed(2)}`);
}

function createRequestData(character, action, temperature) {
    return {
        model: _CONFIG_.GPT_MODEL,
        messages: [
            {
                role: 'user',
                content: `Sei ${character} e devi ${action} in un massimo di 100 caratteri senza uscire mai dal personaggio`
            },
        ],
        temperature: temperature
    };
} 

function getRandomArrayItem(arr) {
    const randIdx = Math.floor(Math.random() * arr.length);
    return arr[randIdx];
}

function isLoading(state) {
    const loading = document.querySelector('.loading');
    if(state) {
        loading.classList.remove('loading-hidden');
    } else {
        loading.classList.add('loading-hidden');
    }
}

function logInfo(msg) {
    const log = document.querySelector('.log');
    log.innerText = `[LOG] ${msg}`;
}

function init() {
    const characters = document.querySelectorAll('.character');
    characters.forEach((el) => {
        el.addEventListener('click', function() {
            const character = el.dataset.character;
            playCharacter(character);
        });
    });
}

init();
