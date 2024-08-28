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

    // Function to handle ID input and display name or error message
    function handleIdInput(id, nameElementId, nameHiddenElementId, mobileHiddenElementId) {
        const info = nameLookup[id] || {};
        const name = info.name || 'PLEASE CHECK ID';
        const mobile = info.mobile || '';
        document.getElementById(nameElementId).textContent = name !== 'PLEASE CHECK ID' ? `Name: ${name}` : name;
        document.getElementById(nameHiddenElementId).value = name !== 'PLEASE CHECK ID' ? name : '';
        document.getElementById(mobileHiddenElementId).value = name !== 'PLEASE CHECK ID' ? mobile : '';
    }

    // Event listener for LP ID input
    document.getElementById("lp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        handleIdInput(id, "lp-name", "lp-name-hidden", "lp-mobile-hidden");
    });

    // Event listener for ALP ID input
    document.getElementById("alp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        handleIdInput(id, "alp-name", "alp-name-hidden", "alp-mobile-hidden");
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
    
        // Capture current date and time
        const currentTimestamp = formatTimestamp(new Date());
        document.getElementById("timestamp").value = currentTimestamp;
    
        const formData = new FormData(e.target);
        const uppercaseFormData = convertFormDataToUpperCase(formData);
    
        const submitButton = e.target.querySelector('button[type="submit"]');
        const spinnerContainer = document.getElementById("spinner-container");
    
        // Show the spinner
        spinnerContainer.style.display = "block";
    
        // Disable the submit button
        submitButton.disabled = true;
    
        fetch('https://script.google.com/macros/s/AKfycbzj6q4tr9DtNqpFIAZGIKPXTHkV1FC5X-dVOXPS7aW-XoeDuuymjylBJpDVVIKnfo8U5g/exec', {
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
    
    // Function to format the timestamp as "DD/MM/YYYY HH:MM:SS"
    function formatTimestamp(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }  
    

    // Function to handle logout
    document.querySelector('.logout-button').addEventListener('click', function() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        window.location.href = 'sutra-login.html'; // Redirect to login page after logout
    });
});
