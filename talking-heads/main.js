const API_BASE_URL = 'https://api.openai.com/v1';
const API_KEY = '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';

const loadingScreen = document.querySelector('#loading-screen');

function logInfo(msg) {
    const log = document.querySelector('#log');
    log.innerText = `[LOG] ${msg}`;
}



const defaultActions = [
    'saluti',
    'ti presenti',
    'dici una cosa buffa',
    'urli',
    'mi dai un consiglio'
];

function createRequestData(character, action, temperature) {
    return {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `sei ${character} e ${action} al massimo in 100 caratteri e non uscire mai dal personaggio`
            },
            // {
            //     role: 'user',
            //     content: 'ciao'
            // }
        ],
        temperature: temperature
    };
} 

function getRandomAction(actions) {
    const randIdx = Math.floor(Math.random() * actions.length);
    return actions[randIdx];
}

function playCharacter(character) {
    const action = getRandomAction(defaultActions);
    const temperature = Math.random();
    const reqData = createRequestData(character, action, temperature);
    console.log(character, action, temperature);
    logInfo(`${character}, Action: ${action}, Temp: ${temperature.toFixed(2)}`);
    
    loadingScreen.classList.remove('hidden');

    fetch(`${API_BASE_URL}/chat/completions`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            method: 'POST',
            body: JSON.stringify(reqData)
        })
        .then(response => response.json())
        .then(result => {
            console.log(result.choices[0].message.content);
            loadingScreen.classList.add('hidden');
            showResponse(result.choices[0].message.content);            
        })
        .catch(error => console.log('error', error)); 
}

const characters = document.querySelectorAll('.character');
characters.forEach((el) => {
    el.addEventListener('click', function() {
        const character = el.dataset.character;
        playCharacter(character);
    });
});

const modalToggle = document.querySelector('#modal');
const modalContent = document.querySelector('.modal-content');
function showResponse(text) {
    modalContent.innerText = text;
    modalToggle.checked = true;
}

/*
{
    "id": "chatcmpl-78ZoGjC0usfWK11BUpAN7GcXx2K2E",
    "object": "chat.completion",
    "created": 1682278632,
    "model": "gpt-3.5-turbo-0301",
    "usage": {
        "prompt_tokens": 38,
        "completion_tokens": 15,
        "total_tokens": 53
    },
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "Le tartarughe possono respirare attraverso il loro sedere."
            },
            "finish_reason": "stop",
            "index": 0
        }
    ]
}
*/