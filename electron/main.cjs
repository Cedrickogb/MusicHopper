const { app, BrowserWindow } = require('electron');
const path = require('path');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Charge l'application Vue en développement ou en production
  mainWindow.loadURL('http://localhost:5173');
  // if (VITE_DEV_SERVER_URL) {
  //   // mainWindow.loadURL(VITE_DEV_SERVER_URL); // Charge l'URL du serveur Vite
  //   console.log('Chargement de l\'application Vue depuis :', VITE_DEV_SERVER_URL);
  // } else {
  //   mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // Charge le fichier de production
  // }

  // Ouvrir les outils de développement en mode développement
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});