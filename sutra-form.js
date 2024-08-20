document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch names and mobile numbers from the CSV file
    async function fetchNames() {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1W3OwBoptpvnL_dSohSZn4elnrIwTn2nanEEpBUsjiSU/pub?output=csv');
        const data = await response.text();
        const rows = data.split('\n').map(row => row.split(','));
        return rows.reduce((acc, [id, name, password, mobile]) => {
            acc[id.toUpperCase()] = { name, mobile };
            return acc;
        }, {});
    }

    // Store names and mobile numbers in a variable for quick access
    let nameLookup = {};

    // Load names and mobile numbers on page load
    fetchNames().then(data => {
        nameLookup = data;
    });

    // Event listener for LP ID input
    document.getElementById("lp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        const info = nameLookup[id] || {};
        const name = info.name || '';
        const mobile = info.mobile || '';
        document.getElementById("lp-name").textContent = name ? `Name: ${name}` : '';
        document.getElementById("lp-name-hidden").value = name;
        document.getElementById("lp-mobile-hidden").value = mobile;
    });

    // Event listener for ALP ID input
    document.getElementById("alp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        const info = nameLookup[id] || {};
        const name = info.name || '';
        const mobile = info.mobile || '';
        document.getElementById("alp-name").textContent = name ? `Name: ${name}` : '';
        document.getElementById("alp-name-hidden").value = name;
        document.getElementById("alp-mobile-hidden").value = mobile;
    });

    // Initialize Flatpickr for the time input with 24-hour format
    flatpickr("#sign-on-time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
    });

    // Display the welcome message with the user's name below the SUTRA FORM heading
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        const welcomeElement = document.createElement('div');
        welcomeElement.id = 'welcome-message';
        welcomeElement.style.textAlign = 'center';
        welcomeElement.style.marginBottom = '20px';
        welcomeElement.style.fontWeight = 'bold';
        welcomeElement.innerText = `Welcome ${userName}`;
        const formContainer = document.querySelector('.form-container');
        const sutraFormHeading = formContainer.querySelector('h2');
        sutraFormHeading.insertAdjacentElement('afterend', welcomeElement);
    }

    // Function to convert form data to uppercase
    function convertFormDataToUpperCase(formData) {
        const newFormData = new FormData();
        formData.forEach((value, key) => {
            newFormData.append(key, value.toUpperCase());
        });
        return newFormData;
    }

    // Form submission logic
    document.getElementById("sutra-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const uppercaseFormData = convertFormDataToUpperCase(formData);

        const submitButton = e.target.querySelector('button[type="submit"]');
        const spinnerContainer = document.getElementById("spinner-container");

        // Show the spinner
        spinnerContainer.style.display = "block";

        // Disable the submit button
        submitButton.disabled = true;

        fetch('https://script.google.com/macros/s/AKfycbzBh9m9FzTAnHihlfhEZB4vuC2QKSWBHLrmTtgKwehdLQRkGZVMOLCy36SgAMBbHcehrQ/exec', {
            method: 'POST',
            body: uppercaseFormData
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

    // Function to handle logout
    document.querySelector('.logout-button').addEventListener('click', function() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        window.location.href = 'sutra-login.html'; // Redirect to login page after logout
    });
});
