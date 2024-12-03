document.addEventListener('DOMContentLoaded', function() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOptions = document.getElementById('settings-options');
    const gameTimeInput = document.getElementById('game-time');
    const timeUnitSelect = document.getElementById('time-unit');
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

            // Get game time and selected unit
            const gameTime = parseInt(gameTimeInput.value, 10);
            const timeUnit = timeUnitSelect.value;

            // Convert to seconds based on selected unit
            const gameTimeSeconds = timeUnit === 'minutes' ? gameTime * 60 : gameTime;

            const questionsCount = parseInt(questionsCountInput.value, 10);

            console.log(`Game Time: ${gameTime} ${timeUnit} (${gameTimeSeconds} seconds), Questions Count: ${questionsCount}`);

            // Save settings in both formats
            localStorage.setItem('gameTimeInput', gameTime);
            localStorage.setItem('gameTimeUnit', timeUnit);
            localStorage.setItem('gameTimeSeconds', gameTimeSeconds);
            localStorage.setItem('questionsCount', questionsCount);

            // Show centered alert
            showAlert('Settings saved!', 'success');

            // Redirect after showing the alert message for 3 seconds
            setTimeout(function() {
                window.location.href = 'user.html';
            }, 3000);
        });
    }
});
