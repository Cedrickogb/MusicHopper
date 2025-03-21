// const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
// console.log("Music hooper script", window.electron, VITE_DEV_SERVER_URL)
import { defineStore } from 'pinia';

var tracks = [];
async function selectFolder(){
    if (!window.electron) {
      alert("Electron n'est pas disponible !");
      return;
    }
  
    const files = await window.electron.openFolderDialog();
    if (files) {
      tracks = files;
      // console.log("Tracks chargés :", tracks.value); // 🔍 Vérifie si les fichiers sont bien reçus
      console.log("update-tracks", tracks); // ✅ Émet l’événement avec les nouvelles musiques
    }
};

// selectFolder()


interface Track {
  title: string;
  src: string;
}

export const useMusicStore = defineStore("music", {
  state: () => ({
    tracks: [
      { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
    ] as Track[], // Tableau typé de musiques
    activeTracks: [
      { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
    ] as Track[], // Tableau typé de musiques
    activeTrackId: 0 as number,
    trigger: false as boolean,
  }),

  actions: {
    setTracks(newTracks: Track[]) {
      this.tracks = newTracks;
    },
    setActiveTrackId(id: number) {
      this.activeTrackId = id;
      this.trigger = !this.trigger;
    },
    setActiveTracks(newTracks: Track[]) {
      this.activeTracks = newTracks;
    }
  }
});

// useMusicStore().setTracks([
//   { title: 'Chanson 1', artist: 'Artiste 1', album: "", cover: "", src: './public/Musics/$ - 530.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Gunna - Woke Up.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Yeat - bigger thën everything.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Chow Lee - swag it!.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Luidji - Foufoune Palace.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Foushee - Deep End.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Smino - No L s.mp3' },
//   { title: 'Chanson 2', artist: 'Artiste 2', album: "", cover: "", src: './public/Musics/Cash Cobain - Dunk Contest.mp3' },
// ]);