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
//   id?: string; // Ajout d'un ID unique pour chaque track
// }

// interface PlaybackState {
//   currentTime: number;
//   duration: number;
//   progress: number;
//   volume: number;
//   isPlaying: boolean;
//   isPaused: boolean;
//   isLoading: boolean;
// }

// export const useMusicStore = defineStore("music", {
//   state: () => ({
//     // Collection complète des musiques
//     tracks: [
//       { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
//     ] as Track[],
    
//     // Playlist active (peut être différente de tracks selon le contexte)
//     activeTracks: [
//       { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
//     ] as Track[],
    
//     // Index de la musique actuellement jouée dans activeTracks
//     activeTrackId: 0 as number,
    
//     // Musique actuellement jouée (objet complet)
//     activeTrack: { 
//       title: "Chargement...", 
//       artist: "Inconnu", 
//       album: "Inconnu", 
//       cover: "./public/Images/black.jpg", 
//       src: "",
//       year: 0,
//       track: "",
//       id: undefined
//     } as Track,
    
//     // État de lecture détaillé
//     playbackState: {
//       currentTime: 0,
//       duration: 0,
//       progress: 0,
//       volume: 0.2,
//       isPlaying: false,
//       isPaused: false,
//       isLoading: false
//     } as PlaybackState,
    
//     // Options de lecture
//     playbackOptions: {
//       shuffle: false,
//       loop: false,
//       repeat: 'none' // 'none', 'one', 'all'
//     },
    
//     // Trigger pour notifier les changements
//     trigger: false as boolean,
    
//     // Historique de lecture
//     playHistory: [] as Track[],
    
//     // Queue de lecture suivante
//     playQueue: [] as Track[],
//   }),

//   getters: {
//     // Obtenir la musique actuellement jouée avec toutes ses infos
//     getCurrentTrack: (state) => {
//       return {
//         ...state.activeTrack,
//         ...state.playbackState,
//         playbackOptions: state.playbackOptions
//       };
//     },
    
//     // Vérifier si une musique spécifique est en cours de lecture
//     isTrackPlaying: (state) => (track: Track) => {
//       return state.activeTrack.id === track.id && state.playbackState.isPlaying;
//     },
    
//     // Vérifier si une musique spécifique est la musique active (même si en pause)
//     isActiveTrack: (state) => (track: Track) => {
//       return state.activeTrack.id === track.id;
//     },
    
//     // Obtenir le pourcentage de progression
//     getProgressPercentage: (state) => {
//       if (state.playbackState.duration === 0) return 0;
//       return (state.playbackState.currentTime / state.playbackState.duration) * 100;
//     },
    
//     // Obtenir l'état de lecture formaté
//     getFormattedState: (state) => {
//       return {
//         currentTime: formatTime(state.playbackState.currentTime),
//         totalTime: formatTime(state.playbackState.duration),
//         progress: state.playbackState.progress,
//         isPlaying: state.playbackState.isPlaying
//       };
//     }
//   },

//   actions: {
//     // Définir toutes les musiques
//     async setTracks(newTracks: Track[]) {
//       // Ajouter des IDs uniques si elles n'en ont pas
//       this.tracks = newTracks.map((track, index) => ({
//         ...track,
//         id: track.id || `track_${index}_${Date.now()}`
//       }));
//     },

//     // Définir la playlist active
//     setActiveTracks(newTracks: Track[]) {
//       this.activeTracks = newTracks.map((track, index) => ({
//         ...track,
//         id: track.id || `track_${index}_${Date.now()}`
//       }));
//     },

//     // Changer la musique active
//     setActiveTrackId(id: number) {
//       if (id >= 0 && id < this.activeTracks.length) {
//         this.activeTrackId = id;
//         this.activeTrack = { ...this.activeTracks[id] };
//         this.trigger = !this.trigger;
        
//         // Ajouter à l'historique si c'est une nouvelle musique
//         if (this.playHistory.length === 0 || 
//             this.playHistory[this.playHistory.length - 1].id !== this.activeTrack.id) {
//           this.addToHistory(this.activeTrack);
//         }
//       }
//     },

//     // Jouer une musique spécifique
//     playTrack(tracks: Track[], trackIndex: number) {
//       this.setActiveTracks(tracks);
//       this.setActiveTrackId(trackIndex);
//       this.playbackState.isPlaying = true;
//       this.playbackState.isPaused = false;
//     },

//     // Mettre à jour l'état de lecture
//     updatePlaybackState(newState: Partial<PlaybackState>) {
//       this.playbackState = { ...this.playbackState, ...newState };
//     },

