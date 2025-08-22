<template>
  <!-- Indicateur global de musique qui peut être affiché sur toutes les pages -->
  <div v-if="hasActiveTrack" class="fixed bottom-4 right-4 z-50">
    <div class="flex items-center space-x-3 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-white min-w-[300px]">
      <!-- Image de la musique -->
      <div class="flex-shrink-0 w-12 h-12 bg-black rounded-md overflow-hidden">
        <img v-if="currentTrack.cover" :src="currentTrack.cover" alt="" class="w-full h-full object-cover">
      </div>
      
      <!-- Infos de la musique -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold truncate">{{ currentTrack.title }}</p>
        <p class="text-xs text-white/70 truncate">{{ currentTrack.artist }}</p>
        
        <!-- Barre de progression -->
        <div class="flex items-center space-x-2 mt-2">
          <span class="text-xs text-white/50">{{ formattedTime.currentTime }}</span>
          <div class="flex-1 bg-white/20 rounded-full h-1">
            <div 
              class="bg-cyan-500 h-full rounded-full transition-all duration-300"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <span class="text-xs text-white/50">{{ formattedTime.totalTime }}</span>
        </div>
      </div>
      
      <!-- Contrôles -->
      <div class="flex items-center space-x-2">
        <button @click="togglePlay" class="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button @click="nextTrack" class="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMusicStore } from '@/assets/script';

const musicStore = useMusicStore();

// État de la musique actuelle
const currentTrack = computed(() => musicStore.getCurrentTrack);
const isPlaying = computed(() => musicStore.playbackState.isPlaying);
const hasActiveTrack = computed(() => 
  musicStore.activeTrack.title && 
  musicStore.activeTrack.title !== "Chargement..." && 
  musicStore.activeTrack.src !== ""
);

// Progression formatée
const progressPercentage = computed(() => musicStore.getProgressPercentage);
const formattedTime = computed(() => musicStore.getFormattedState);

// Actions
const togglePlay = () => {
  musicStore.togglePlay();
};

const nextTrack = () => {
  musicStore.nextTrack();
};
</script>