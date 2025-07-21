const { contextBridge, ipcRenderer } = require("electron");
// import { contextBridge, ipcRenderer } from "electron";

console.log("Preload chargé !"); // 🔍 Vérification

contextBridge.exposeInMainWorld("electron", {
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  validateFolder: () => ipcRenderer.invoke("validate-folder"),
});