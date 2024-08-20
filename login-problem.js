document.addEventListener("DOMContentLoaded", function() {
    // Auto-resize Reason textarea
    const textarea = document.querySelector("textarea");

    textarea.addEventListener("input", function() {
        // Reset the height to allow shrinking
        this.style.height = "auto";
        // Set the height based on the scroll height
        this.style.height = (this.scrollHeight) + "px";
    });

    // Form submission logic
    document.getElementById("loginProblemForm").addEventListener("submit", function(e) {
        e.preventDefault();

        // Get the mobile number input value
        const mobileNumber = document.getElementById("mobileNumber").value;

        // Validate that the mobile number is exactly 10 digits
        if (!/^\d{10}$/.test(mobileNumber)) {
            alert("Please enter a valid 10-digit mobile number.");
            return; // Stop the form from submitting
        }

        const formData = new FormData(e.target);
        const submitButton = e.target.querySelector('button[type="submit"]');
        const spinnerContainer = document.getElementById("spinner-container");

        // Show the spinner
        spinnerContainer.style.display = "block";

        // Disable the submit button
        submitButton.disabled = true;

        fetch('https://script.google.com/macros/s/AKfycbycZZ_t6R4Jw3UnPtxRFpMclNLdc_FI42p-9vBYCuHgRYySXNMe-3DeKY7pnwcC1nC6/exec', { // Replace with your Web App URL
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide the spinner
            spinnerContainer.style.display = "none";

            if (data.result === 'success') {
                // Show success message and redirect after user clicks OK
                if (confirm('Form submitted successfully! Click OK to go to the homepage.')) {
                    window.location.href = 'index.html';
                }
            } else {
                // Re-enable the submit button and show error message
                submitButton.disabled = false;
                document.getElementById("message").textContent = `Error: ${data.error}`;
            }
        })
        .catch(error => {
            // Hide the spinner
            spinnerContainer.style.display = "none";

            // Re-enable the submit button and show error message
            submitButton.disabled = false;
            document.getElementById("message").textContent = "Error submitting form.";
            console.error("Error:", error);
        });
    });
});
