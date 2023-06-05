// Loading component
const loading = document.querySelector('.loading');

// Modal component
const modal = document.querySelector('.modal');
const modalContent = modal.querySelector('.modal-content');
const modalClose = modal.querySelector('.modal-close');
modalClose.addEventListener('click', function() {
    modal.classList.add('hidden');
});

async function playCharacter(character) {
    const temperature = Math.random();
    const action = getRandomAction();
    loading.classList.remove('hidden');

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
                    content: `You are ${character} and should ${action} in a maximum of 100 characters without breaking character`
                },
            ],
            temperature: temperature
        })
    })

    const jsonData = await response.json();
    const content = jsonData.choices[0].message.content;

    modalContent.innerHTML = `
        <h2>${character}</h2>
        <p>${content}</p>
        <code>Character: ${character}, Action: ${action}, Temperature: ${temperature.toFixed(2)}</code>
    `;

    modal.classList.remove('hidden');
    loading.classList.add('hidden');
}

function getRandomAction() {
    const actions = [
      'say hello in your most iconic way',
      'give fashion advice based on your tastes',
      'share a summary of your last epic adventure',
      'reveal your hopes and dreams to me',
      'tell me who is your best friend',
      'write your linkedin bio'
    ];

    const randIdx = Math.floor(Math.random() * actions.length);
    return actions[randIdx];
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
