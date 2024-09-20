document.addEventListener('DOMContentLoaded', function() {
    const userBtn = document.getElementById('user-btn');
    const userNameInput = document.getElementById('user-name');
    const userEmailInput = document.getElementById('user-email');
    const userNumberInput = document.getElementById('user-number');
    const userSubmitBtn = document.getElementById('submit-user-info');

    function showAlert(message, className = '') {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-dismissible fade show ${className}`;
        alertElement.innerHTML = `
            <strong>${message}</strong>
        `;
        document.body.appendChild(alertElement);

        // Automatically close alert after 3 seconds
        setTimeout(function() {
            alertElement.classList.remove('show');
            alertElement.classList.add('fade');
            setTimeout(function() {
                alertElement.remove();
            }, 200); // Match CSS fade transition duration
        }, 3000);
    }

    // Event listener for User button
    if (userBtn) {
        userBtn.addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = 'info.html';
            });
        });
    }

    // Event listener for User Info Form submission
    if (userSubmitBtn) {
        userSubmitBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form submission
            // Validate user info
            const userName = userNameInput.value.trim();
            const userEmail = userEmailInput.value.trim();
            const userNumber = userNumberInput.value.trim();
            // Save user info logic here
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userNumber', userNumber);
            // Redirect after showing the alert message for 3 seconds
            setTimeout(function() {
                window.location.href = 'game.html';
            });
        });
    }

});