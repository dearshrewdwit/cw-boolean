// Loading component
const loading = document.querySelector('.loading');

// Modal component
const modal = document.querySelector('.modal');
const modalImage = modal.querySelector('.modal-image');
const modalContent = modal.querySelector('.modal-content');
const modalClose = modal.querySelector('.modal-close');
modalClose.addEventListener('click', function() {
    modal.classList.add('hidden');
});

const bowlSlots = document.querySelectorAll('.bowl-slot');
const cookBtn = document.querySelector('.cook-btn');

let bowl = [];
const bowlMaxSlots = bowlSlots.length;

// Generalizzare la funzione di request
async function makeRequest(endpoint, data) {
    const response = await fetch(_CONFIG_.API_BASE_URL + endpoint, {
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

function addIngredient(ingredient) {
    if (bowl.length === bowlMaxSlots) {
        bowl.shift();
    }
    
    bowl.push(ingredient);
    
    bowlSlots.forEach(function(el, i) {
        let ingredient = '?';
        
        if (bowl[i]) {
            ingredient = bowl[i];
        } 

        el.innerText = ingredient;
    });

    if(bowl.length === bowlMaxSlots) {
        cookBtn.classList.remove('hidden');
    }
}

async function createRecipe() {
    let randomMessageInterval;
    randomMessageInterval = randomLoadingMessage();
    loading.classList.remove('hidden');

    const result = await makeRequest('/chat/completions', {
        model: _CONFIG_.GPT_MODEL,
        messages: [
            {
                role: 'user',
                content: `Crea una ricetta con questi ingredienti: ${bowl.join(', ')}. La ricetta deve essere facile e con un titolo creativo e divertente. Le tue risposte sono solo in formato JSON come questo esempio:\n\n###\n\n {"titolo": "Titolo ricetta", "ingredienti": "1 uovo e 1 pomodoro", "istruzioni": "mescola gli ingredienti e metti in forno"}###`
            }
        ],
        temperature: 0.7
    });

    const content = JSON.parse(result.choices[0].message.content);

    modalContent.innerHTML = `
        <h2>${content.titolo}</h2>
        <p>${content.ingredienti}</p>
        <p>${content.istruzioni}</p>
    `;

    modal.classList.remove('hidden');
    loading.classList.add('hidden');
    clearInterval(randomMessageInterval);  

    const imageJSON = await makeRequest('/images/generations', {
        prompt: `Crea una immagine per questa ricetta: ${content.titolo}`,
        n: 1,
        size: '512x512',
        response_format: 'url'
    });

    const imageUrl = imageJSON.data[0].url;
    modalImage.innerHTML = `<img src="${imageUrl}" alt="foto ricetta" />`
    clearBowl();
}

function clearBowl() {
    bowl = [];
    bowlSlots.forEach(function(el) {
        el.innerText = '?';
    });     
}

function randomLoadingMessage() {     
    const messages = [
        'Preparo gli ingredienti...',
        'Scaldo i fornelli...',
        'Mescolo nella ciotola...',
        'Scatto foto per Instagram...',
        'Prendo il mestolo...',
        'Metto il grembiule...',
        'Mi lavo le mani...',
        'Tolgo le bucce...',
        'Pulisco il ripiano...'
    ];
    
    const loadingMessage = document.querySelector('.loading-message'); 
    loadingMessage.innerText = messages[0];
    return setInterval(function() {
        const randIdx = Math.floor(Math.random() * messages.length);
        loadingMessage.innerText = messages[randIdx];
    }, 2000);
}

function init() {
    const ingredients = document.querySelectorAll('.ingredient');
    ingredients.forEach((el) => {
        el.addEventListener('click', function() {
            addIngredient(el.innerText);
        });
    });

    cookBtn.addEventListener('click', createRecipe);
}

init();

/* GPT Image generation response
{
    "created": 1682687918,
    "data": [
        {
            "url": "<url>"
        }
    ]
}
*/