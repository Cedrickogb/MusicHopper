import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;

function debugIconPaths() {
  const isDev = !app.isPackaged;
  console.log('\n=== DEBUG ICÔNES ===');
  console.log('Mode développement:', isDev);
  console.log('__dirname:', __dirname);
  console.log('app.getAppPath():', app.getAppPath());
  console.log('process.resourcesPath:', process.resourcesPath);

  const possiblePaths = [
    path.join(__dirname, 'assets', 'musicHopper.png'),
    path.join(__dirname, '..', 'assets', 'musicHopper.png'),
    path.join(process.resourcesPath, 'assets', 'musicHopper.png'),
    path.join(app.getAppPath(), 'assets', 'musicHopper.png'),
    path.join(__dirname, 'assets', 'icons', 'icon.png'),
    path.join(__dirname, 'assets', 'musicHopper.ico')
  ];

  console.log('\nTEST DES CHEMINS D\'ICÔNES:');
  possiblePaths.forEach(iconPath => {
    const exists = fs.existsSync(iconPath);
    console.log(`${exists ? '✅' : '❌'} ${iconPath}`);
  });
  console.log('===================\n');
}

function createWindow() {

  debugIconPaths()
  // Déterminer le chemin de l'icône selon l'environnement
  const isDev = !app.isPackaged;
  let iconPath;

  if (isDev) {
    // En développement
    iconPath = path.join(__dirname, 'assets', 'musicHopper.png');
  } else {
    // En production
    iconPath = path.join(process.resourcesPath, 'assets', 'musicHopper.png');
  }

  // Vérifier si le fichier existe et log pour débogage
  console.log('Tentative de chargement de l\'icône:', iconPath);
  console.log('Fichier existe:', fs.existsSync(iconPath));

  // Chemins alternatifs à tester
  const alternativeIconPaths = [
    path.join(__dirname, '..', 'assets', 'musicHopper.png'), // Un niveau au-dessus
    path.join(__dirname, 'assets', 'icon.png'),              // Nom générique
    path.join(__dirname, 'assets', 'musicHopper.ico'),       // Format Windows
    path.join(app.getAppPath(), 'assets', 'musicHopper.png') // Via app path
  ];

  // Trouver la première icône qui existe
  if (!fs.existsSync(iconPath)) {
    for (const altPath of alternativeIconPaths) {
      console.log('Test du chemin alternatif:', altPath, '- Existe:', fs.existsSync(altPath));
      if (fs.existsSync(altPath)) {
        iconPath = altPath;
        break;
      }
    }
  }

  mainWindow = new BrowserWindow({
    frame: false,
    width: 1100,
    height: 600,
    icon: iconPath, // Utiliser le chemin déterminé
    webPreferences: {
      preload: path.resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
    },
    show: false
  });

  // Afficher la fenêtre une fois que le contenu est chargé
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Le reste de votre code reste identique...
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
        path.join(__dirname, 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
        path.join(app.getAppPath(), 'dist', 'index.html'),
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

  if (isDev || process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

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