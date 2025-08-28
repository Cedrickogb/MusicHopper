const { contextBridge, ipcRenderer, shell } = require("electron");

console.log("Preload chargé pour MusicHopper !"); 
console.log("Plateforme:", process.platform);

// Vérification de la sécurité
const validChannels = [
  'open-folder-dialog',
  'read-file',
  'validate-folder',
  'minimize-window',
  'maximize-window',
  'close-window',
  'is-maximized',
  'toggle-fullscreen'
];

// API principale Electron
contextBridge.exposeInMainWorld("electron", {
  // Gestion des fichiers et dossiers
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  validateFolder: () => ipcRenderer.invoke("validate-folder"),

  // Contrôles de fenêtre
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),

  // Informations système
  platform: process.platform,
  versions: process.versions,
  
  // Utilitaires pour Linux
  openExternal: (url) => shell.openExternal(url),
  showItemInFolder: (path) => shell.showItemInFolder(path),
});

// API alternative pour compatibilité
contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen')
});

// API spécifique système
contextBridge.exposeInMainWorld("system", {
  platform: process.platform,
  arch: process.arch,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    v8: process.versions.v8
  },
  
  // Détection de l'environnement de bureau Linux
  desktopEnvironment: process.env.XDG_CURRENT_DESKTOP || 
                     process.env.DESKTOP_SESSION || 
                     'unknown',
  sessionType: process.env.XDG_SESSION_TYPE || 'unknown',
  
  // Variables d'environnement utiles pour Linux
  homeDir: process.env.HOME,
  user: process.env.USER,
});

// Gestionnaires d'événements pour les raccourcis clavier Linux
contextBridge.exposeInMainWorld("shortcuts", {
  onKeyDown: (callback) => {
    document.addEventListener('keydown', (event) => {
      // Raccourcis spécifiques Linux
      const shortcuts = {
        'F11': 'fullscreen',
        'Ctrl+Q': 'quit',
        'Ctrl+M': 'minimize',
        'Ctrl+W': 'close',
        'Alt+F4': 'close', // Standard Windows/Linux
      };
      
      const key = event.key;
      const ctrl = event.ctrlKey;
      const alt = event.altKey;
      
      let shortcutKey = key;
      if (ctrl) shortcutKey = 'Ctrl+' + key;
      if (alt) shortcutKey = 'Alt+' + key;
      
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        callback(shortcuts[shortcutKey], event);
      }
    });
  }
});

// Utilitaires pour le debugging en développement
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld("debug", {
    log: (...args) => console.log('[Renderer]', ...args),
    error: (...args) => console.error('[Renderer]', ...args),
    info: (...args) => console.info('[Renderer]', ...args),
    
    // Informations système pour debug
    systemInfo: {
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
      env: {
        XDG_CURRENT_DESKTOP: process.env.XDG_CURRENT_DESKTOP,
        XDG_SESSION_TYPE: process.env.XDG_SESSION_TYPE,
        DESKTOP_SESSION: process.env.DESKTOP_SESSION,
        HOME: process.env.HOME,
        USER: process.env.USER
      }
    }
  });
}

// Nettoyage lors du déchargement
window.addEventListener('beforeunload', () => {
  console.log('Preload: Nettoyage avant déchargement');
});

console.log("Preload configuré avec succès pour", process.platform);