document.addEventListener('DOMContentLoaded', function() {
    const declarationCheckbox = document.getElementById('declaration-check');
    const startButton = document.getElementById('start-button');
    const startButtonLink = document.getElementById('start-button-link');

    // Checkbox event listener
    declarationCheckbox.addEventListener('change', function() {
        // Enable/disable the start button based on checkbox state
        startButton.disabled = !this.checked;

        // Optional: Prevent clicking the link if button is disabled
        if (this.checked) {
            startButtonLink.style.pointerEvents = 'auto'; // Allow clicks on link
        } else {
            startButtonLink.style.pointerEvents = 'none'; // Prevent clicks on link
        }
    });

    // Optional: Prevent link navigation if button is disabled
    // (This adds an extra layer of prevention)
    startButtonLink.addEventListener('click', function(event) {
        if (startButton.disabled) {
            event.preventDefault(); // Stop the link from navigating
            // You could optionally show a message here
            // alert("Please agree to the declaration before starting.");
        } else {
            // !!! IMPORTANT !!!
            // In a real application, replace '#' in the HTML link
            // with the actual URL of your test page.
            // Example: this.href = 'test-page.html';
            console.log("Navigating to the test..."); // Placeholder action
        }
    });

    // Ensure button state matches checkbox state on page load
    // (in case browser autofills the checkbox)
    startButton.disabled = !declarationCheckbox.checked;
    if (!declarationCheckbox.checked) {
        startButtonLink.style.pointerEvents = 'none';
    }

});