//     // Jouer/Pause
//     togglePlay() {
//       this.playbackState.isPlaying = !this.playbackState.isPlaying;
//       this.playbackState.isPaused = !this.playbackState.isPlaying;
//     },

//     // Play
//     play() {
//       this.playbackState.isPlaying = true;
//       this.playbackState.isPaused = false;
//     },

//     // Pause
//     pause() {
//       this.playbackState.isPlaying = false;
//       this.playbackState.isPaused = true;
//     },

//     // Stop
//     stop() {
//       this.playbackState.isPlaying = false;
//       this.playbackState.isPaused = false;
//       this.playbackState.currentTime = 0;
//       this.playbackState.progress = 0;
//     },

//     // Musique suivante
//     nextTrack() {
//       let nextIndex;
      
//       if (this.playbackOptions.shuffle) {
//         nextIndex = Math.floor(Math.random() * this.activeTracks.length);
//       } else {
//         nextIndex = (this.activeTrackId + 1) % this.activeTracks.length;
//       }
      
//       this.setActiveTrackId(nextIndex);
//     },

//     // Musique précédente
//     prevTrack() {
//       const prevIndex = (this.activeTrackId - 1 + this.activeTracks.length) % this.activeTracks.length;
//       this.setActiveTrackId(prevIndex);
//     },

//     // Mettre à jour les options de lecture
//     updatePlaybackOptions(options: Partial<typeof this.playbackOptions>) {
//       this.playbackOptions = { ...this.playbackOptions, ...options };
//     },

//     // Toggle Shuffle
//     toggleShuffle() {
//       this.playbackOptions.shuffle = !this.playbackOptions.shuffle;
//     },

//     // Toggle Loop
//     toggleLoop() {
//       this.playbackOptions.loop = !this.playbackOptions.loop;
//     },

//     // Ajouter à l'historique
//     addToHistory(track: Track) {
//       this.playHistory.push(track);
//       // Garder seulement les 50 dernières musiques
//       if (this.playHistory.length > 50) {
//         this.playHistory.shift();
//       }
//     },

//     // Ajouter à la queue
//     addToQueue(track: Track) {
//       this.playQueue.push(track);
//     },

//     // Supprimer de la queue
//     removeFromQueue(trackId: string) {
//       this.playQueue = this.playQueue.filter(track => track.id !== trackId);
//     },

//     // Vider la queue
//     clearQueue() {
//       this.playQueue = [];
//     },

//     // Mettre à jour la progression en temps réel
//     updateProgress(currentTime: number, duration: number) {
//       this.playbackState.currentTime = currentTime;
//       this.playbackState.duration = duration;
//       this.playbackState.progress = currentTime;
//     },

//     // Rechercher une musique dans la collection
//     findTrack(trackId: string): Track | undefined {
//       return this.tracks.find(track => track.id === trackId);
//     },

//     // Obtenir l'état complet pour les composants
//     getFullState() {
//       return {
//         activeTrack: this.activeTrack,
//         playbackState: this.playbackState,
//         playbackOptions: this.playbackOptions,
//         activeTracks: this.activeTracks,
//         activeTrackId: this.activeTrackId
//       };
//     }
//   }
// });

// // Fonction utilitaire pour formater le temps
// function formatTime(seconds: number): string {
//   if (isNaN(seconds)) return "0:00";
//   const minutes = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
// }

// // Fonction pour charger les métadonnées (inchangée)
// export async function loadMetadata(track: Track) {
//   try {
//     let currentTrack = {
//       title: "Chargement...",
//       artist: "Inconnu",
//       album: "Inconnu",
//       cover: "",
//       track: {},
//       year: 0,
//       src: track.src,
//       id: track.id || `track_${Date.now()}`
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
// }

