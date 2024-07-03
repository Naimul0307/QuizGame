document.addEventListener('DOMContentLoaded', function() {
    // Retrieve users data from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Sort users by score in descending order
    users.sort((a, b) => b.score - a.score);

    // Display users in descending order by score
    displayUsers(users);
});

// Function to display users sorted by score (descending order)
function displayUsers(users) {
    const usersList = document.getElementById('users-list');

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.number}</td>
            <td>${user.score}</td>
        `;
        usersList.appendChild(row);
    });
}

// Function to format time in minutes:seconds
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to redirect home page
function goBack() {
    window.location.href = 'index.html';
}