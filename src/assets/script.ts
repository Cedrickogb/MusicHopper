// import { defineStore } from 'pinia';
// import { parseBlob } from "music-metadata-browser";

// var tracks = [];
// let electron = window.electron;

// interface Track {
//   artist: string;
//   album: string;
//   cover: string;
//   title: string;
//   src: string;
//   year: number;
//   track: string;
// }

// export const useMusicStore = defineStore("music", {
//   state: () => ({
//     tracks: [
//       { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
//     ] as Track[], // Tableau typé de musiques
//     activeTracks: [
//       { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
//     ] as Track[], // Tableau typé de musiques
//     activeTrackId: 0 as number,
//     trigger: false as boolean,
//     activeTrack: { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" } as object,
//     isPlaying: false as boolean,
//   }),

//   actions: {
//     async setTracks(newTracks: Track[]) {
//       this.tracks = newTracks;
//     },
//     setActiveTrackId(id: number) {
//       this.activeTrackId = id;
//       this.trigger = !this.trigger;
//     },
//     setActiveTracks(newTracks: Track[]) {
//       this.activeTracks = newTracks;
//     },
//     setActiveTrack(trackData: {track: object, state: boolean}) {
//       this.activeTrack = trackData.track;
//       this.isPlaying = trackData.state;
//     },
//   }
// });

// export async function loadMetadata(track: Track) {
//   try {
//     let currentTrack = {
//       title: "Chargement...",
//       artist: "Inconnu",
//       album: "Inconnu",
//       cover: "",
//       track: {},
//       year: 0,
//       src: track.src
//     };

//     const filePath = track.src.replace("file://", "");
//     let fileBuffer
//     if(typeof window !== "undefined" && window.electron){
//       fileBuffer = await window.electron.readFile(filePath);
//     }
//     if (!fileBuffer) throw new Error("Impossible de lire le fichier");

//     const metadata = await parseBlob(new Blob([fileBuffer]));

//     currentTrack.title = metadata.common.title || track.title || "Titre inconnu";
//     currentTrack.artist = metadata.common.artist || track.artist || "Artiste inconnu";
//     currentTrack.album = metadata.common.album || track.album || "Album inconnu";
//     currentTrack.track = metadata.common.track || track.track || {};
//     currentTrack.year = metadata.common.year || track.year || 0;

//     if (typeof metadata.common.picture === "object" && metadata.common.picture?.length > 0) {
//       const picture = metadata.common.picture[0];
//       const blobUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
//       currentTrack.cover = blobUrl;
//     } else {
//       currentTrack.cover = track.cover || "./public/Images/black.jpg";
//     }

//     return currentTrack;
//   } catch (error) {
//     console.error("Erreur lors du chargement des métadonnées :", error);
//   }
// };

import { defineStore } from 'pinia';
import { parseBlob } from "music-metadata-browser";

var tracks = [];
let electron = window.electron;

interface Track {
  artist: string;
  album: string;
  cover: string;
  title: string;
  src: string;
  year: number;
  track: string;
  id?: string; // Ajout d'un ID unique pour chaque track
}

interface PlaybackState {
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
}

