<template>
    <div :class="`flex flex-col gap-1 ${props.mini ? `p-1` : `p-4` } h-full w-full shadow-lg`">
        
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">File d'attente</h2>
        </div>

        <div class="flex flex-col gap-3 h-[80%] overflow-auto scrollBar p-1" >
            <div class="flex flex-col gap-2">
                <h3 class="text-sm font-bold uppercase text-gray-400">En cours</h3>
                <div class="flex items-center space-x-2 rounded-md bg-white/10 p-1">
                    <img :src="musicStore.activeTrack.cover" class="h-9 w-9 rounded" alt="Pochette" />
                    <div>
                        <p class="text-xs font-medium text-white">{{ musicStore.activeTrack.title }}</p>
                        <p class="text-xs text-white/60">{{ musicStore.activeTrack.artist }}</p>
                    </div>
                </div>
            </div>
    
            <!-- <div>
                <div class="mb-2 flex items-center justify-between">
                    <h3 class="text-sm font-bold uppercase text-gray-400">À suivre</h3>
                    <button 
                        v-if="musicStore.playQueue.length > 0"
                        @click="musicStore.clearQueue" 
                        class="text-xs text-gray-400 hover:text-white"
                    >
                        Tout effacer
                    </button>
                </div>
        
                <ul v-if="musicStore.playQueue.length > 0" class="space-y-2">
                    <li 
                    v-for="track in musicStore.playQueue" 
                    :key="track.id" 
                    class="flex items-center justify-between space-x-3 rounded-md p-2 hover:bg-gray-700"
                    >
                    <div class="flex flex-1 items-center space-x-3 overflow-hidden">
                        <img :src="track.cover" class="h-10 w-10 flex-shrink-0 rounded" alt="Pochette" />
                        <div class="min-w-0">
                        <p class="truncate font-medium text-white">{{ track.title }}</p>
                        <p class="truncate text-sm text-gray-400">{{ track.artist }}</p>
                        </div>
                    </div>
                    <button @click="musicStore.removeFromQueue(track.id!)" class="text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </li>
                </ul>
                
                <p v-else class="text-sm text-gray-500">
                    Aucune musique dans la file d'attente.
                </p>
            </div> -->
    
            <div class="">
          
                <h3 class="mb-2 text-sm font-bold uppercase text-gray-400">
                    À suivre (Playlist)
                </h3>
    
                <ul v-if="musicStore.getUpcomingTracks.length > 0" class="space-y-0">
                    <li 
                        v-for="track in musicStore.getUpcomingTracks" 
                        :key="track.id" 
                        class="flex items-center space-x-3 rounded-md p-2 opacity-70"
                    >
                        <img :src="track.cover" class="h-9 w-9 flex-shrink-0 rounded" alt="Pochette" />
                        <div class="min-w-0">
                            <p class="truncate text-xs font-medium text-white">{{ track.title }}</p>
                            <p class="truncate text-xs text-gray-400">{{ track.artist }}</p>
                        </div>
                    </li>
                </ul>
                
                <p v-else-if="musicStore.playbackOptions.shuffle" class="text-sm text-gray-500">
                    La lecture aléatoire est activée.
                </p>
    
                <p v-else class="text-sm text-gray-500">
                    Fin de la liste de lecture.
                </p>
            </div>
        </div>

    </div>  
</template>

<script setup lang="ts">
import { useMusicStore } from '@/assets/script';

const props = defineProps({
  mini: Boolean
});

const musicStore = useMusicStore();

// Définit l'événement 'close' que le parent peut écouter
defineEmits(['close']);
</script>