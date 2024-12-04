document.addEventListener('DOMContentLoaded', function () {
    const userNameInput = document.getElementById('user-name');
    const userSubmitBtn = document.getElementById('submit-user-info');

    // Event listener for User Info Form submission
    if (userSubmitBtn) {
        userSubmitBtn.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent form submission
            let userName = userNameInput.value.trim();

            // Set default name to 'Guest' if no name is provided
            if (userName === "") {
                userName = "Guest";
            }

            localStorage.setItem('userName', userName);

            setTimeout(function () {
                window.location.href = 'game.html';
            });
        });
    }
});

