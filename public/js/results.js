document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const userName = params.get('name');
    const userEmail = params.get('email');
    const userNumber = params.get('number');
    const score = params.get('score');

    // Display user info and score
    document.getElementById('user-name').textContent = userName;
    document.getElementById('user-email').textContent = userEmail;
    document.getElementById('user-number').textContent = userNumber;
    document.getElementById('user-score').textContent = score;
});