import { defineStore } from 'pinia';
import { parseBlob } from "music-metadata-browser";
import { LyricsService } from '../api/lyricsService';

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
  id?: string;
  duration?: number;
  dateAdded?: Date;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  tracks: Track[];
  dateCreated: Date;
  dateModified: Date;
  duration: number; // durée totale en secondes
  trackCount: number;
  isDefault?: boolean; // pour les playlists par défaut comme "Favoris"
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
    
    // Playlists
    playlists: [
      {
        id: 'favorites',
        name: 'Favoris',
        description: 'Vos musiques favorites',
        tracks: [],
        dateCreated: new Date(),
        dateModified: new Date(),
        duration: 0,
        trackCount: 0,
        isDefault: true
      },
      {
        id: 'recently-played',
        name: 'Récemment jouées',
        description: 'Vos dernières écoutes',
        tracks: [],
        dateCreated: new Date(),
        dateModified: new Date(),
        duration: 0,
        trackCount: 0,
        isDefault: true
      }
    ] as Playlist[],
    
    // Playlist active (peut être différente de tracks selon le contexte)
    activeTracks: [] as Track[],
    currentPlaylist: null as Playlist | null,
    
    // Index de la musique actuellement jouée dans activeTracks
    activeTrackId: 0 as number,
    
    // Musique actuellement jouée (objet complet)
    activeTrack: { 
      title: "Chargement...", 
      artist: "Inconnu", 
      album: "Inconnu", 
      cover: "./public/Images/black.jpg", 
      src: "",
      id: undefined,
      year: 0,
      track: ""
    } as Track,

    currentLyrics: {
      lyrics: '',
      source: ''
    } as { lyrics: string; source: string } | null,
    lyricsLoading: false,
    
    // État de lecture détaillé
    playbackState: {
      currentTime: 0,
      duration: 0,
      progress: 0,
      volume: 0.5,
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
    
    // Vérifier si une musique spécifique est la musique active
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
    },

    // === GETTERS POUR PLAYLISTS ===
    
    // Obtenir une playlist par ID
    getPlaylistById: (state) => (id: string) => {
      return state.playlists.find(playlist => playlist.id === id);
    },
    
    // Obtenir les playlists utilisateur (non par défaut)
    getUserPlaylists: (state) => {
      return state.playlists.filter(playlist => !playlist.isDefault);
    },
    
    // Obtenir les playlists par défaut
    getDefaultPlaylists: (state) => {
      return state.playlists.filter(playlist => playlist.isDefault);
    },
    
    // Vérifier si une musique est dans une playlist
    isTrackInPlaylist: (state) => (trackId: string, playlistId: string) => {
      const playlist = state.playlists.find(p => p.id === playlistId);
      return playlist ? playlist.tracks.some(track => track.id === trackId) : false;
    },
    
    // Vérifier si une musique est dans les favoris
    isTrackFavorite: (state) => (trackId: string) => {
      const favPlaylist = state.playlists.find(p => p.id === 'favorites');
      return favPlaylist ? favPlaylist.tracks.some(track => track.id === trackId) : false;
    },
    
    // Obtenir les playlists contenant une musique
    getPlaylistsWithTrack: (state) => (trackId: string) => {
      return state.playlists.filter(playlist => 
        playlist.tracks.some(track => track.id === trackId)
      );
    },
    
    // Statistiques des playlists
    getPlaylistStats: (state) => {
      return {
        totalPlaylists: state.playlists.length,
        userPlaylists: state.playlists.filter(p => !p.isDefault).length,
        totalTracksInPlaylists: state.playlists.reduce((sum, p) => sum + p.trackCount, 0),
        totalDuration: state.playlists.reduce((sum, p) => sum + p.duration, 0)
      };
    },

    hasLyrics: (state) => !!state.currentLyrics,
    lyricsText: (state) => state.currentLyrics?.lyrics || '',
    lyricsSource: (state) => state.currentLyrics?.source || ''

  },

  actions: {
    // === ACTIONS MUSIQUES EXISTANTES ===
    async setTracks(newTracks: Track[]) {
      this.tracks = newTracks.map((track, index) => ({
        ...track,
        id: track.id || `track_${index}_${Date.now()}`,
        dateAdded: track.dateAdded || new Date()
      }));
    },

    setActiveTracks(newTracks: Track[]) {
      this.activeTracks = newTracks.map((track, index) => ({
        ...track,
        id: track.id || `track_${index}_${Date.now()}`
      }));
    },

    setActiveTrackId(id: number) {
      if (id >= 0 && id < this.activeTracks.length) {
        this.activeTrackId = id;
        this.activeTrack = { ...this.activeTracks[id] };
        this.trigger = !this.trigger;
        
        // Ajouter à l'historique et à "récemment jouées"
        this.addToHistory(this.activeTrack);
        this.addToRecentlyPlayed(this.activeTrack);
      }
    },

    playTrack(tracks: Track[], trackIndex: number, playlistId?: string) {
      this.setActiveTracks(tracks);
      if (playlistId) {
        this.currentPlaylist = this.getPlaylistById(playlistId) || null;
      }
      this.setActiveTrackId(trackIndex);
      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
    },

    updatePlaybackState(newState: Partial<PlaybackState>) {
      this.playbackState = { ...this.playbackState, ...newState };
    },

    togglePlay() {
      this.playbackState.isPlaying = !this.playbackState.isPlaying;
      this.playbackState.isPaused = !this.playbackState.isPlaying;
    },

    play() {
      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
    },

    pause() {
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = true;
    },

    stop() {
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = false;
      this.playbackState.currentTime = 0;
      this.playbackState.progress = 0;
    },

    nextTrack() {
      let nextIndex;
      
      if (this.playbackOptions.shuffle) {
        nextIndex = Math.floor(Math.random() * this.activeTracks.length);
      } else {
        nextIndex = (this.activeTrackId + 1) % this.activeTracks.length;
      }
      
      this.setActiveTrackId(nextIndex);
    },

    prevTrack() {
      const prevIndex = (this.activeTrackId - 1 + this.activeTracks.length) % this.activeTracks.length;
      this.setActiveTrackId(prevIndex);
    },

    updatePlaybackOptions(options: Partial<typeof this.playbackOptions>) {
      this.playbackOptions = { ...this.playbackOptions, ...options };
    },

    toggleShuffle() {
      this.playbackOptions.shuffle = !this.playbackOptions.shuffle;
    },

    toggleLoop() {
      this.playbackOptions.loop = !this.playbackOptions.loop;
    },

    addToHistory(track: Track) {
      // Supprimer les doublons récents
      this.playHistory = this.playHistory.filter(t => t.id !== track.id);
      this.playHistory.push({ ...track, dateAdded: new Date() });
      
      // Garder seulement les 100 dernières musiques
      if (this.playHistory.length > 100) {
        this.playHistory.shift();
      }
    },

    addToQueue(track: Track) {
      this.playQueue.push(track);
    },

    removeFromQueue(trackId: string) {
      this.playQueue = this.playQueue.filter(track => track.id !== trackId);
    },

    clearQueue() {
      this.playQueue = [];
    },

    updateProgress(currentTime: number, duration: number) {
      this.playbackState.currentTime = currentTime;
      this.playbackState.duration = duration;
      this.playbackState.progress = currentTime;
    },

    findTrack(trackId: string): Track | undefined {
      return this.tracks.find(track => track.id === trackId);
    },

    async fetchLyricsForCurrentTrack() {
      if (!this.activeTrack?.artist || !this.activeTrack?.title) {
        this.currentLyrics = null;
        return;
      }

      this.lyricsLoading = true;
      this.currentLyrics = null;

      try {
        const lyrics = await LyricsService.fetchLyrics(
          this.activeTrack.artist,
          this.activeTrack.title
        );
        this.currentLyrics = lyrics;
      } catch (error) {
        console.error('Erreur lors de la récupération des paroles:', error);
        this.currentLyrics = null;
      } finally {
        this.lyricsLoading = false;
      }
    },

        // Cache des paroles pour éviter les requêtes répétées
    lyricsCache: new Map(),

    async fetchLyricsWithCache(artist: string, title: string) {
      const cacheKey = `${artist}-${title}`.toLowerCase();
      
      if (this.lyricsCache.has(cacheKey)) {
        return this.lyricsCache.get(cacheKey);
      }

      const lyrics = await LyricsService.fetchLyrics(artist, title);
      
      // Mettre en cache même si null pour éviter les requêtes inutiles
      this.lyricsCache.set(cacheKey, lyrics);
      
      return lyrics;
    },

    // === NOUVELLES ACTIONS POUR PLAYLISTS ===

    // Créer une nouvelle playlist
    createPlaylist(name: string, description?: string): Playlist {
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description?.trim() || '',
        tracks: [],
        dateCreated: new Date(),
        dateModified: new Date(),
        duration: 0,
        trackCount: 0,
        isDefault: false
      };

      this.playlists.push(newPlaylist);
      this.savePlaylistsToStorage();
      return newPlaylist;
    },

    // Supprimer une playlist
    deletePlaylist(playlistId: string): boolean {
      const index = this.playlists.findIndex(p => p.id === playlistId);
      if (index === -1) return false;

      const playlist = this.playlists[index];
      if (playlist.isDefault) return false; // Ne pas supprimer les playlists par défaut

      this.playlists.splice(index, 1);
      
      // Si c'était la playlist active, la réinitialiser
      if (this.currentPlaylist?.id === playlistId) {
        this.currentPlaylist = null;
      }

      this.savePlaylistsToStorage();
      return true;
    },

    // Renommer une playlist
    renamePlaylist(playlistId: string, newName: string): boolean {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist || newName.trim() === '') return false;

      playlist.name = newName.trim();
      playlist.dateModified = new Date();
      this.savePlaylistsToStorage();
      return true;
    },

    // Modifier la description d'une playlist
    updatePlaylistDescription(playlistId: string, description: string): boolean {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return false;

      playlist.description = description.trim();
      playlist.dateModified = new Date();
      this.savePlaylistsToStorage();
      return true;
    },

    // Ajouter une musique à une playlist
    addTrackToPlaylist(trackId: string, playlistId: string): boolean {
      const track = this.findTrack(trackId);
      const playlist = this.playlists.find(p => p.id === playlistId);
      
      if (!track || !playlist) return false;
      
      // Vérifier si la musique n'est pas déjà dans la playlist
      if (playlist.tracks.some(t => t.id === trackId)) return false;

      const trackWithDate = { ...track, dateAdded: new Date() };
      playlist.tracks.push(trackWithDate);
      
      this.updatePlaylistMetadata(playlistId);
      this.savePlaylistsToStorage();
      return true;
    },

    // Supprimer une musique d'une playlist
    removeTrackFromPlaylist(trackId: string, playlistId: string): boolean {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return false;

      const initialLength = playlist.tracks.length;
      playlist.tracks = playlist.tracks.filter(track => track.id !== trackId);
      
      if (playlist.tracks.length === initialLength) return false; // Musique non trouvée

      this.updatePlaylistMetadata(playlistId);
      this.savePlaylistsToStorage();
      return true;
    },

    // Ajouter/retirer des favoris
    toggleFavorite(trackId: string): boolean {
      const favPlaylist = this.playlists.find(p => p.id === 'favorites');
      if (!favPlaylist) return false;

      if (this.isTrackFavorite(trackId)) {
        return this.removeTrackFromPlaylist(trackId, 'favorites');
      } else {
        return this.addTrackToPlaylist(trackId, 'favorites');
      }
    },

    // Réorganiser les musiques dans une playlist
    reorderPlaylistTracks(playlistId: string, fromIndex: number, toIndex: number): boolean {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist || fromIndex < 0 || toIndex < 0 || fromIndex >= playlist.tracks.length || toIndex >= playlist.tracks.length) {
        return false;
      }

      const track = playlist.tracks.splice(fromIndex, 1)[0];
      playlist.tracks.splice(toIndex, 0, track);
      
      playlist.dateModified = new Date();
      this.savePlaylistsToStorage();
      return true;
    },

    // Dupliquer une playlist
    duplicatePlaylist(playlistId: string, newName?: string): Playlist | null {
      const originalPlaylist = this.playlists.find(p => p.id === playlistId);
      if (!originalPlaylist) return null;

      const duplicatedPlaylist: Playlist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${originalPlaylist.name} (Copie)`,
        description: originalPlaylist.description,
        tracks: [...originalPlaylist.tracks], // Copie des musiques
        dateCreated: new Date(),
        dateModified: new Date(),
        duration: originalPlaylist.duration,
        trackCount: originalPlaylist.trackCount,
        isDefault: false
      };

      this.playlists.push(duplicatedPlaylist);
      this.savePlaylistsToStorage();
      return duplicatedPlaylist;
    },

    // Vider une playlist
    clearPlaylist(playlistId: string): boolean {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return false;

      playlist.tracks = [];
      this.updatePlaylistMetadata(playlistId);
      this.savePlaylistsToStorage();
      return true;
    },

    // Jouer une playlist
    playPlaylist(playlistId: string, trackIndex: number = 0): boolean {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist || playlist.tracks.length === 0) return false;

      this.playTrack(playlist.tracks, trackIndex, playlistId);
      return true;
    },

    // Ajouter une musique aux récemment jouées
    addToRecentlyPlayed(track: Track) {
      const recentPlaylist = this.playlists.find(p => p.id === 'recently-played');
      if (!recentPlaylist) return;

      // Supprimer l'ancienne occurrence si elle existe
      recentPlaylist.tracks = recentPlaylist.tracks.filter(t => t.id !== track.id);
      
      // Ajouter en début de liste
      recentPlaylist.tracks.unshift({ ...track, dateAdded: new Date() });
      
      // Garder seulement les 50 dernières
      if (recentPlaylist.tracks.length > 50) {
        recentPlaylist.tracks = recentPlaylist.tracks.slice(0, 50);
      }

      this.updatePlaylistMetadata('recently-played');
    },

    // Mettre à jour les métadonnées d'une playlist (durée, nombre de musiques)
    updatePlaylistMetadata(playlistId: string) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      playlist.trackCount = playlist.tracks.length;
      playlist.duration = playlist.tracks.reduce((total, track) => total + (track.duration || 0), 0);
      playlist.dateModified = new Date();
    },

    // Sauvegarder les playlists dans le localStorage
    savePlaylistsToStorage() {
      try {
        const playlistsToSave = this.playlists.map(playlist => ({
          ...playlist,
          // Ne sauvegarder que les IDs des musiques pour économiser l'espace
          tracks: playlist.tracks.map(track => ({
            id: track.id,
            dateAdded: track.dateAdded
          }))
        }));
        localStorage.setItem('music_playlists', JSON.stringify(playlistsToSave));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des playlists:', error);
      }
    },

    // Charger les playlists depuis le localStorage
    loadPlaylistsFromStorage() {
      try {
        const saved = localStorage.getItem('music_playlists');
        if (!saved) return;

        const savedPlaylists = JSON.parse(saved);
        
        savedPlaylists.forEach((savedPlaylist: any) => {
          const existingPlaylist = this.playlists.find(p => p.id === savedPlaylist.id);
          
          if (existingPlaylist) {
            // Reconstruire les musiques complètes à partir des IDs
            existingPlaylist.tracks = savedPlaylist.tracks
              .map((trackRef: any) => {
                const fullTrack = this.findTrack(trackRef.id);
                return fullTrack ? { ...fullTrack, dateAdded: new Date(trackRef.dateAdded) } : null;
              })
              .filter((track: any) => track !== null);
            
            existingPlaylist.name = savedPlaylist.name;
            existingPlaylist.description = savedPlaylist.description;
            existingPlaylist.dateCreated = new Date(savedPlaylist.dateCreated);
            existingPlaylist.dateModified = new Date(savedPlaylist.dateModified);
            
            this.updatePlaylistMetadata(existingPlaylist.id);
          } else if (!savedPlaylist.isDefault) {
            // Créer une nouvelle playlist utilisateur
            const newPlaylist: Playlist = {
              ...savedPlaylist,
              dateCreated: new Date(savedPlaylist.dateCreated),
              dateModified: new Date(savedPlaylist.dateModified),
              tracks: savedPlaylist.tracks
                .map((trackRef: any) => {
                  const fullTrack = this.findTrack(trackRef.id);
                  return fullTrack ? { ...fullTrack, dateAdded: new Date(trackRef.dateAdded) } : null;
                })
                .filter((track: any) => track !== null)
            };
            
            this.playlists.push(newPlaylist);
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des playlists:', error);
      }
    },

    // Importer des musiques dans une playlist depuis un fichier
    async importToPlaylist(playlistId: string, files: FileList) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return false;

      for (const file of Array.from(files)) {
        if (file.type.startsWith('audio/')) {
          try {
            const track = await this.createTrackFromFile(file);
            if (track && !playlist.tracks.some(t => t.src === track.src)) {
              playlist.tracks.push(track);
            }
          } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
          }
        }
      }

      this.updatePlaylistMetadata(playlistId);
      this.savePlaylistsToStorage();
      return true;
    },

    // Créer un objet Track à partir d'un fichier
    async createTrackFromFile(file: File): Promise<Track> {
      const url = URL.createObjectURL(file);
      const metadata = await parseBlob(file);

      let cover = "./public/Images/black.jpg";
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        cover = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
      }

      return {
        id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: metadata.common.title || file.name,
        artist: metadata.common.artist || "Artiste inconnu",
        album: metadata.common.album || "Album inconnu",
        year: metadata.common.year || 0,
        track: metadata.common.track
          ? `${metadata.common.track.no ?? ""}${metadata.common.track.of ? "/" + metadata.common.track.of : ""}`
          : "",
        src: url,
        cover,
        duration: metadata.format.duration || 0,
        dateAdded: new Date()
      };
    },

    getFullState() {
      return {
        activeTrack: this.activeTrack,
        playbackState: this.playbackState,
        playbackOptions: this.playbackOptions,
        activeTracks: this.activeTracks,
        activeTrackId: this.activeTrackId,
        currentPlaylist: this.currentPlaylist,
        playlists: this.playlists
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
      id: track.id || `track_${Date.now()}`,
      duration: 0
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
    currentTrack.duration = metadata.format.duration || 0;

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