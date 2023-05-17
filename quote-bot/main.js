const defaultActions = [
    'salutare nel tuo modo più iconico',
    'dare un consiglio di stile in base ai tuoi gusti',
    'raccontare la tua ultima avventura',
    'svelarmi i tuoi sogni',
    'dirmi chi è il tuo migliore amico',
    'scrivere la tua bio di linkedin'
];

// Modal component
const modal = document.querySelector('.modal');
const modalContent = modal.querySelector('.modal-content');
const modalTitle = modal.querySelector('.modal-title');
const modalText = modal.querySelector('.modal-text');
const modalClose = modal.querySelector('.modal-close');
modalClose.addEventListener('click', function() {
    modal.classList.add('hidden');
});


async function playCharacter(character) {
    const action = getRandomArrayItem(defaultActions);
    const temperature = Math.random();
    isLoading(true);

    const response = await fetch(_CONFIG_.API_BASE_URL + '/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${_CONFIG_.API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify({
            model: _CONFIG_.GPT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: `Sei ${character} e devi ${action} in un massimo di 100 caratteri senza uscire mai dal personaggio`
                },
            ],
            temperature: temperature
        })
    })

    const jsonData = await response.json();
    modalTitle.innerText = character;
    modalText.innerText = jsonData.choices[0].message.content;
    modal.classList.remove('hidden');

    isLoading(false);
    logInfo(`Character: ${character}, Action: ${action}, Temperature: ${temperature.toFixed(2)}`);
}

function getRandomArrayItem(arr) {
    const randIdx = Math.floor(Math.random() * arr.length);
    return arr[randIdx];
}

function isLoading(state) {
    const loading = document.querySelector('.loading');
    if(state) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
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
