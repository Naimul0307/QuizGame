document.addEventListener('DOMContentLoaded', function() {
    // const userForm = document.getElementById('user-form');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOptions = document.getElementById('settings-options');
    const gameTimeInput = document.getElementById('game-time');
    const questionsCountInput = document.getElementById('questions-count');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

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

    // Event listener for Settings button
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            settingsOptions.style.display = 'block';
        });
    }

    // Event listener for Save Settings button
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form submission
            // Save settings logic here
            const gameTime = parseInt(gameTimeInput.value);
            const questionsCount = parseInt(questionsCountInput.value);
            console.log(`Game Time: ${gameTime} minutes, Questions Count: ${questionsCount}`);
            // Optionally, you can save these settings for future use
            localStorage.setItem('gameTime', gameTime);
            localStorage.setItem('questionsCount', questionsCount);
            showAlert('Settings saved!', 'success'); // Show centered alert
            // Redirect after showing the alert message for 3 seconds
            setTimeout(function() {
                window.location.href = 'user.html';
            });
        });
    }

});