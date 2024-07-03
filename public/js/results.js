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
        if (index < 10) { // Ensure only top 10 users are displayed
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.number}</td>
                <td>${user.score}</td>
            `;
            usersList.appendChild(row);
        }
    });
}

// Function to format time in minutes:seconds (if needed)
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to redirect to home page (if needed)
function goBack() {
    window.location.href = 'index.html';
}
