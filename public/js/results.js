const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const filePath = path.join(__dirname, '../public/results/user_results.xlsx'); // Path to your Excel file

// Function to load and display Excel data
function loadExcelData() {
    if (fs.existsSync(filePath)) {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Sort the data by score in descending order
        jsonData.sort((a, b) => b.score - a.score);

        // Get the top 10 results
        const top10Results = jsonData.slice(0, 10);

        // Populate the scoreboard with the top 10 results
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = ''; // Clear previous content
        top10Results.forEach((user, index) => {
            const userRow = document.createElement('div');
            userRow.classList.add('scoreboard-row');

            // Format date to show only the date portion
            const formattedDate = user.dateTime ? new Date(user.dateTime).toLocaleDateString() : 'N/A';

            userRow.innerHTML = `
                <div class="user-rank">${index + 1}</div>
                <div class="user-name">${user.name || 'N/A'}</div>
                <div class="user-email">${user.email || 'N/A'}</div>
                <div class="user-number">${user.number || 'N/A'}</div>
                <div class="user-score">${user.score || 0}</div>
                <div class="user-date">${formattedDate}</div>
            `;
            usersList.appendChild(userRow);
        });
    } else {
        console.error('File not found:', filePath);
    }
}

// Call the function to load data when the page loads
window.onload = loadExcelData;

// Function to redirect to the home page (user.html)
function goBack() {
    window.location.href = 'user.html'; // Replace with your home page URL
}

// Event listener to reset the redirect timer if user clicks the back button
document.querySelector('.back-button').addEventListener('click', function() {
    clearTimeout(autoRedirectTimeout); // Clear previous timer
    goBack(); // Redirect immediately
});

// Set a timeout to automatically redirect after 10 seconds
// let autoRedirectTimeout = setTimeout(() => {
//     window.location.href = 'user.html'; // Replace with your home page URL
// }, 10000); // Redirect after 10 seconds
