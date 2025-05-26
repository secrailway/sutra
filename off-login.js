// Object to store unique passwords for each login ID
const passwords = {
    "AKT": "15750",
    "BJRI": "15930",
    "BRJN": "50400",
    "BSP": "13170",
    "KHS": "19440",
    "KRBA": "27150",
    "PND": "14280",
    "RIG": "22130",
    "SDL": "25200",
    "SJQ": "16800",
    "USL": "23310",
    "Admin": "12340"
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
