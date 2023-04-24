const API_BASE_URL = 'https://api.openai.com/v1';
const API_KEY = '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';

const defaultActions = [
    'saluti',
    'ti presenti',
    'dici una cosa buffa',
    'urli',
    'mi dai un consiglio'
];

let interactionEvent;
if('ontouchstart' in document.documentElement) {
    interactionEvent = 'touchstart'; 
 } else {
    interactionEvent = 'click';
 }

function playCharacter(character) {
    const action = getRandomArrayItem(defaultActions);
    const temperature = Math.random();
    const reqData = createRequestData(character, action, temperature);
    
    console.log(interactionEvent, character, action, temperature);
    isLoading(true);

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
            isLoading(false);
            showResponse(result.choices[0].message.content); 
            logInfo(`${character}, Action: ${action}, Temp: ${temperature.toFixed(2)}`);           
        })
        .catch(error => console.log('error', error)); 
}

function createRequestData(character, action, temperature) {
    return {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `sei ${character} e ${action} al massimo in 100 caratteri e non uscire mai dal personaggio`
            },
            // { role: 'user', content: 'ciao' }
        ],
        temperature: temperature
    };
} 

function getRandomArrayItem(arr) {
    const randIdx = Math.floor(Math.random() * arr.length);
    return arr[randIdx];
}

function isLoading(state) {
    const loadingScreen = document.querySelector('#loading-screen');
    if(state) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }

}

function showResponse(text) {
    const modalToggle = document.querySelector('#modal');
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerText = text;
    modalToggle.checked = true;
}

function logInfo(msg) {
    const log = document.querySelector('#log');
    log.innerText = `[LOG] ${msg}`;
}

function init() {
    const characters = document.querySelectorAll('.character');
    characters.forEach((el) => {
        el.addEventListener(interactionEvent, function() {

            el.classList.add('scale-75');
            setTimeout(function() {
                el.classList.remove('scale-75');
            }, 200);

            const character = el.dataset.character;
            playCharacter(character);
        });
    });
}

init();

/* 
// GPT response
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