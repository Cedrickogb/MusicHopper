<template>
  <div id="app" class="big-gradient-bg relative flex flex-col w-full h-[100vh]">
    <!-- Zone de titre personnalisée -->
    <div class="titlebar">
      <div class="titlebar-content">
        <span class="app-title">MusicHopper</span>
      </div>
      
      <!-- Boutons de contrôle personnalisés -->
      <div class="window-controls">
        <button @click="minimizeWindow" class="control-btn minimize-btn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="5" width="8" height="2"/>
          </svg>
        </button>
        <button @click="toggleMaximize" class="control-btn maximize-btn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
          </svg>
        </button>
        <button @click="closeWindow" class="control-btn close-btn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="gradient-bg absolute top-0 left-0 w-full h-full backdrop-blur-sm overflow-hidden -z-10">
      <div :class="`absolute flex top-0 left-0 w-full h-full bg-black/50 blur-lg`"></div>
      <div :class="`g1 absolute flex top-0 left-0 w-[20em] h-full blur-lg`"></div>
      <div :class="`g2 absolute flex top-[10%] left-[20%] w-[30em] h-[25em] rounded-full blur-lg`"></div>
      <div :class="`g3 absolute flex top-0 right-0 w-[30em] h-[50%] blur-lg`"></div>
      <div :class="`g4 absolute flex top-[20%] right-[20%] w-[20%] h-[40%] rounded-full blur-lg`"></div>
      <div :class="`g5 absolute flex top-[70%] left-0 w-[20%] h-[40%] rounded-full blur-lg`"></div>
      <div :class="`g5 absolute flex top-[50%] left-[30%] w-[20em] h-[20em] rounded-full blur-lg`"></div>
      <div :class="`g1 absolute flex bottom-0 left-[75%] w-[50%] h-[40%] rounded-full blur-lg`"></div>
    </div>
    <div v-if="isloading" class="absolute left-0 -top-[10%] flex justify-center items-center w-full h-[110%] bg-black/30 backdrop-blur-md z-10">
        <span :class="`flex text-cyan-600`">
            <svg class="size-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><radialGradient id="a12" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"><stop offset="0" stop-color="currentColor"></stop><stop offset=".3" stop-color="currentColor" stop-opacity=".9"></stop><stop offset=".6" stop-color="currentColor" stop-opacity=".6"></stop><stop offset=".8" stop-color="currentColor" stop-opacity=".3"></stop><stop offset="1" stop-color="currentColor" stop-opacity="0"></stop></radialGradient><circle transform-origin="center" fill="none" stroke="url(#a12)" stroke-width="14" stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100" r="70"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></circle><circle transform-origin="center" fill="none" opacity=".2" stroke="currentColor" stroke-width="14" stroke-linecap="round" cx="100" cy="100" r="70"></circle></svg>
        </span>
    </div>

    <!-- Contenu principal avec marge pour la titlebar -->
    <div class="main-content flex w-full h-[calc(100vh-135px)] p-1 gap-1">
      <SideBar class="h-full flex-none overflow-y-scroll scrollBar m-[1px]"/>

      <RouterView  class="w-[50%] flex-auto bg-black/30 p-2 border border-white/40 rounded-lg backdrop-blur-md"/>

      <div v-if="$router.currentRoute.value.name != 'settings' && lyricsOn" class=" w-[25%] bg-black/30 p-2 border border-white/40 rounded-lg backdrop-blur-md overflow-y-auto scrollBar">
        <lyricsViewer :currentTrack="musicStore.activeTrack" :mini="true" />
      </div>

    </div>
    
    <Player @toggle-section="showLyrics"/>

  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router'
import router from '@/router';
import SideBar from './components/sideBar.vue';
import Player from '@/components/player.vue';
import { useMusicStore, loadMetadata } from '@/assets/script';
import lyricsViewer from './components/lyricsViewer.vue';

const musicStore = useMusicStore();

let isloading = ref(false)

var tracks = ref([])
var activeTrackId = ref(0)
var restart = ref(false)

var lyricsOn = ref(false)
function showLyrics() {
  lyricsOn.value = !lyricsOn.value
}

// Fonctions pour les contrôles de fenêtre
const minimizeWindow = async () => {
  try {
    await window.electron?.minimizeWindow();
  } catch (error) {
    console.error('Erreur lors de la minimisation:', error);
  }
};

const toggleMaximize = async () => {
  try {
    await window.electron?.maximizeWindow();
  } catch (error) {
    console.error('Erreur lors du toggle maximize:', error);
  }
};

const closeWindow = async () => {
  try {
    await window.electron?.closeWindow();
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error);
  }
};

async function initTrackList(songs) {
  const enriched = [];
  for (const song of songs) {
    const enrichedTrack = await loadMetadata(song);
    if (enrichedTrack) enriched.push(enrichedTrack);
  }
  return enriched;
}

const loadTracks = async (tracksTab) => {
  await musicStore.setTracks(tracksTab);
  if(musicStore.tracks[0].title != "Chargement"){
    console.log(router,"route")
  }
};

onMounted(async() => {
  isloading.value = true
  router.push('/')

  const result = await window.electron.validateFolder();
  if (result?.valid) {
    console.log("Dossier déjà sélectionné :", result.path);
    const validSongs = await initTrackList(result.musics);
    loadTracks(validSongs);

    router.push('/songs')
  } else {
    console.log("Aucun dossier valide trouvé, l'utilisateur devra en sélectionner un.");
    router.push('/settings')
  }

  isloading.value = false
})
</script>

<style scoped>
/* Zone de titre personnalisée */
.titlebar {
  -webkit-app-region: drag; /* Permet de déplacer la fenêtre */
  height: 36px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* background: rgba(0, 0, 0, 0.3); */
  backdrop-filter: blur(10px);
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.1); */
  background: linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0))
}

.titlebar-content {
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex: 1;
}

.app-title {
  color: white;
  font-weight: 500;
  font-size: 16px;
  user-select: none;
}

/* Boutons de contrôle de fenêtre */
.window-controls {
  display: flex;
  height: 32px;
  -webkit-app-region: no-drag; /* Les boutons ne doivent pas déplacer la fenêtre */
}

.control-btn {
  width: 46px;
  height: 32px;
  border: none;
  background: transparent;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  background: #e81123 !important;
}

.minimize-btn:hover,
.maximize-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Ajuster le contenu principal */
.main-content {
  margin-top: 36px; /* Même hauteur que la titlebar */
}

/* Les éléments interactifs dans la titlebar */
.titlebar button, 
.titlebar input, 
.titlebar select,
.no-drag {
  -webkit-app-region: no-drag;
}
</style>