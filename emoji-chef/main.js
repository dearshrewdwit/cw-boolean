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

// abstracted function to make a HTTP request
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
                content: `Create a recipe with these ingredients: ${bowl.join(', ')}. The recipe should be easy and with a creative and fun title. Your replies should be in JSON format like this example :\n\n###\n\n {"title": "Recipe title", "ingredients": "1 egg\n1 tomato", "instructions": "mix the ingredients and put in the oven"}###`
            }
        ],
        temperature: 0.7
    });

    const content = JSON.parse(result.choices[0].message.content);

    modalContent.innerHTML = `
        <h2>${content.title}</h2>
        <p>${content.ingredients}</p>
        <p>${content.instructions}</p>
    `;

    modal.classList.remove('hidden');
    loading.classList.add('hidden');
    clearInterval(randomMessageInterval);

    const imageJSON = await makeRequest('/images/generations', {
        prompt: `Create an image for this recipe: ${content.title}`,
        n: 1,
        size: '512x512',
        response_format: 'url'
    });

    const imageUrl = imageJSON.data[0].url;
    modalImage.innerHTML = `<img src="${imageUrl}" alt="recipe photo" />`
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
        'Prepping the ingredients...',
        'Stove is heating up...',
        'Stirring ingredients in a bowl...',
        'Taking photos for Instagram...',
        'Choosing a ladle...',
        'Putting on a fancy apron...',
        'Washing my hands thoroughly...',
        'Peeling potatoes...',
        'Cleaning the countertop...'
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
