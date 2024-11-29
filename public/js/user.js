document.addEventListener('DOMContentLoaded', function () {
    const userBtn = document.getElementById('user-btn');

    let inactivityTimeout;

    function redirectToVideoPage() {
        if (window.location.pathname !== '/info.html') {
            window.location.href = 'video.html'; // Change this to your video page URL
        }
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


    // Start the inactivity timer on page load
    startInactivityTimer();
});
