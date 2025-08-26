<template>
  <div :class="`lyrics-container ${props.mini ? `` : `p-4` } w-full h-full flex justify-center items-center`">
    <div v-if="loading" class="loading">
      Chargement des paroles...
    </div>
    
    <div v-else-if="lyrics" class="flex flex-col h-full w-full justify-center items-center">
      <!-- <h3>{{ currentTrack?.title }} - {{ currentTrack?.artist }}</h3> -->
      <!-- <div class="bg-black/40 text-white p-2 rounded">
        {{ lyrics.lyrics }}
      </div> -->
      <pre :class="`${props.mini ? `h-[99%]` : `max-h-[60vh]` } bg-black/40 backdrop-blur-sm text-white font-Poppins p-3 overflow-auto rounded-lg scrollBar lyrics-text`">{{ lyrics.lyrics }}</pre>
      <small class="lyrics-source">Source: {{ lyrics.source }}</small>
    </div>
    
    <div v-else class="flex flex-col text-sm text-white justify-center items-center text-center gap-4">
      <p>Aucune parole trouvée pour cette chanson</p>
      <button @click="searchLyrics" class="w-fit bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-1 px-4 rounded-lg">
        Réessayer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { LyricsService } from '../api/lyricsService';

const props = defineProps({
  currentTrack: Object,
  mini: Boolean
});

const lyrics = ref(null);
const loading = ref(false);

const searchLyrics = async () => {
  if (!props.currentTrack?.artist || !props.currentTrack?.title) return;
  
  loading.value = true;
  lyrics.value = null;
  
  try {
    const result = await LyricsService.fetchLyrics(
      props.currentTrack.artist,
      props.currentTrack.title
    );
    lyrics.value = result;
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    loading.value = false;
  }
};

fetch('https://api.lyrics.ovh/v1/Coldplay/Yellow')
  .then(r => r.json())
  .then(data => console.log(data.lyrics));

// Surveiller les changements de piste
watch(() => props.currentTrack, searchLyrics, { immediate: true });
</script>

<style scoped>
/* .lyrics-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
} */

.lyrics-content h3 {
  color: white;
  margin-bottom: 20px;
  text-align: center;
}

.lyrics-text {
  white-space: pre-wrap;
  /* font-family: 'Arial', sans-serif; */
  line-height: 1.6;
}

.lyrics-source {
  color: #888;
  text-align: right;
  display: block;
  margin-top: 10px;
}

.retry-btn {
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background: #0284c7;
}

.loading {
  text-align: center;
  color: #e6e6e6;
  padding: 20px;
}
</style>