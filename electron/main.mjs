// const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
// const path = require('path');
// const fs = require("fs");
// // const store = new (require('electron-store'))();
// const Store = require('electron-store').default;
// const store = new Store();
import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store()

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,  // Désactive le sandboxing pour charger des fichiers locaux
      webSecurity: false // Désactive la sécurité qui bloque file://
    }
  });

  // Charge l'application Vue en développement ou en production
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

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

    store.set("musicFolder", folderPath);

    return files;
  });

  ipcMain.handle("validate-folder", async () => {
    const folder = store.get("musicFolder");
    if (!folder || !fs.existsSync(folder)) {
      return { valid: false, reason: "missing" };
    }
  
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac'];
    const files = fs.readdirSync(folder);
    const hasMusic = files.some(file => audioExtensions.includes(path.extname(file).toLowerCase()));
  
    if (!hasMusic) {
      return { valid: false, reason: "no-music" };
    }
  
    // Si tout est OK
    const musics = files
      .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => ({
        title: path.basename(file, path.extname(file)),
        src: `file://${path.join(folder, file)}`
      }));
  
    return { valid: true, path: folder, musics };
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