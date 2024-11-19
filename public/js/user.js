document.addEventListener('DOMContentLoaded', function () {
    const userBtn = document.getElementById('user-btn');
    const userNameInput = document.getElementById('user-name');
    const userEmailInput = document.getElementById('user-email');
    const userSubmitBtn = document.getElementById('submit-user-info');

    let inactivityTimeout;

    function redirectToVideoPage() {
        window.location.href = 'video.html'; // Change this to your video page URL
    }

    function showAlert(message, className = '') {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-dismissible fade show ${className}`;
        alertElement.innerHTML = `
            <strong>${message}</strong>
        `;
        document.body.appendChild(alertElement);

        // Automatically close alert after 3 seconds
        setTimeout(function () {
            alertElement.classList.remove('show');
            alertElement.classList.add('fade');
            setTimeout(function () {
                alertElement.remove();
            }, 200); // Match CSS fade transition duration
        }, 3000);
    }

    // Start inactivity timer
    function startInactivityTimer() {
        inactivityTimeout = setTimeout(redirectToVideoPage, 10000); // 10 seconds
    }

    // Reset inactivity timer when the start button is pressed
    if (userBtn) {
        userBtn.addEventListener('click', function () {
            clearTimeout(inactivityTimeout);
            setTimeout(function () {
                window.location.href = 'info.html';
            });
        });
    }

    // Event listener for User Info Form submission
    if (userSubmitBtn) {
        userSubmitBtn.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent form submission
            const userName = userNameInput.value.trim();
            const userEmail = userEmailInput.value.trim();
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);

            setTimeout(function () {
                window.location.href = 'game.html';
            }, 3000);
        });
    }

    // Start the inactivity timer on page load
    startInactivityTimer();
});
