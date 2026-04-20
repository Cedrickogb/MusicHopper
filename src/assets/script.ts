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
    // ... (tout votre 'state' reste inchangé)
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
    activeTrackId: 0 as number | null,
    
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

    // Couleur principale de l'app
    mainColor: '#0891B2',

    // Progression du chargement progressif des métadonnées
    loadingProgress: {
      current: 0,
      total: 0,
      isLoading: false
    }
  }),

  getters: {
    // ... (tous vos 'getters' restent inchangés)
    getCurrentTrack: (state) => {
      return {
        ...state.activeTrack,
        ...state.playbackState,
        playbackOptions: state.playbackOptions
      };
    },
    isTrackPlaying: (state) => (track: Track) => {
      return state.activeTrack.id === track.id && state.playbackState.isPlaying;
    },
    isActiveTrack: (state) => (track: Track) => {
      return state.activeTrack.id === track.id;
    },
    getProgressPercentage: (state) => {
      if (state.playbackState.duration === 0) return 0;
      return (state.playbackState.currentTime / state.playbackState.duration) * 100;
    },
    getFormattedState: (state) => {
      return {
        currentTime: formatTime(state.playbackState.currentTime),
        totalTime: formatTime(state.playbackState.duration),
        progress: state.playbackState.progress,
        isPlaying: state.playbackState.isPlaying
      };
    },
    getPlaylistById: (state) => (id: string) => {
      return state.playlists.find(playlist => playlist.id === id);
    },
    getUserPlaylists: (state) => {
      return state.playlists.filter(playlist => !playlist.isDefault);
    },
    getDefaultPlaylists: (state) => {
      return state.playlists.filter(playlist => playlist.isDefault);
    },
    isTrackInPlaylist: (state) => (trackId: string, playlistId: string) => {
      const playlist = state.playlists.find(p => p.id === playlistId);
      return playlist ? playlist.tracks.some(track => track.id === trackId) : false;
    },
    isTrackFavorite: (state) => (trackId: string) => {
      const favPlaylist = state.playlists.find(p => p.id === 'favorites');
      return favPlaylist ? favPlaylist.tracks.some(track => track.id === trackId) : false;
    },
    getPlaylistsWithTrack: (state) => (trackId: string) => {
      return state.playlists.filter(playlist => 
        playlist.tracks.some(track => track.id === trackId)
      );
    },
    getPlaylistStats: (state) => {
      return {
        totalPlaylists: state.playlists.length,
        userPlaylists: state.playlists.filter(p => !p.isDefault).length,
        totalTracksInPlaylists: state.playlists.reduce((sum, p) => sum + p.trackCount, 0),
        totalDuration: state.playlists.reduce((sum, p) => sum + p.duration, 0)
      };
    },
    getUpcomingTracks: (state) => {
      // Si l'ID est null (car la musique vient de la playQueue)
      // ou si la lecture aléatoire est activée, on ne peut pas prédire.
      if (state.activeTrackId === null || state.playbackOptions.shuffle) {
        return [];
      }
      
      // S'il n'y a pas de liste active
      if (state.activeTracks.length === 0) {
        return [];
      }

      // On retourne les 10 prochaines chansons (ou moins s'il n'y en a pas 10)
      return state.activeTracks.slice(state.activeTrackId + 1, state.activeTrackId + 11);
    },
    hasLyrics: (state) => !!state.currentLyrics,
    lyricsText: (state) => state.currentLyrics?.lyrics || '',
    lyricsSource: (state) => state.currentLyrics?.source || '',
  },

  actions: {

    //changer la couleur principale
    updateMainColor(color: string){
      this.mainColor = color;
    },

    // === ACTIONS MUSIQUES EXISTANTES ===
    async setTracks(newTracks: Track[]) {
      this.tracks = newTracks.map((track, index) => ({
        ...track,
        id: track.id || `track_${index}_${Date.now()}`,
        dateAdded: track.dateAdded || new Date()
      }));
    },

    /**
     * Chargement progressif des métadonnées.
     * Phase 1 : affiche immédiatement les pistes avec titre de base.
     * Phase 2 : applique le cache persistant (instantané).
     * Phase 3 : charge les métadonnées manquantes par lots de 5 en parallèle.
     * @param rawFiles  List de { title, src } retournée par le main process
     * @param onReady   Callback appelé dès que les pistes de base sont prêtes (avant chargement complet)
     */
    async loadTracksProgressively(
      rawFiles: { title: string; src: string }[],
      onReady?: () => void
    ) {
      if (!rawFiles || rawFiles.length === 0) return;

      // ── Phase 1 : affichage immédiat ──────────────────────────────────────────
      const baseTracks: Track[] = rawFiles.map((f, index) => ({
        id: `track_${index}_${Date.now()}`,
        title: f.title,
        artist: '',
        album: '',
        cover: '',
        src: f.src,
        year: 0,
        track: '',
        duration: 0,
        dateAdded: new Date()
      }));
      this.tracks = baseTracks;

      // Notifier le composant parent pour naviguer vers /songs immédiatement
      onReady?.();

      // ── Phase 2 : appliquer le cache persistant ───────────────────────────────
      this.loadingProgress = { current: 0, total: rawFiles.length, isLoading: true };

      const srcList = rawFiles.map(f => f.src);
      let cachedMap: Record<string, any> = {};

      try {
        if (typeof window !== 'undefined' && window.electron) {
          // @ts-expect-error
          cachedMap = await window.electron.getCachedMetadata(srcList);
        }
      } catch (e) {
        console.warn('Impossible de charger le cache métadonnées :', e);
      }

      // Appliquer immédiatement les métadonnées en cache
      let cachedCount = 0;
      for (let i = 0; i < this.tracks.length; i++) {
        const cached = cachedMap[this.tracks[i].src];
        if (cached) {
          this.tracks[i] = { ...this.tracks[i], ...cached };
          cachedCount++;
        }
      }
      this.loadingProgress.current = cachedCount;
      console.log(`📦 ${cachedCount} pistes chargées depuis le cache`);

      // ── Phase 3 : charger les métadonnées manquantes par lots ─────────────────
      const uncachedTracks = this.tracks.filter(t => t.artist === '');
      const BATCH_SIZE = 5;
      const newCacheBatch: Record<string, any> = {};

      for (let i = 0; i < uncachedTracks.length; i += BATCH_SIZE) {
        const batch = uncachedTracks.slice(i, i + BATCH_SIZE);

        // Charger 5 fichiers en parallèle
        const results = await Promise.allSettled(
          batch.map(track => loadMetadata(track))
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === 'fulfilled' && result.value) {
            const enriched = result.value;
            // Trouver l'index dans this.tracks et mettre à jour
            const trackIndex = this.tracks.findIndex(t => t.src === batch[j].src);
            if (trackIndex !== -1) {
              this.tracks[trackIndex] = { ...this.tracks[trackIndex], ...enriched };
            }
            // Préparer la mise en cache (sans cover blob — non sérialisable)
            newCacheBatch[batch[j].src] = {
              title: enriched.title,
              artist: enriched.artist,
              album: enriched.album,
              year: enriched.year,
              duration: enriched.duration,
              track: enriched.track
              // Note: cover (blob URL) n'est pas mis en cache car non persistable
            };
          }
        }

        this.loadingProgress.current = cachedCount + Math.min(i + BATCH_SIZE, uncachedTracks.length);
      }

      // Sauvegarder le nouveau lot de métadonnées dans le cache persistant
      if (Object.keys(newCacheBatch).length > 0) {
        try {
          if (typeof window !== 'undefined' && window.electron) {
            // @ts-expect-error
            await window.electron.saveCachedMetadata(newCacheBatch);
            console.log(`💾 ${Object.keys(newCacheBatch).length} nouvelles entrées sauvegardées dans le cache`);
          }
        } catch (e) {
          console.warn('Impossible de sauvegarder le cache métadonnées :', e);
        }
      }

      this.loadingProgress = { current: rawFiles.length, total: rawFiles.length, isLoading: false };
      console.log('✅ Chargement progressif terminé');
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

        this.fetchLyricsForCurrentTrack();
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

    // nextTrack() {
    //   let nextIndex;
      
    //   if (this.playbackOptions.shuffle) {
    //     nextIndex = Math.floor(Math.random() * this.activeTracks.length);
    //   } else {
    //     nextIndex = (this.activeTrackId + 1) % this.activeTracks.length;
    //   }
      
    //   this.setActiveTrackId(nextIndex);
    // },
    nextTrack() {
      // ÉTAPE 1 : La file d'attente "À suivre" (playQueue) est PRIORITAIRE
      if (this.playQueue.length > 0) {
        
        // On prend la première musique de la file d'attente et on la retire
        const nextTrackInQueue = this.playQueue.shift(); 
        
        if (nextTrackInQueue) {
          // On définit cette musique comme la musique active
          this.activeTrack = { ...nextTrackInQueue };
          
          // IMPORTANT : On met l'ID à null
          this.activeTrackId = null; 
          
          // On notifie l'interface du changement
          this.trigger = !this.trigger;
          
          // On met à jour l'historique et on charge les paroles
          this.addToHistory(this.activeTrack);
          this.addToRecentlyPlayed(this.activeTrack);
          this.fetchLyricsForCurrentTrack(); // (Nous l'avions ajouté avant)
        }

      // ÉTAPE 2 : S'il n'y a rien dans la file d'attente, on continue normalement
      } else {
        
        // On récupère le dernier index valide (s'il était null, on repart de 0)
        let lastValidIndex = this.activeTrackId !== null ? this.activeTrackId : 0;
        
        if (this.activeTracks.length === 0) return; // Sécurité

        let nextIndex;
        
        if (this.playbackOptions.shuffle) {
          nextIndex = Math.floor(Math.random() * this.activeTracks.length);
        } else {
          // On passe à la suivante dans la liste active
          nextIndex = (lastValidIndex + 1) % this.activeTracks.length;
        }
        
        // On appelle 'setActiveTrackId' qui va remettre un ID numérique
        this.setActiveTrackId(nextIndex);
      }
    },
    // nextTrack() {
    //   // ÉTAPE 1 : La file d'attente "À suivre" (playQueue) est prioritaire
    //   if (this.playQueue.length > 0) {
        
    //     // On prend la première musique de la file d'attente et on la retire
    //     const nextTrackInQueue = this.playQueue.shift(); 
        
    //     if (nextTrackInQueue) {
    //       // On définit cette musique comme la musique active
    //       this.activeTrack = { ...nextTrackInQueue };
          
    //       // On met l'ID à null, car cette musique ne vient pas de 'activeTracks'
    //       this.activeTrackId = null; 
          
    //       // On déclenche la mise à jour
    //       this.trigger = !this.trigger;
          
    //       // On l'ajoute à l'historique et aux paroles
    //       this.addToHistory(this.activeTrack);
    //       this.addToRecentlyPlayed(this.activeTrack);
    //       this.fetchLyricsForCurrentTrack();
    //     }

    //   // ÉTAPE 2 : S'il n'y a rien dans la file d'attente, on continue normalement
    //   } else {
        
    //     // Si la dernière musique n'était pas dans la liste (ID=null)
    //     // On reprend simplement à la suite de la dernière "vraie" musique jouée
    //     let lastValidIndex = this.activeTrackId !== null ? this.activeTrackId : 0;

    //     let nextIndex;
        
    //     if (this.playbackOptions.shuffle) {
    //       nextIndex = Math.floor(Math.random() * this.activeTracks.length);
    //     } else {
    //       nextIndex = (lastValidIndex + 1) % this.activeTracks.length;
    //     }
        
    //     this.setActiveTrackId(nextIndex);
    //   }
    // },

    // prevTrack() {
    //   const prevIndex = (this.activeTrackId - 1 + this.activeTracks.length) % this.activeTracks.length;
    //   this.setActiveTrackId(prevIndex);
    // },
    prevTrack() {
      // On vérifie si l'ID est null (si la musique venait de la queue)
      // Si c'est null, on utilise 0 comme point de départ
      const currentId = this.activeTrackId ?? 0;

      // Le reste de ton calcul fonctionne parfaitement
      const prevIndex = (currentId - 1 + this.activeTracks.length) % this.activeTracks.length;
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
        // ON UTILISE L'ACTION DU CACHE ICI
        const lyrics = await this.fetchLyricsWithCache(
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
    // lyricsCache: new Map(),
    // async fetchLyricsWithCache(artist: string, title: string) {
    //   const cacheKey = `${artist}-${title}`.toLowerCase();
      
    //   if (this.lyricsCache.has(cacheKey)) {
    //     return this.lyricsCache.get(cacheKey);
    //   }

    //   const lyrics = await LyricsService.fetchLyrics(artist, title);
      
    //   // Mettre en cache même si null pour éviter les requêtes inutiles
    //   this.lyricsCache.set(cacheKey, lyrics);
      
    //   return lyrics;
    // },
    lyricsCache: {} as Record<string, any>,
    async fetchLyricsWithCache(artist: string, title: string, album?: string, duration?: number) {
      // 1. On crée une clé unique pour identifier la chanson
      // On nettoie un peu les chaînes pour éviter les doublons (minuscules, trim)
      const safeArtist = (artist || "").toLowerCase().trim();
      const safeTitle = (title || "").toLowerCase().trim();
      const cacheKey = `${safeArtist}-${safeTitle}`;
      
      // 2. CONTRÔLE DU CACHE
      // On vérifie si la clé existe directement dans l'objet
      if (this.lyricsCache[cacheKey] !== undefined) {
        console.log(`✅ Paroles récupérées depuis le cache pour : ${title}`);
        return this.lyricsCache[cacheKey];
      }

      console.log(`🌍 Recherche des paroles en ligne pour : ${title}`);

      // 3. Si pas en cache, on fait la requête réseau
      const lyrics = await LyricsService.fetchLyrics(artist, title, album, duration);
      
      // 4. MISE EN CACHE
      // On stocke le résultat (même si c'est null) pour ne pas refaire la requête
      this.lyricsCache[cacheKey] = lyrics;
      
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

    /**
     * Sauvegarder les playlists dans le fichier JSON via Electron
     */
    async savePlaylistsToStorage() {
      try {
        const playlistsToSave = this.playlists.map(playlist => ({
          ...playlist,
          // Ne sauvegarder que les IDs des musiques pour économiser l'espace
          tracks: playlist.tracks.map(track => ({
            id: track.id,
            dateAdded: track.dateAdded
          }))
        }));
        
        // APPEL À ELECTRON AU LIEU DE localStorage
        if(typeof window !== "undefined" && window.electron){
          // @ts-expect-error
          await window.electron.savePlaylists(playlistsToSave);
        }

      } catch (error) {
        console.error('Erreur (Pinia) lors de la sauvegarde des playlists:', error);
      }
    },

    /**
     * Charger les playlists depuis le fichier JSON via Electron
     */
    async loadPlaylistsFromStorage() {
      try {
        // APPEL À ELECTRON AU LIEU DE localStorage
        let savedPlaylists
        if(typeof window !== "undefined" && window.electron){
          // @ts-expect-error
          savedPlaylists = await window.electron.loadPlaylists();
        }
        
        // Si le fichier n'existe pas ou est vide (premier lancement)
        if (!savedPlaylists) {
          console.log("Aucun fichier de playlists trouvé, chargement initial.");
          return;
        }

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
            
            // On met à jour les métadonnées de la nouvelle playlist aussi
            this.playlists.push(newPlaylist);
            this.updatePlaylistMetadata(newPlaylist.id);
          }
        });
      } catch (error) {
        console.error('Erreur (Pinia) lors du chargement des playlists:', error);
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

// ... (vos fonctions 'formatTime' et 'loadMetadata' restent inchangées)
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