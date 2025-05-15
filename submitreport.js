const API_KEY = 'AIzaSyBf3C_Ly8bIF_f-t30wE2e7cMsc2hz0co0';
const SPREADSHEET_ID = '1Eob3yiujIi0sNtsPQr_HCvQtlybXnq6K11bm1wAcqAo';
const SHEET_NAME = 'input';
const RANGE = 'A:N';

document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const crewId = document.getElementById('crewId').value.trim().toUpperCase();
    if (!crewId) {
        alert('Please enter a Crew ID');
        return;
    }

    // Show loading spinner
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').classList.remove('show');
    document.getElementById('successMessage').style.display = 'none';

    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        // Hide loading spinner
        document.getElementById('loading').style.display = 'none';

        if (!data.values || data.values.length === 0) {
            document.getElementById('resultsBody').innerHTML = '<tr><td colspan="9">No data found</td></tr>';
            document.getElementById('results').classList.add('show');
            return;
        }

        // Extract rows where Crew ID matches LP ID (Column A) or ALP ID (Column D)
        const rows = data.values.slice(1); // Skip header
        const matchedRows = rows
            .filter(row => row[0]?.toUpperCase() === crewId || row[3]?.toUpperCase() === crewId)
            .slice(-3); // Get last 3 matches

        const resultsBody = document.getElementById('resultsBody');
        resultsBody.innerHTML = '';

        if (matchedRows.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="9">No matching records found</td></tr>';
        } else {
            matchedRows.forEach(row => {
                const [lpId, lpName, , alpId, alpName, , , signOnTime, , trainNo, locoNo, lastStation, , timestamp] = row;
                resultsBody.innerHTML += `
                    <tr>
                        <td>${lpId || ''}</td>
                        <td>${lpName || ''}</td>
                        <td>${alpId || ''}</td>
                        <td>${alpName || ''}</td>
                        <td>${trainNo || ''}</td>
                        <td>${locoNo || ''}</td>
                        <td>${signOnTime || ''}</td>
                        <td>${lastStation || ''}</td>
                        <td>${timestamp || ''}</td>
                    </tr>
                `;
            });
            // Show success message
            document.getElementById('successMessage').style.display = 'block';
        }

        document.getElementById('results').classList.add('show');
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('resultsBody').innerHTML = '<tr><td colspan="9">Error fetching data</td></tr>';
        document.getElementById('results').classList.add('show');
    }
});