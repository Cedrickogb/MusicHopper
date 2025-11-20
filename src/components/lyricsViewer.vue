<template>
  <div 
    :class="`lyrics-container ${props.mini ? `` : `p-4` } w-full h-full flex justify-center items-center`"
    :style="{ '--main-color':  mainColor }"
  >
    
    <div v-if="loading" class="loading">
      <p class="text-[var(--main-color)] animate-pulse">Recherche des paroles...</p>
    </div>
    
    <div v-else-if="lyricsData" class="flex flex-col h-full w-full justify-center items-center relative">
      
      <div 
        ref="lyricsContainer"
        class="lyrics-scroll-area flex flex-col gap-4 bg-black/40 backdrop-blur-sm text-white font-Poppins p-6 overflow-y-auto rounded-lg scrollBar transition-all duration-500 w-full text-center"
        :class="props.mini ? 'h-[99%]' : 'max-h-[60vh]'"
      >
        <template v-if="lyricsData.isSynced">
          <p 
            v-for="(line, index) in processedLyrics" 
            :key="index"
            :ref="(el) => setLineRef(el, index)" 
            class="lyrics-line transition-all duration-500 ease-out py-2 rounded px-4 cursor-pointer hover:bg-white/5"
            :class="[
              // Style pour la ligne active
              currentLineIndex === index 
                ? (line.isInstrumental 
                    ? `text-white tracking-[0.1em] scale-150 animate-pulse font-bold` // Style spécial pour les points
                    : `text-white font-bold ${props.mini ? `text-[18px]` : `text-[25px]`} opacity-100 active-line-glow` // Style standard
                  )
                : (line.isInstrumental
                    ? `text-gray-600 tracking-[0.5em] scale-90 opacity-30` // Points inactifs
                    : `text-gray-400 opacity-50 blur-[0.3px] ${props.mini ? `text-[16px]` : `text-[20px]`}` // Texte inactif
                  )
            ]"
            @click="seekToLine(line.time)"
          >
            {{ line.text }}
          </p>
        </template>

        <template v-else>
           <p 
            v-for="(line, index) in lyricsData.parsedLyrics" 
            :key="index" 
            class="text-gray-200 py-1 opacity-90"
          >
            {{ line.text }}
          </p>
        </template>

        <div class="h-[50%] w-full"></div>
      </div>

      <small class="lyrics-source mt-3 text-xs text-gray-500 font-mono">
        Source: {{ lyricsData.source }} {{ lyricsData.isSynced ? 'Synced' : 'Text' }}
      </small>
    </div>
    
    <div v-else class="flex flex-col text-sm text-white justify-center items-center text-center gap-4 opacity-80">
      <p>Aucune parole trouvée pour cette chanson</p>
      <button @click="searchLyrics" class="px-4 py-2 bg-cyan-900/50 hover:bg-cyan-600 text-cyan-100 rounded-full transition-all text-xs uppercase tracking-wider border border-cyan-700">
        Réessayer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'; // Ajout de computed
import { LyricsService } from '../api/lyricsService';
import { useMusicStore } from '../assets/script';

const props = defineProps({
  currentTrack: Object,
  mini: Boolean
});

const musicStore = useMusicStore();
const lyricsData = ref(null);
const loading = ref(false);
const currentLineIndex = ref(-1);
const processedLyrics = ref([]); // Nouvelle ref pour stocker les paroles avec les points

const lineRefs = ref({});
const lyricsContainer = ref(null);
let mainColor = ref("#0891B2"); // Déplacé pour être accessible

const setLineRef = (el, index) => {
  if (el) lineRefs.value[index] = el;
};

// --- FONCTION MAGIQUE : AJOUT DES POINTS ---
const processLyricsWithGaps = (originalLyrics) => {
  if (!originalLyrics || originalLyrics.length === 0) return [];
  
  const newLyrics = [];
  const GAP_THRESHOLD = 10; // Seuil en secondes pour afficher les points (ex: 10s)

  // 1. Vérifier s'il y a une longue intro
  if (originalLyrics[0].time > GAP_THRESHOLD) {
    newLyrics.push({
      time: 0, // Début de la chanson
      text: '• • •',
      isInstrumental: true
    });
  }

  // 2. Vérifier les intervalles entre les lignes
  for (let i = 0; i < originalLyrics.length; i++) {
    const currentLine = originalLyrics[i];
    newLyrics.push(currentLine); // On ajoute la ligne normale

    // S'il y a une ligne suivante
    if (i < originalLyrics.length - 1) {
      const nextLine = originalLyrics[i + 1];
      const gap = nextLine.time - currentLine.time;

      // Si l'écart est grand, on ajoute une ligne instrumentale au milieu
      if (gap > GAP_THRESHOLD) {
        // On peut ajuster le 'time' pour que les points s'allument un peu après la fin de la phrase
        // Ici, on les met à 1/3 du chemin
        newLyrics.push({
          time: currentLine.time + (gap * 0.3), 
          text: '• • •',
          isInstrumental: true
        });
      }
    }
  }
  
  return newLyrics;
};

const searchLyrics = async () => {
  if (!props.currentTrack?.artist || !props.currentTrack?.title) return;
  
  loading.value = true;
  lyricsData.value = null;
  processedLyrics.value = []; // Reset
  currentLineIndex.value = -1;
  
  try {
    const result = await LyricsService.fetchLyrics(
      props.currentTrack.artist,
      props.currentTrack.title,
      props.currentTrack.album,
      props.currentTrack.duration
    );
    
    lyricsData.value = result;

    // Si synchronisé, on traite les trous
    if (result && result.isSynced) {
      processedLyrics.value = processLyricsWithGaps(result.parsedLyrics);
    } else if (result) {
      processedLyrics.value = result.parsedLyrics;
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    loading.value = false;
  }
};

// --- COEUR DE LA SYNCHRONISATION (Modifié pour utiliser processedLyrics) ---
watch(
  () => musicStore.playbackState.currentTime,
  (newTime) => {
    if (!lyricsData.value?.isSynced || processedLyrics.value.length === 0) return;

    // On utilise processedLyrics ici au lieu de lyricsData.parsedLyrics
    const lines = processedLyrics.value;
    
    let activeIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= newTime) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex !== currentLineIndex.value) {
      currentLineIndex.value = activeIndex;
      scrollToActiveLine(activeIndex);
    }
  }
);

const scrollToActiveLine = (index) => {
  const element = lineRefs.value[index];
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }
};

const seekToLine = (time) => {
  // Attention: cette logique dépend de ton implémentation audio
  // musicStore.seek(time); 
  console.log("Seek to:", time);
};

watch(() => props.currentTrack, searchLyrics, { immediate: true });
watch(() => musicStore.mainColor, (color) => {
  mainColor.value = color; // Correction: .value nécessaire avec ref
});
</script>

<style scoped>
.lyrics-line:empty::before {
  content: ' ';
  white-space: pre;
}

.active-line-glow {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.992);
}

.scrollBar::-webkit-scrollbar {
  width: 6px;
}
.scrollBar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
.scrollBar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.scrollBar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>