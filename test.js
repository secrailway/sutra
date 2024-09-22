let currentInput = ''; // To store the id of the currently active input
let currentInputRow = null; // To store the row index for sign-off update
let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

const CLIENT_ID = '547073147985-ap3u2ed867imq6q810gjc82jfsme6tqm.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBf3C_Ly8bIF_f-t30wE2e7cMsc2hz0co0';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';



document.getElementById("modalClear").addEventListener("click", function() {
    document.getElementById("modalDate").value = '';
    document.getElementById("modalTime").value = '';
});

document.querySelector(".close").addEventListener("click", function() {
    closeDateTimeModal();
});

// Open/Close date/time modal functions
function openDateTimeModal(inputId) {
    currentInput = inputId;
    document.getElementById("dateTimeModal").style.display = "block";
}

function closeDateTimeModal() {
    document.getElementById("dateTimeModal").style.display = "none";
    currentInput = ''; // Reset currentInput
}

// Apply selected date and time to the appropriate field
function applyDateTimeSelection(inputId) {
    const selectedDate = document.getElementById("modalDate").value;
    const selectedTime = document.getElementById("modalTime").value;
    if (selectedDate && selectedTime) {
        const selectedDateTime = `${selectedDate} ${selectedTime}`;
        document.getElementById(inputId).value = selectedDateTime;
        closeDateTimeModal();
    }
}

// Generate report button click event
document.getElementById("generateReport").addEventListener("click", function() {
    generateReport();
});

// Initialize the Google API client library
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

