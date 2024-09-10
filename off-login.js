// Object to store unique passwords for each login ID
const passwords = {
    "AKT": "1575",
    "BJRI": "1593",
    "BRJN": "5040",
    "BSP": "1317",
    "KHS": "1944",
    "KRBA": "2715",
    "PND": "1428",
    "RIG": "2213",
    "SDL": "2520",
    "SJQ": "1680",
    "USL": "2331"
};

// Function to handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form submission

    const loginId = document.getElementById("loginId").value;
    const password = document.getElementById("password").value;

    // Validate the entered password against the stored password
    if (password === passwords[loginId]) {
        // Login successful
        alert(`Welcome ${loginId}! Login successful.`);
        // Redirect to sutra-off.html after successful login
        window.location.href = "sutra-off.html";
    } else {
        // Show error message
        document.getElementById("errorMessage").textContent = "Incorrect password. Try again.";
    }
});
