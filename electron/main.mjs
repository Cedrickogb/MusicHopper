import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;

// Chemins des fichiers de persistance
const playlistsPath = path.join(app.getPath('userData'), 'playlists.json');
const metadataCachePath = path.join(app.getPath('userData'), 'metadata-cache.json');

// ─── Cache Métadonnées (en mémoire) ───────────────────────────────────────────
let metadataCache = {};

function loadMetadataCacheFromDisk() {
  try {
    if (fs.existsSync(metadataCachePath)) {
      const raw = fs.readFileSync(metadataCachePath, 'utf8');
      metadataCache = JSON.parse(raw);
      console.log(`✅ Cache métadonnées chargé : ${Object.keys(metadataCache).length} entrées`);
    }
  } catch (err) {
    console.warn("Impossible de charger le cache métadonnées :", err.message);
    metadataCache = {};
  }
}

function saveMetadataCacheToDisk() {
  try {
    fs.writeFileSync(metadataCachePath, JSON.stringify(metadataCache));
  } catch (err) {
    console.warn("Impossible de sauvegarder le cache métadonnées :", err.message);
  }
}

// ─── Débug Icônes ──────────────────────────────────────────────────────────────
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

// ─── Création de la fenêtre ────────────────────────────────────────────────────
function createWindow() {
  debugIconPaths();
  const isDev = !app.isPackaged;
  let iconPath;

  console.log('Tentative de chargement de l\'icône:', iconPath);
  console.log('Fichier existe:', fs.existsSync(iconPath));

  const alternativeIconPaths = [
    path.join(__dirname, '..', 'assets', 'musicHopper.png'),
    path.join(__dirname, 'assets', 'icon.png'),
    path.join(__dirname, 'build', 'musicHopper.ico'),
    path.join(app.getAppPath(), 'assets', 'musicHopper.png')
  ];

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
    icon: iconPath,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  console.log("isDev:", isDev);
  console.log("__dirname:", __dirname);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log("Tentative de chargement du fichier:", indexPath);

    mainWindow.loadFile(indexPath).catch(err => {
      console.error("Erreur lors du chargement de l'index.html:", err);

      const fallbackPaths = [
        path.join(__dirname, 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
        path.join(app.getAppPath(), 'dist', 'index.html'),
      ];

      let loaded = false;
      for (const fallbackPath of fallbackPaths) {
        console.log("Tentative avec:", fallbackPath);
        if (fs.existsSync(fallbackPath)) {
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
  // Charger le cache métadonnées au démarrage
  loadMetadataCacheFromDisk();

  // Enregistrement du protocole personnalisé
  protocol.registerFileProtocol("local", (request, callback) => {
    const url = request.url.replace("local://", "");
    const filePath = path.normalize(decodeURIComponent(url));
    callback({ path: filePath });
  });

  // ─── Persistance Playlists ───────────────────────────────────────────────────

  ipcMain.handle('save-playlists', (event, playlistsData) => {
    try {
      fs.writeFileSync(playlistsPath, JSON.stringify(playlistsData, null, 2));
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des playlists :", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-playlists', () => {
    try {
      if (!fs.existsSync(playlistsPath)) return null;
      const data = fs.readFileSync(playlistsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Erreur lors du chargement des playlists :", error);
      return null;
    }
  });

  // ─── Ouverture de dossier ────────────────────────────────────────────────────

  ipcMain.handle("open-folder-dialog", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
      });

      if (result.canceled) return null;

      const folderPath = result.filePaths[0];
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];

      // Retourner uniquement les infos légères (pas de lecture de fichier)
      const files = fs.readdirSync(folderPath)
        .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
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

  // ─── Validation du dossier ───────────────────────────────────────────────────

  ipcMain.handle("validate-folder", async () => {
    try {
      const folder = store.get("musicFolder");
      if (!folder) return { valid: false, reason: "missing" };

      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
      const files = fs.readdirSync(folder);
      const hasMusic = files.some(file => audioExtensions.includes(path.extname(file).toLowerCase()));

      if (!hasMusic) return { valid: false, reason: "no-music" };

      // Retourner uniquement les infos légères (titre + src) — PAS le contenu des fichiers
      const musics = files
        .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => ({
          title: path.basename(file, path.extname(file)),
          src: `file://${path.join(folder, file)}`
        }));

      return { valid: true, path: folder, musics };
    } catch (error) {
      if (error.code === 'ENOENT') return { valid: false, reason: "missing" };
      console.error("Erreur lors de la validation du dossier:", error);
      return { valid: false, reason: "error" };
    }
  });

  // ─── Lecture d'un seul fichier (métadonnées à la demande) ───────────────────

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      return fs.readFileSync(filePath);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier:", error);
      throw error;
    }
  });

  // ─── Cache Métadonnées : lecture ─────────────────────────────────────────────

  /**
   * Retourne les métadonnées cachées pour une liste de src.
   * Le renderer envoie la liste des src, on retourne un objet { src: metadata }.
   */
  ipcMain.handle('get-cached-metadata', (event, srcList) => {
    const result = {};
    for (const src of srcList) {
      if (metadataCache[src]) {
        result[src] = metadataCache[src];
      }
    }
    console.log(`📦 Cache hit : ${Object.keys(result).length}/${srcList.length} fichiers`);
    return result;
  });

  // ─── Cache Métadonnées : écriture ────────────────────────────────────────────

  /**
   * Sauvegarde les métadonnées d'un lot de fichiers dans le cache.
   * Le renderer envoie un objet { src: metadata }.
   */
  ipcMain.handle('save-cached-metadata', (event, batchData) => {
    try {
      Object.assign(metadataCache, batchData);
      saveMetadataCacheToDisk();
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du cache métadonnées :", error);
      return { success: false, error: error.message };
    }
  });

  // ─── Contrôles de fenêtre ────────────────────────────────────────────────────

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