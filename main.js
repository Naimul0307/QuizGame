const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const XLSX = require('xlsx');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true, // Start in full-screen mode
    autoHideMenuBar: true, // Hide the menu bar
    webPreferences: {
      nodeIntegration: true, // Allows use of Node.js features in renderer
      contextIsolation: false, // Disable context isolation to allow IPC
    }
  });

  // Load index.html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'templates', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Add Excel file-saving functionality via ipcMain
ipcMain.on('save-excel', (event, users) => {
  const worksheet = XLSX.utils.json_to_sheet(users); // Convert JSON to Excel sheet
  const workbook = XLSX.utils.book_new(); // Create a new workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Results'); // Add sheet

  // Define the path to save the Excel file inside the project
  const filePath = path.join(__dirname, 'public', 'results', 'quiz_results.xlsx');

  // Write the Excel file to the specified location
  XLSX.writeFile(workbook, filePath);

  // Send a success message back to renderer
  event.reply('save-excel-success', 'File saved successfully!');
});

// Handle app lifecycle
app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
