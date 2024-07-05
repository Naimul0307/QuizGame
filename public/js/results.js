document.addEventListener('DOMContentLoaded', function() {
    // Retrieve users data from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Sort users by score in descending order
    users.sort((a, b) => b.score - a.score);

    // Display top 10 users by score
    displayTopUsers(users.slice(0, 10)); // Display only the first 10 users
});

// Function to display top users sorted by score
function displayTopUsers(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = ''; // Clear previous content

    users.forEach((user, index) => {
        const row = document.createElement('div');
        row.classList.add('scoreboard-row');
        row.innerHTML = `
            <div class="scoreboard-item">${user.name}</div>
            <div class="scoreboard-item">${user.email}</div>
            <div class="scoreboard-item">${user.number}</div>
            <div class="scoreboard-item">${user.score}</div>
        `;
        usersList.appendChild(row);
    });
}

// Function to redirect to home page
function goBack() {
    window.location.href = 'user.html'; // Replace with your home page URL
}
