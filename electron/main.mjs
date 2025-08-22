// // const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
// // const path = require('path');
// // const fs = require("fs");
// // // const store = new (require('electron-store'))();
// // const Store = require('electron-store').default;
// // const store = new Store();
// import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
// import path from "path";
// import fs from "fs";
// import Store from "electron-store";

// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const store = new Store()

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1100,
//     height: 600,
//     webPreferences: {
//       preload: path.resolve(__dirname, "preload.cjs"),
//       nodeIntegration: false,
//       contextIsolation: true,
//       sandbox: false,  // Désactive le sandboxing pour charger des fichiers locaux
//       webSecurity: false // Désactive la sécurité qui bloque file://
//     }
//   });

//   // Charge l'application Vue en développement ou en production
//   const isDev = !app.isPackaged;

//   console.log("isDev:", isDev);

//   if (isDev) {
//     mainWindow.loadURL('http://localhost:5173');
//   } else {
//     mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
//   }

//   // Ouvrir les outils de développement en mode développement
//   if (process.env.NODE_ENV === 'development') {
//     mainWindow.webContents.openDevTools();
//   }
// }

// // app.whenReady().then(createWindow);
// app.whenReady().then(() => {
//   protocol.registerFileProtocol("local", (request, callback) => {
//     const url = request.url.replace("local://", ""); 
//     const filePath = path.normalize(decodeURIComponent(url));
//     callback({ path: filePath });
//   });

//   ipcMain.handle("open-folder-dialog", async () => {
//     const result = await dialog.showOpenDialog(mainWindow, {
//       properties: ["openDirectory"],
//     });

//     if (result.canceled) return null;

//     const folderPath = result.filePaths[0];

//     // Lister les fichiers audio dans le dossier sélectionné
//     const files = fs.readdirSync(folderPath)
//       .filter(file => file.match(/\.(mp3|wav|ogg|flac)$/i))
//       .map(file => ({
//         title: path.basename(file, path.extname(file)), // Nom du fichier sans extension
//         src: `file://${path.join(folderPath, file)}` // Chemin absolu
//       }));

//     store.set("musicFolder", folderPath);

//     return files;
//   });

//   ipcMain.handle("validate-folder", async () => {
//     const folder = store.get("musicFolder");
//     if (!folder || !fs.existsSync(folder)) {
//       return { valid: false, reason: "missing" };
//     }
  
//     const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac'];
//     const files = fs.readdirSync(folder);
//     const hasMusic = files.some(file => audioExtensions.includes(path.extname(file).toLowerCase()));
  
//     if (!hasMusic) {
//       return { valid: false, reason: "no-music" };
//     }
  
//     // Si tout est OK
//     const musics = files
//       .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
//       .map(file => ({
//         title: path.basename(file, path.extname(file)),
//         src: `file://${path.join(folder, file)}`
//       }));
  
//     return { valid: true, path: folder, musics };
//   });
  

//   // Lire un fichier audio
//   ipcMain.handle('read-file', async (event, filePath) => {
//     return new Promise((resolve, reject) => {
//       fs.readFile(filePath, (err, data) => {
//         if (err) reject(err);
//         else resolve(data);
//       });
//     });
//   });

//   createWindow();
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    // Configuration pour supprimer complètement la barre de titre
    frame: false, // Supprime complètement le frame par défaut
    // OR
    titleBarStyle: 'hidden', // Hides the title bar but keeps window controls on macOS
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    titleBarStyle: 'hiddenInset', // Similar to hidden but with traffic light controls inset on macOS

    width: 1100,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
    },

   
    // Ajout pour éviter l'écran blanc
    show: false
  });

  // Afficher la fenêtre une fois que le contenu est chargé
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = !app.isPackaged;
  console.log("isDev:", isDev);
  console.log("__dirname:", __dirname);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // En production, le __dirname pointe vers electron/ dans l'asar
    // Il faut remonter d'un niveau pour accéder à dist/
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log("Tentative de chargement du fichier:", indexPath);
    console.log("__dirname:", __dirname);
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error("Erreur lors du chargement de l'index.html:", err);
      
      // Fallback: essayer différents chemins possibles
      const fallbackPaths = [
        path.join(__dirname, 'dist', 'index.html'), // Chemin original
        path.join(process.resourcesPath, 'app', 'dist', 'index.html'), // Via resources
        path.join(app.getAppPath(), 'dist', 'index.html'), // Via app path
      ];
      
      let loaded = false;
      for (const fallbackPath of fallbackPaths) {
        console.log("Tentative avec:", fallbackPath);
        if (fs.existsSync(fallbackPath)) {
          console.log("Fichier trouvé, chargement...");
          mainWindow.loadFile(fallbackPath);
          loaded = true;
          break;
        }
      }
      
      if (!loaded) {
        // Dernier recours: afficher une page d'erreur avec debug info
        mainWindow.loadURL(`data:text/html,<html><body>
          <h1>Erreur de chargement</h1>
          <p><strong>Chemin principal:</strong> ${indexPath}</p>
          <p><strong>__dirname:</strong> ${__dirname}</p>
          <p><strong>app.getAppPath():</strong> ${app.getAppPath()}</p>
          <p><strong>process.resourcesPath:</strong> ${process.resourcesPath}</p>
          <h3>Chemins testés:</h3>
          <ul>
            ${fallbackPaths.map(p => `<li>${p} - ${fs.existsSync(p) ? '✅ Existe' : '❌ N\'existe pas'}</li>`).join('')}
          </ul>
        </body></html>`);
      }
    });
  }

  // Outils de développement
  if (isDev || process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Gestion des erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Échec du chargement:', errorCode, errorDescription, validatedURL);
  });
}

app.whenReady().then(() => {
  // Enregistrement du protocole personnalisé
  protocol.registerFileProtocol("local", (request, callback) => {
    const url = request.url.replace("local://", ""); 
    const filePath = path.normalize(decodeURIComponent(url));
    callback({ path: filePath });
  });

  // Gestion de l'ouverture de dossier
  ipcMain.handle("open-folder-dialog", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
      });

      if (result.canceled) return null;

      const folderPath = result.filePaths[0];

      // Lister les fichiers audio dans le dossier sélectionné
      const files = fs.readdirSync(folderPath)
        .filter(file => file.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i))
        .map(file => ({
          title: path.basename(file, path.extname(file)),
          src: `file://${path.join(folderPath, file)}`
        }));

      store.set("musicFolder", folderPath);
      return files;
    } catch (error) {
      console.error("Erreur lors de l'ouverture du dossier:", error);
      return null;
    }
  });

  // Validation du dossier de musique
  ipcMain.handle("validate-folder", async () => {
    try {
      const folder = store.get("musicFolder");
      if (!folder || !fs.existsSync(folder)) {
        return { valid: false, reason: "missing" };
      }
    
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
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
    } catch (error) {
      console.error("Erreur lors de la validation du dossier:", error);
      return { valid: false, reason: "error" };
    }
  });
  
  // Lecture de fichier
  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier:", error);
      throw error;
    }
  });

  // Gestion des contrôles de fenêtre
  ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('close-window', () => {
    mainWindow.close();
  });

  ipcMain.handle('is-maximized', () => {
    return mainWindow.isMaximized();
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