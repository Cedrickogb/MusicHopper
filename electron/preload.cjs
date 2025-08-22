const { contextBridge, ipcRenderer } = require("electron");
// import { contextBridge, ipcRenderer } from "electron";

console.log("Preload chargé !"); // 🔍 Vérification

contextBridge.exposeInMainWorld("electron", {
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  validateFolder: () => ipcRenderer.invoke("validate-folder"),

  // Contrôles de fenêtre// Contrôles de fenêtre
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
});