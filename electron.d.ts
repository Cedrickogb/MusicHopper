// Dans src/electron.d.ts

// On exporte l'interface pour en faire un module
export interface IElectronAPI {
  // Celles que TypeScript connaît déjà
  openFolderDialog: () => Promise<{ title: string; src: string }[] | null>;
  readFile: (filePath: string) => Promise<ArrayBuffer>;
  validateFolder: () => Promise<any>; // 'any' est OK ici
  
  // Celles qui manquaient (contrôles de fenêtre)
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;

  // Celles qui provoquaient l'erreur
  savePlaylists: (data: any) => Promise<any>;
  loadPlaylists: () => Promise<any>;
}

// On attache cette interface à l'objet global 'Window'
declare global {
  interface Window {
    electron: IElectronAPI;
  }
}