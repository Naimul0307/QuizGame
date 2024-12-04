document.addEventListener('DOMContentLoaded', function () {
    const userBtn = document.getElementById('user-btn');

    let inactivityTimeout;

    // Get the inactivity redirect setting from localStorage
    const isInactivityRedirectEnabled = localStorage.getItem('inactivityRedirectEnabled') === 'true';

    function redirectToVideoPage() {
        if (window.location.pathname !== '/info.html') {
            window.location.href = 'video.html'; // Change this to your video page URL
        }
    }

    // Start inactivity timer only if the redirect is enabled
    function startInactivityTimer() {
        if (isInactivityRedirectEnabled) {
            inactivityTimeout = setTimeout(redirectToVideoPage, 10000); // 10 seconds
        }
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

    // Start the inactivity timer on page load if redirection is enabled
    startInactivityTimer();
});
