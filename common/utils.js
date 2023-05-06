function makeRequest(path, data) {
    return fetch(_CONFIG_.API_BASE_URL + path, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${_CONFIG_.API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
}