export const useMusicStore = defineStore("music", {
  state: () => ({
    // Collection complète des musiques
    tracks: [
      { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
    ] as Track[],
    
    // Playlist active (peut être différente de tracks selon le contexte)
    activeTracks: [
      { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
    ] as Track[],
    
    // Index de la musique actuellement jouée dans activeTracks
    activeTrackId: 0 as number,
    
    // Musique actuellement jouée (objet complet)
    activeTrack: { 
      title: "Chargement...", 
      artist: "Inconnu", 
      album: "Inconnu", 
      cover: "./public/Images/black.jpg", 
      src: "",
      year: 0,
      track: "",
      id: undefined
    } as Track,
    
    // État de lecture détaillé
    playbackState: {
      currentTime: 0,
      duration: 0,
      progress: 0,
      volume: 0.2,
      isPlaying: false,
      isPaused: false,
      isLoading: false
    } as PlaybackState,
    
    // Options de lecture
    playbackOptions: {
      shuffle: false,
      loop: false,
      repeat: 'none' // 'none', 'one', 'all'
    },
    
    // Trigger pour notifier les changements
    trigger: false as boolean,
    
    // Historique de lecture
    playHistory: [] as Track[],
    
    // Queue de lecture suivante
    playQueue: [] as Track[],
  }),

  getters: {
    // Obtenir la musique actuellement jouée avec toutes ses infos
    getCurrentTrack: (state) => {
      return {
        ...state.activeTrack,
        ...state.playbackState,
        playbackOptions: state.playbackOptions
      };
    },
    
    // Vérifier si une musique spécifique est en cours de lecture
    isTrackPlaying: (state) => (track: Track) => {
      return state.activeTrack.id === track.id && state.playbackState.isPlaying;
    },
    
    // Vérifier si une musique spécifique est la musique active (même si en pause)
    isActiveTrack: (state) => (track: Track) => {
      return state.activeTrack.id === track.id;
    },
    
    // Obtenir le pourcentage de progression
    getProgressPercentage: (state) => {
      if (state.playbackState.duration === 0) return 0;
      return (state.playbackState.currentTime / state.playbackState.duration) * 100;
    },
    
    // Obtenir l'état de lecture formaté
    getFormattedState: (state) => {
      return {
        currentTime: formatTime(state.playbackState.currentTime),
        totalTime: formatTime(state.playbackState.duration),
        progress: state.playbackState.progress,
        isPlaying: state.playbackState.isPlaying
      };
    }
  },

  actions: {
    // Définir toutes les musiques
    async setTracks(newTracks: Track[]) {
      // Ajouter des IDs uniques si elles n'en ont pas
      this.tracks = newTracks.map((track, index) => ({
        ...track,
        id: track.id || `track_${index}_${Date.now()}`
      }));
    },

    // Définir la playlist active
    setActiveTracks(newTracks: Track[]) {
      this.activeTracks = newTracks.map((track, index) => ({
        ...track,
        id: track.id || `track_${index}_${Date.now()}`
      }));
    },

    // Changer la musique active
    setActiveTrackId(id: number) {
      if (id >= 0 && id < this.activeTracks.length) {
        this.activeTrackId = id;
        this.activeTrack = { ...this.activeTracks[id] };
        this.trigger = !this.trigger;
        
        // Ajouter à l'historique si c'est une nouvelle musique
        if (this.playHistory.length === 0 || 
            this.playHistory[this.playHistory.length - 1].id !== this.activeTrack.id) {
          this.addToHistory(this.activeTrack);
        }
      }
    },

    // Jouer une musique spécifique
    playTrack(tracks: Track[], trackIndex: number) {
      this.setActiveTracks(tracks);
      this.setActiveTrackId(trackIndex);
      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
    },

    // Mettre à jour l'état de lecture
    updatePlaybackState(newState: Partial<PlaybackState>) {
      this.playbackState = { ...this.playbackState, ...newState };
    },

    // Jouer/Pause
    togglePlay() {
      this.playbackState.isPlaying = !this.playbackState.isPlaying;
      this.playbackState.isPaused = !this.playbackState.isPlaying;
    },

    // Play
    play() {
      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
    },

    // Pause
    pause() {
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = true;
    },

    // Stop
    stop() {
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = false;
      this.playbackState.currentTime = 0;
      this.playbackState.progress = 0;
    },

    // Musique suivante
    nextTrack() {
      let nextIndex;
      
      if (this.playbackOptions.shuffle) {
        nextIndex = Math.floor(Math.random() * this.activeTracks.length);
      } else {
        nextIndex = (this.activeTrackId + 1) % this.activeTracks.length;
      }
      
      this.setActiveTrackId(nextIndex);
    },

    // Musique précédente
    prevTrack() {
      const prevIndex = (this.activeTrackId - 1 + this.activeTracks.length) % this.activeTracks.length;
      this.setActiveTrackId(prevIndex);
    },

    // Mettre à jour les options de lecture
    updatePlaybackOptions(options: Partial<typeof this.playbackOptions>) {
      this.playbackOptions = { ...this.playbackOptions, ...options };
    },

    // Toggle Shuffle
    toggleShuffle() {
      this.playbackOptions.shuffle = !this.playbackOptions.shuffle;
    },

    // Toggle Loop
    toggleLoop() {
      this.playbackOptions.loop = !this.playbackOptions.loop;
    },

    // Ajouter à l'historique
    addToHistory(track: Track) {
      this.playHistory.push(track);
      // Garder seulement les 50 dernières musiques
      if (this.playHistory.length > 50) {
        this.playHistory.shift();
      }
    },

    // Ajouter à la queue
    addToQueue(track: Track) {
      this.playQueue.push(track);
    },

    // Supprimer de la queue
    removeFromQueue(trackId: string) {
      this.playQueue = this.playQueue.filter(track => track.id !== trackId);
    },

    // Vider la queue
    clearQueue() {
      this.playQueue = [];
    },

    // Mettre à jour la progression en temps réel
    updateProgress(currentTime: number, duration: number) {
      this.playbackState.currentTime = currentTime;
      this.playbackState.duration = duration;
      this.playbackState.progress = currentTime;
    },

    // Rechercher une musique dans la collection
    findTrack(trackId: string): Track | undefined {
      return this.tracks.find(track => track.id === trackId);
    },

    // Obtenir l'état complet pour les composants
    getFullState() {
      return {
        activeTrack: this.activeTrack,
        playbackState: this.playbackState,
        playbackOptions: this.playbackOptions,
        activeTracks: this.activeTracks,
        activeTrackId: this.activeTrackId
      };
    }
  }
});

// Fonction utilitaire pour formater le temps
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Fonction pour charger les métadonnées (inchangée)
export async function loadMetadata(track: Track) {
  try {
    let currentTrack = {
      title: "Chargement...",
      artist: "Inconnu",
      album: "Inconnu",
      cover: "",
      track: {},
      year: 0,
      src: track.src,
      id: track.id || `track_${Date.now()}`
    };

    const filePath = track.src.replace("file://", "");
    let fileBuffer
    if(typeof window !== "undefined" && window.electron){
      fileBuffer = await window.electron.readFile(filePath);
    }
    if (!fileBuffer) throw new Error("Impossible de lire le fichier");

    const metadata = await parseBlob(new Blob([fileBuffer]));

    currentTrack.title = metadata.common.title || track.title || "Titre inconnu";
    currentTrack.artist = metadata.common.artist || track.artist || "Artiste inconnu";
    currentTrack.album = metadata.common.album || track.album || "Album inconnu";
    currentTrack.track = metadata.common.track || track.track || {};
    currentTrack.year = metadata.common.year || track.year || 0;

    if (typeof metadata.common.picture === "object" && metadata.common.picture?.length > 0) {
      const picture = metadata.common.picture[0];
      const blobUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
      currentTrack.cover = blobUrl;
    } else {
      currentTrack.cover = track.cover || "./public/Images/black.jpg";
    }

    return currentTrack;
  } catch (error) {
    console.error("Erreur lors du chargement des métadonnées :", error);
  }
}