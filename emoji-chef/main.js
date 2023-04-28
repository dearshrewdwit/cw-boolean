const API_BASE_URL = 'https://api.openai.com/v1';
const API_KEY = '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';

let bowl = [];
const bowlMaxSlots = 3;
const bowlSlots = document.querySelectorAll('.bowl');
const cookBtn = document.querySelector('#cook');

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


function createRequestData(bowl, temperature) {
    return {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'Sai creare ricette molto brevi, facili e con titoli creativi. Scrivi il titolo tra la stringa *** senza usare spazi prima e dopo.'
            },        
            {
                role: 'user',
                content: `Crea una ricetta con questi ingredienti: ${bowl.join(', ')}.`
            }
        ],
        temperature: temperature
    };
}

function createRecipe() {
    const temperature = Math.random();
    const reqData = createRequestData(bowl, temperature);
    let randomMessageInterval;

    console.log(bowl, temperature);
    
    randomMessageInterval = randomLoadingMessage();
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
            const { title, instructions } = getRecipeParts(result.choices[0].message.content);
            console.log(title, instructions);
            getRecipeImageByTitle(title, function(image) {
                showRecipe(title, instructions, image);
                isLoading(false);
                clearInterval(randomMessageInterval);
                emptyBowl();
            });


        })
        .catch(error => console.log('error', error)); 
}

function getRecipeImageByTitle(title, cb) {
    const reqData = {
        prompt: `Crea una immagine per questa ricetta: ${title}`,
        n: 1,
        size: '512x512',
        response_format: 'url'
    };

    fetch(`${API_BASE_URL}/images/generations`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(reqData)
    })
    .then(response => response.json())
    .then(result => {
        const image = result.data[0].url;
        cb(image);
    })
    .catch(error => console.log('error', error)); 
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

function randomLoadingMessage() {
    const loadingMessage = document.querySelector('#loading-message');

    const messages = [
        'Preparo gli ingredienti...',
        'Scaldo i fornelli...',
        'Mescolo nella ciotola...',
        'Scatto foto per Instagram...',
        'Prendo il mestolo...',
        'Metto il grembiule',
        'Mi lavo le mani'
    ];
    
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

function showRecipe(title, instructions, image) {
    const modalToggle = document.querySelector('.modal-toggle');
    const recipeTitle = document.querySelector('#title');
    const recipeInstructions = document.querySelector('#instructions');
    const recipeImage = document.querySelector('#image');

    recipeTitle.innerText = title;
    recipeInstructions.innerText = instructions;
    recipeImage.src = image;
    modalToggle.checked = true;
}

function emptyBowl() {
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
            "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-OQYkzDHAGLKkApVfFFsJ2xTt/user-kXZuAH3mzmOrrv63jJtSVNPc/img-gP0hJrPB4AqMfxFCAIthO7dG.png?st=2023-04-28T12%3A18%3A38Z&se=2023-04-28T14%3A18%3A38Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-04-27T20%3A35%3A12Z&ske=2023-04-28T20%3A35%3A12Z&sks=b&skv=2021-08-06&sig=eSCNuCKNKBzH4%2BtlXEMDZDcdRCtd5FuqHmQoK%2BJnLw8%3D"
        }
    ]
}
*/