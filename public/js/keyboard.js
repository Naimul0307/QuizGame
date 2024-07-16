
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    document.querySelectorAll('.input-field').forEach(inputField => {
        inputField.addEventListener('focus', function() {
            console.log("Input field focused");
            // Ensure the field is focused, which should trigger the on-screen keyboard on touchscreen devices
            inputField.focus();
        });
    });
});
