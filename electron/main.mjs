import { app, BrowserWindow, dialog, ipcMain, protocol, nativeTheme } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;

// Détection correcte du mode développement
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// ✅ DÉSACTIVATION DU SANDBOX AU DÉMARRAGE
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-setuid-sandbox');
app.commandLine.appendSwitch('--disable-gpu-sandbox');

function createWindow() {
  console.log('\n=== DEBUG DÉMARRAGE ===');
  console.log('Mode développement:', isDev);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('Plateforme:', process.platform);
  console.log('__dirname:', __dirname);
  console.log('========================\n');
  
  let iconPath;
  
  if (isDev) {
    iconPath = path.join(__dirname, '..', 'assets', 'musicHopper.png');
  } else {
    iconPath = path.join(process.resourcesPath, 'assets', 'musicHopper.png');
  }

  mainWindow = new BrowserWindow({
    frame: false,
    width: 1100,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    icon: iconPath,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      // ✅ DÉSACTIVATION DU SANDBOX POUR ÉVITER LES CRASHES
      sandbox: false,
      webSecurity: false,
      enableRemoteModule: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    ...(process.platform === 'linux' && {
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
    })
  });

  // Configuration du thème pour Linux
  if (process.platform === 'linux') {
    nativeTheme.themeSource = 'system';
  }

  // Afficher la fenêtre une fois que le contenu est chargé
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Fenêtre prête à être affichée');
    mainWindow.show();
    if (process.platform === 'linux') {
      mainWindow.focus();
    }
  });

  // Logique de chargement
  if (isDev) {
    console.log("🔄 Mode développement - Chargement de http://localhost:5173");
    mainWindow.loadURL('http://localhost:5173')
      .catch(err => {
        console.error("❌ Erreur chargement dev server:", err);
        const fallbackPath = path.join(__dirname, '..', 'dist', 'index.html');
        if (fs.existsSync(fallbackPath)) {
          console.log("🔄 Fallback vers le build statique");
          mainWindow.loadFile(fallbackPath);
        }
      });
  } else {
    console.log("📦 Mode production - Chargement du build statique");
    
    const indexPaths = [
      path.join(__dirname, '..', 'dist', 'index.html'),
      path.join(__dirname, 'dist', 'index.html'),
      path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
      path.join(app.getAppPath(), 'dist', 'index.html'),
    ];
    
    console.log("Recherche d'index.html dans:", indexPaths);
    
    let indexPath = indexPaths.find(p => {
      const exists = fs.existsSync(p);
      console.log(`${exists ? '✅' : '❌'} ${p}`);
      return exists;
    });
    
    if (!indexPath) {
      console.error("❌ Aucun fichier index.html trouvé!");
      indexPath = indexPaths[0];
    }
    
    console.log("🔄 Chargement de:", indexPath);
    
    mainWindow.loadFile(indexPath)
      .then(() => {
        console.log("✅ Fichier chargé avec succès");
      })
      .catch(err => {
        console.error("❌ Erreur lors du chargement:", err);
      });
  }

  // DevTools uniquement en développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Gestionnaires d'événements
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Échec du chargement:', {
      errorCode,
      errorDescription,
      validatedURL,
      platform: process.platform,
      isDev
    });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Chargement terminé avec succès');
  });
}

app.whenReady().then(() => {
  console.log('🚀 Application Electron prête');
  
  // Configuration spécifique Linux SANS sandbox
  if (process.platform === 'linux') {
    console.log('🐧 Configuration Linux détectée');
    
    // Flags supplémentaires pour la stabilité sous Linux
    app.commandLine.appendSwitch('--disable-software-rasterizer');
    app.commandLine.appendSwitch('--disable-gpu');
    app.commandLine.appendSwitch('--disable-dev-shm-usage');
    app.commandLine.appendSwitch('--no-sandbox');
    app.commandLine.appendSwitch('--disable-gpu-sandbox');
    app.commandLine.appendSwitch('--disable-software-rasterizer');
    
    // Support Wayland si disponible
    if (process.env.XDG_SESSION_TYPE === 'wayland') {
      console.log('🔧 Configuration Wayland détectée');
      app.commandLine.appendSwitch('--enable-features=UseOzonePlatform');
      app.commandLine.appendSwitch('--ozone-platform=wayland');
    }
  }

  // Enregistrement du protocole
  protocol.registerFileProtocol("local", (request, callback) => {
    const url = request.url.replace("local://", ""); 
    const filePath = path.normalize(decodeURIComponent(url));
    callback({ path: filePath });
  });

  // Handlers IPC
  ipcMain.handle("open-folder-dialog", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
        title: "Sélectionner le dossier de musique",
        defaultPath: process.platform === 'linux' ? 
          (process.env.HOME ? path.join(process.env.HOME, 'Music') : '/home') : 
          undefined
      });

      if (result.canceled) return null;

      const folderPath = result.filePaths[0];
      const audioExtensions = /\.(mp3|wav|ogg|flac|m4a|aac|opus|wv|ape|mpc)$/i;
      const files = fs.readdirSync(folderPath)
        .filter(file => audioExtensions.test(file))
        .map(file => ({
          title: path.basename(file, path.extname(file)),
          src: `file://${path.join(folderPath, file)}`
        }));

      store.set("musicFolder", folderPath);
      console.log(`${files.length} fichiers audio trouvés dans: ${folderPath}`);
      return files;
    } catch (error) {
      console.error("Erreur lors de l'ouverture du dossier:", error);
      return null;
    }
  });

  ipcMain.handle("validate-folder", async () => {
    try {
      const folder = store.get("musicFolder");
      if (!folder || !fs.existsSync(folder)) {
        return { valid: false, reason: "missing" };
      }
    
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus', '.wv', '.ape', '.mpc'];
      const files = fs.readdirSync(folder);
      const musicFiles = files.filter(file => 
        audioExtensions.includes(path.extname(file).toLowerCase())
      );
    
      if (musicFiles.length === 0) {
        return { valid: false, reason: "no-music" };
      }
    
      const musics = musicFiles.map(file => ({
        title: path.basename(file, path.extname(file)),
        src: `file://${path.join(folder, file)}`
      }));
    
      console.log(`Dossier validé: ${musicFiles.length} fichiers trouvés`);
      return { valid: true, path: folder, musics };
    } catch (error) {
      console.error("Erreur lors de la validation du dossier:", error);
      return { valid: false, reason: "error" };
    }
  });
  
  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      console.log('Lecture du fichier:', filePath);
      return await fs.promises.readFile(filePath);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier:", error);
      throw error;
    }
  });

  // Contrôles de fenêtre
  ipcMain.handle('minimize-window', () => mainWindow?.minimize());
  ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    }
  });
  ipcMain.handle('close-window', () => mainWindow?.close());
  ipcMain.handle('is-maximized', () => mainWindow?.isMaximized() || false);
  ipcMain.handle('toggle-fullscreen', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  console.log('🔚 Toutes les fenêtres fermées - Arrêt de l\'application');
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('🛑 Application en cours d\'arrêt...');
});

// Gestionnaire d'erreurs global
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON GÉRÉE:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ REJET NON GÉRÉ:', reason);
  console.error('Promise:', promise);
});

// Désactiver les avertissements en développement
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}