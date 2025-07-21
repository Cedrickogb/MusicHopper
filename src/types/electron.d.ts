// export {}

// declare global {
//   interface Window {
//     electron?: {
//       openFolderDialog: () => Promise<string[]>;
//       // ajoute ici d'autres méthodes que tu exposes depuis preload.js
//     };
//   }
// }

export {};

declare global {
  interface Window {
    electron?: {
      openFolderDialog: () => Promise<{ title: string; src: string }[] | null>;
      readFile: (filePath: string) => Promise<ArrayBuffer>;
      validateFolder: () => Promise<
        | { valid: false; reason: "missing" | "no-music" }
        | { valid: true; path: string; musics: { title: string; src: string }[] }
      >;
    };
  }
}