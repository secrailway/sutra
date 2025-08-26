let users = [];

document.addEventListener('DOMContentLoaded', loadCSV);

async function loadCSV() {
    try {
        const response = await fetch('sutra-login-html.csv', { redirect: 'follow' });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, URL: sutra-login-html.csv`);
        }
        const text = await response.text();
        console.log('Raw CSV data:', text);
        users = parseCSV(text);
        console.log('Parsed Users:', users);
    } catch (error) {
        console.error('Error loading CSV file:', error);
        document.getElementById('message').innerText = 'Failed to load user data. Please try again later.';
    }
}

function parseCSV(text) {
    const rows = text.split('\n').filter(row => row.trim() !== '');
    const users = [];
    for (let i = 1; i < rows.length; i++) { // Skip header row
        const columns = rows[i].split(',').map(col => col.trim());
        if (columns.length >= 3) {
            users.push({
                userId: columns[0].toUpperCase(),
                name: columns[1],
                password: columns[2]
            });
        }
    }
    return users;
}

document.querySelector('.top-right-image').addEventListener('click', function() {
    window.location.href = 'index.html';
});

function login() {
    const userId = document.getElementById('userId').value.trim().toUpperCase();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('message');

    console.log('Attempting login with:', { userId, password });
    console.log('Available users:', users);

    const user = users.find(u => {
        console.log(`Comparing: ${u.userId} === ${userId} && ${u.password} === ${password}`);
        return u.userId === userId && u.password === password;
    });

    if (user) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userId', user.userId);
        sessionStorage.setItem('userName', user.name);
        message.style.color = 'green';
        message.innerText = 'Login successful!';
        window.location.href = 'sutra-form.html';
    } else {
        message.style.color = 'red';
        message.innerText = 'Invalid User ID or Password!';
    }
}