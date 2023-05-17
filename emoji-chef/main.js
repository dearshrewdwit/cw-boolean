const bowlSlots = document.querySelectorAll('.bowl-slot');
const cookBtn = document.querySelector('.cook-btn');

// Modal component
const modal = document.querySelector('.modal');
const modalContent = modal.querySelector('.modal-content');
const modalImage = modal.querySelector('.modal-image');
const modalTitle = modal.querySelector('.modal-title');
const modalText = modal.querySelector('.modal-text');
const modalClose = modal.querySelector('.modal-close');
modalClose.addEventListener('click', function() {
    modal.classList.add('hidden');
});

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

let bowl = [];
const bowlMaxSlots = 3;

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

function addIngredient(ingredient) {
    if(bowl.length === bowlMaxSlots) {
        bowl.shift();
    }
    
    bowl.push(ingredient);

    for(let i = 0; i < bowlMaxSlots; i++) {
        const ingredient = bowl[i] || '?';
        const bowlSlot = bowlSlots[i];
        bowlSlot.innerText = ingredient;
    }

    if(bowl.length === bowlMaxSlots) {
        cookBtn.classList.remove('hidden');
    }
}

async function createRecipe() {
    const temperature = Math.random();
    let randomMessageInterval;
    console.log(bowl, temperature);
    
    randomMessageInterval = randomLoadingMessage(messages);
    isLoading(true);

    const result = await makeRequest(_CONFIG_.API_BASE_URL + '/chat/completions', {
        model: _CONFIG_.GPT_MODEL,
        messages: [
            {
                role: 'user',
                content: `Crea una ricetta con questi ingredienti: ${bowl.join(', ')}. La ricetta deve essere breve, facile e con un titolo creativo e divertente. Scrivi il titolo tra la stringa *** senza usare spazi prima e dopo.`
            }
        ],
        temperature: temperature
    });
    const content = result.choices[0].message.content;    
    const { title, instructions } = getRecipeParts(content);
    showRecipe(title, instructions);
    console.log(title, instructions);

    isLoading(false);
    clearInterval(randomMessageInterval);  

    const imageJSON = await makeRequest(_CONFIG_.API_BASE_URL + '/images/generations', {
        prompt: `Crea una immagine per questa ricetta: ${title}`,
        n: 1,
        size: '512x512',
        response_format: 'url'
    });

    const imageUrl = imageJSON.data[0].url;
    modalImage.innerHTML = `<img src="${imageUrl}" alt="foto ricetta" />`

    clearBowl();
}

function getRandomArrayItem(arr) {
    const randIdx = Math.floor(Math.random() * arr.length);
    return arr[randIdx];
}

function isLoading(state) {
    const loadingScreen = document.querySelector('.loading');
    if(state) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }
}

function randomLoadingMessage(messages) {
    const loadingMessage = document.querySelector('.loading-message');    
    loadingMessage.innerText = getRandomArrayItem(messages);
    return setInterval(function() {
        loadingMessage.innerText = getRandomArrayItem(messages);
    }, 2000);
}

function getRecipeParts(recipe) {
    const parts = recipe.split('***');
    return {
        title: parts[1],
        instructions: parts[2]
    }
}

function showRecipe(title, instructions) {
    modalTitle.innerText = title;
    modalText.innerText = instructions;
    modal.classList.remove('hidden');
}

function clearBowl() {
    bowl = [];
    bowlSlots.forEach(function(el) {
        el.innerText = '?';
    });     
}

function init() {
    const ingredients = document.querySelectorAll('.ingredient');
    ingredients.forEach((el) => {
        el.addEventListener('click', function() {
            const ingredient = el.innerText;
            console.log(ingredient);
            addIngredient(ingredient);
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