const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
const path = require('path');
const fs = require("fs");

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      preload: path.resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,  // Désactive le sandboxing pour charger des fichiers locaux
      webSecurity: false // Désactive la sécurité qui bloque file://
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

// app.whenReady().then(createWindow);
app.whenReady().then(() => {
  protocol.registerFileProtocol("local", (request, callback) => {
    const url = request.url.replace("local://", ""); 
    const filePath = path.normalize(decodeURIComponent(url));
    callback({ path: filePath });
  });

  // Gérer l'ouverture de la boîte de dialogue de sélection de fichiers
  // ipcMain.handle('open-file-dialog', async () => {
  //   const result = await dialog.showOpenDialog({
  //     properties: ['openFile', 'multiSelections'],
  //     filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }],
  //   });
  //   return result.filePaths;
  // });

  ipcMain.handle("open-folder-dialog", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    if (result.canceled) return null;

    const folderPath = result.filePaths[0];

    // Lister les fichiers audio dans le dossier sélectionné
    const files = fs.readdirSync(folderPath)
      .filter(file => file.match(/\.(mp3|wav|ogg|flac)$/i))
      .map(file => ({
        title: path.basename(file, path.extname(file)), // Nom du fichier sans extension
        src: `file://${path.join(folderPath, file)}` // Chemin absolu
      }));

    return files;
  });

  // Lire un fichier audio
  ipcMain.handle('read-file', async (event, filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  });

  createWindow();
});

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