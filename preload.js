const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('fileAPI', {
    readFile: (filePath) => {
        return fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
    },
    writeFile: (filePath, content) => {
        fs.writeFileSync(path.join(__dirname, filePath), content, 'utf-8');
    },
    readXMLFile: (filePath) => {
        const xmlData = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
        return new window.DOMParser().parseFromString(xmlData, "application/xml");
    }
});
