// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electronAPI', {
//   openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
//   readFile: (path) => ipcRenderer.invoke('read-file', path),
// });

const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload chargé !"); // 🔍 Vérification

contextBridge.exposeInMainWorld("electron", {
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog")
});