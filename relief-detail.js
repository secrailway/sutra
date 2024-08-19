document.addEventListener("DOMContentLoaded", function() {
    // Auto-resize Reason textarea if present
    const textarea = document.querySelector("textarea");
    if (textarea) {
        textarea.addEventListener("input", function() {
            // Reset the height to allow shrinking
            this.style.height = "auto";
            // Set the height based on the scroll height
            this.style.height = (this.scrollHeight) + "px";
        });
    }

    // Function to fetch names from the CSV file
    async function fetchNames() {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1W3OwBoptpvnL_dSohSZn4elnrIwTn2nanEEpBUsjiSU/pub?output=csv');
        const data = await response.text();
        const rows = data.split('\n').map(row => row.split(','));
        return rows.reduce((acc, [id, name]) => {
            acc[id.toUpperCase()] = name; // Convert ID to uppercase for case-insensitive matching
            return acc;
        }, {});
    }

    // Store names in a variable for quick access
    let nameLookup = {};

    // Load names on page load
    fetchNames().then(names => {
        nameLookup = names;
    });

    // Event listener for LP ID input
    document.getElementById("lp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        const name = nameLookup[id] || '';
        document.getElementById("lp-name").textContent = name ? `Name: ${name}` : '';
        document.getElementById("lp-name-hidden").value = name;
    });

    // Event listener for ALP ID input
    document.getElementById("alp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        const name = nameLookup[id] || '';
        document.getElementById("alp-name").textContent = name ? `Name: ${name}` : '';
        document.getElementById("alp-name-hidden").value = name;
    });

    // Initialize Flatpickr for the time input with 24-hour format
    flatpickr("#relief-time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true // Ensures the picker uses 24-hour format
    });

    // Form submission logic
    document.getElementById("relief-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const submitButton = e.target.querySelector('button[type="submit"]');

        // Disable the submit button
        submitButton.disabled = true;

        fetch('https://script.google.com/macros/s/AKfycbzoNjPOf9lR6kDUJQULYDlmQvIjKXWNNDpVIM5Y52__WAcJ8FKZwkYlmfIREvaM3h8_cA/exec', { // Replace with your Web App URL
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                // Show success message and redirect after user clicks OK
                if (confirm('Form submitted successfully! Click OK to go to the homepage.')) {
                    window.location.href = 'index.html';
                }
            } else {
                // Re-enable the submit button and show error message
                submitButton.disabled = false;
                alert(`Error: ${data.error}`);
            }
        })
        .catch(error => {
            // Re-enable the submit button and show error message
            submitButton.disabled = false;
            alert("Error submitting form.");
            console.error("Error:", error);
        });
    });
});
