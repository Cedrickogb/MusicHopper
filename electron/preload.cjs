const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload chargé !");

// On expose toutes vos fonctions sur un seul objet 'electron'
contextBridge.exposeInMainWorld("electron", {
  // Fonctions de fichiers et dossiers
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  validateFolder: () => ipcRenderer.invoke("validate-folder"),

  // Contrôles de fenêtre
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),

  // Playlists
  savePlaylists: (data) => ipcRenderer.invoke('save-playlists', data),
  loadPlaylists: () => ipcRenderer.invoke('load-playlists'),

  // Cache métadonnées (chargement progressif)
  getCachedMetadata: (srcList) => ipcRenderer.invoke('get-cached-metadata', srcList),
  saveCachedMetadata: (batchData) => ipcRenderer.invoke('save-cached-metadata', batchData),
});