// Initialize the token client
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleAuthCallback,
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('loginButton').onclick = handleAuthClick;
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        accessToken = resp.access_token;
        document.getElementById('monitoringForm').style.display = 'block';
        document.getElementById('loginButton').style.display = 'none';
    };

    if (accessToken === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleAuthCallback(response) {
    if (response.error) {
        console.error('Error during authentication:', response.error);
        return;
    }
    accessToken = response.access_token;
    document.getElementById('monitoringForm').style.display = 'block';
    document.getElementById('loginButton').style.display = 'none';
}

function generateReport() {
    const lobby = document.getElementById("lobby").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    if (!accessToken) {
        alert("Please login first.");
        return;
    }

    const sheetId = '1Eob3yiujIi0sNtsPQr_HCvQtlybXnq6K11bm1wAcqAo'; // Updated Spreadsheet ID
    const sheetName = 'input';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;

    fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        const rows = data.values;
        displayReport(rows, lobby, fromDate, toDate);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function displayReport(rows, lobby, fromDate, toDate) {
    const reportContainer = document.getElementById("reportContainer");
    reportContainer.innerHTML = '';

    const from = new Date(fromDate); // Extract only the date
    const to = new Date(toDate); // Extract only the date

    const filteredRows = rows.reduce((result, row, index) => {
        const lpId = row[0]; // LP ID
        const signOnDate = new Date(row[6]); // Assuming "Sign-On Date" is in Column G

        if (lpId.startsWith(lobby) &&
            signOnDate >= from &&
            signOnDate <= to &&
            !row[14]) { // Assuming Sign-Off is in Column O (Index 14)
            result.push({ data: row, rowIndex: index + 1 }); // Include row index for update
        }
        return result;
    }, []);

    // Code for displaying the report (same as before)
    if (filteredRows.length > 0) {
        const table = document.createElement("table");
        const headerRow = table.insertRow();
        const headers = ["LP ID", "LP Name", "LP Mobile", "ALP Name", "Sign On Time", "Train No.", "Loco No.", "Last Passed Stn", "Sign Off"];
        headers.forEach(headerText => {
            const headerCell = document.createElement("th");
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });

        filteredRows.forEach((rowObj) => {
            const tableRow = table.insertRow();
            const row = rowObj.data;

            const cells = [
                row[0], // LP ID
                row[1], // LP Name
                row[2], // LP Mobile
                row[4], // ALP Name
                row[7],
                row[9], // Train No.
                row[10], // Loco No.
                row[11], 
            ];

            cells.forEach(cellText => {
                const cell = tableRow.insertCell();
                cell.textContent = cellText;
            });

            const signOffCell = tableRow.insertCell();
            const signOffButton = document.createElement("button");
            signOffButton.textContent = "Sign Off";
            signOffButton.addEventListener("click", () => signOff(rowObj.rowIndex, row));
            signOffCell.appendChild(signOffButton);
        });

        reportContainer.appendChild(table);
    } else {
        reportContainer.textContent = "No matching records found.";
    }
}




function parseDateTime(dateTimeStr) {
    let parsedDate;

    // Try parsing in DD/MM/YYYY format first
    const dateParts = dateTimeStr.split(' ')[0].split('/');
    const timePart = dateTimeStr.split(' ')[1];

    if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        parsedDate = new Date(`${year}-${month}-${day}T${timePart}`);
    } else {
        // Fallback to standard Date object parsing
        parsedDate = new Date(dateTimeStr);
    }

    console.log(`Parsed Date: ${parsedDate}, Original String: ${dateTimeStr}`);
    return parsedDate;
}



// Function to open the Sign Off modal
function openSignOffModal() {
    const signOffModal = document.getElementById("signOffModal");

    // Get the current date and time
    const now = new Date();
    
    // Format the current date as YYYY-MM-DD
    const currentDate = now.toISOString().split('T')[0];
    
    // Format the current time in 24-hour format as HH:MM (for input type="time")
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    
    // Set the current date and time in the modal inputs
    document.getElementById("signOffDate").value = currentDate;
    document.getElementById("signOffTime").value = currentTime;
    document.getElementById("signOffStation").value = ""; // Clear station field

    // Display the modal
    signOffModal.style.display = "block";
}

// Restrict sign off station field to max 4 words and auto-uppercase
const signOffStationInput = document.getElementById("signOffStation");

signOffStationInput.addEventListener("input", function () {
    // Convert input to uppercase
    let value = this.value.toUpperCase();

    // Split the input into words
    let words = value.split(/\s+/);

    // Limit to 4 words
    if (words.length > 4) {
        words = words.slice(0, 4);
    }

    // Join the words back into a string
    this.value = words.join(" ");
});

// Function to apply sign-off and station data
function signOff(rowIndex, row) {
    document.getElementById("signOffModal").style.display = "block";

    currentInputRow = rowIndex;

    document.getElementById("signOffApply").onclick = function () {
        const selectedDate = document.getElementById("signOffDate").value;
        const selectedTime = document.getElementById("signOffTime").value;
        const selectedStation = document.getElementById("signOffStation").value;

        if (selectedDate && selectedTime && selectedStation) {
            const formattedDateTime = formatDateTime(selectedDate, selectedTime);
            updateSignOffDateTime(currentInputRow, formattedDateTime, selectedStation);
            closeSignOffModal();
        } else {
            alert('Please complete all fields.');
        }
    };
}

// Function to close the Sign Off modal
function closeSignOffModal() {
    document.getElementById("signOffModal").style.display = "none";
}

// Event listener for the close button in the sign-off modal
document.querySelector(".closeSignOff").addEventListener("click", function() {
    closeSignOffModal();
});

// Event listener to close the modal when clicking outside the modal content
window.addEventListener("click", function(event) {
    const modal = document.getElementById("signOffModal");
    if (event.target === modal) {
        closeSignOffModal();
    }
});




// Function to format date and time to 'dd/mm/yyyy hh:mm:ss'
function formatDateTime(date, time) {
    const dateParts = date.split('-'); // yyyy-mm-dd format from input
    const day = dateParts[2];   // Get the day
    const month = dateParts[1]; // Get the month
    const year = dateParts[0];  // Get the year

    // Add seconds to the time (assuming "00" for seconds)
    const formattedTime = `${time}:00`; // hh:mm:ss

    // Return the formatted date and time as 'dd/mm/yyyy hh:mm:ss'
    return `${day}/${month}/${year} ${formattedTime}`;
}

// Function to update sign-off date/time and station in Google Sheets
function updateSignOffDateTime(rowIndex, signOffDateTime, signOffStation) {
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: '1Eob3yiujIi0sNtsPQr_HCvQtlybXnq6K11bm1wAcqAo',
        range: `input!O${rowIndex}:P${rowIndex}`, // Update columns O and P
        valueInputOption: 'RAW',
        values: [[signOffDateTime, signOffStation]], // Date in column O, Station in column P
    }).then(response => {
        alert('Sign off and station update successful');
        generateReport(); // Refresh the report to reflect changes
    }).catch(error => {
        console.error('Error updating data:', error);
    });
}

// Function to close the sign-off modal
function closeSignOffModal() {
    document.getElementById("signOffModal").style.display = "none";
}

gapiLoaded();
gisLoaded();
