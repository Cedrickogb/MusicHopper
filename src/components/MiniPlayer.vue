<template>
  <div v-if="hasActiveTrack" class="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-t border-white/10">
    <div class="flex items-center justify-between px-4 py-2">
      <!-- Informations sur la musique -->
      <div class="flex items-center space-x-3 min-w-0 flex-1">
        <div class="flex-shrink-0 w-12 h-12 bg-gray-800 rounded overflow-hidden">
          <img v-if="currentTrack.cover" :src="currentTrack.cover" alt="" class="w-full h-full object-cover">
        </div>
        
        <div class="min-w-0 flex-1">
          <p class="text-white text-sm font-medium truncate">{{ currentTrack.title }}</p>
          <p class="text-gray-400 text-xs truncate">{{ currentTrack.artist }}</p>
        </div>
      </div>
      
      <!-- Contrôles centraux -->
      <div class="flex items-center space-x-4">
        <button @click="prevTrack" class="text-white hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
          </svg>
        </button>
        
        <button @click="togglePlay" class="text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full">
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button @click="nextTrack" class="text-white hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
          </svg>
        </button>
      </div>
      
      <!-- Barre de progression et contrôles supplémentaires -->
      <div class="flex items-center space-x-3 min-w-0 flex-1 justify-end">
        <!-- Temps et progression -->
        <div class="flex items-center space-x-2 text-xs text-gray-400 min-w-0">
          <span class="flex-shrink-0">{{ formattedTime.currentTime }}</span>
          <div class="flex-1 bg-gray-700 rounded-full h-1 max-w-32">
            <div 
              class="bg-white h-full rounded-full transition-all duration-300"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <span class="flex-shrink-0">{{ formattedTime.totalTime }}</span>
        </div>
        
        <!-- Contrôle volume -->
        <div class="flex items-center space-x-2">
          <button @click="toggleMute" class="text-white hover:text-gray-300 transition-colors">
            <svg v-if="volume > 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
            </svg>
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="volume"
            class="w-16 h-1 bg-gray-700 rounded-full appearance-none slider"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMusicStore } from '@/assets/script';

const musicStore = useMusicStore();

// État local pour le mute
const lastVolume = ref(0.2);

// Computed properties
const currentTrack = computed(() => musicStore.activeTrack);
const isPlaying = computed(() => musicStore.playbackState.isPlaying);
const progressPercentage = computed(() => musicStore.getProgressPercentage);
const formattedTime = computed(() => musicStore.getFormattedState);

const hasActiveTrack = computed(() => 
  musicStore.activeTrack.title && 
  musicStore.activeTrack.title !== "Chargement..." && 
  musicStore.activeTrack.src !== ""
);

const volume = computed({
  get: () => musicStore.playbackState.volume,
  set: (value) => {
    musicStore.updatePlaybackState({ volume: parseFloat(value) });
  }
});

// Actions
const togglePlay = () => musicStore.togglePlay();
const nextTrack = () => musicStore.nextTrack();
const prevTrack = () => musicStore.prevTrack();

const toggleMute = () => {
  if (musicStore.playbackState.volume > 0) {
    lastVolume.value = musicStore.playbackState.volume;
    musicStore.updatePlaybackState({ volume: 0 });
  } else {
    musicStore.updatePlaybackState({ volume: lastVolume.value });
  }
};
</script>

<style scoped>
.slider {
  background: transparent;
  cursor: pointer;
}

.slider::-webkit-slider-track {
  background: #374151;
  height: 4px;
  border-radius: 2px;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: none;
}

.slider::-moz-range-track {
  background: #374151;
  height: 4px;
  border-radius: 2px;
  border: none;
}

.slider::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: none;
}
</style>