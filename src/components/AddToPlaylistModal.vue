<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="close">
    <div class="bg-gray-800 rounded-lg p-4 max-w-md w-[80%] max-h-[90%] flex flex-col">
      <h2 class="text-xl font-semibold mb-4">
        Ajouter "{{ trackToAdd?.title }}" à une playlist
      </h2>
      
      <!-- Bouton créer nouvelle playlist -->
      <div class="mb-4 space-y-1">
        <button 
          @click="showCreateNew = !showCreateNew"
          class="w-full flex items-center justify-between p-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
        >
          <div class="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Créer une nouvelle playlist</span>
          </div>
          <svg 
            :class="`w-4 h-4 transition-transform ${showCreateNew ? 'rotate-180' : ''}`"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="2" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        
        <!-- Formulaire de création -->
        <div v-if="showCreateNew" class="p-2 px-3 bg-gray-700 rounded-lg space-y-3">
          <input 
            v-model="newPlaylistName"
            type="text" 
            placeholder="Nom de la playlist"
            class="w-full bg-gray-600 border border-gray-500 text-sm rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
            @keyup.enter="createAndAdd"
          />
          <div class="flex justify-end space-x-2 text-xs">
            <button 
              @click="showCreateNew = false"
              class="px-3 py-1 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="createAndAdd"
              :disabled="!newPlaylistName.trim()"
              class="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
            >
              Créer et ajouter
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des playlists existantes -->
      <div class="flex-1 overflow-auto scrollBar space-y-2">
        <h3 class="text-sm font-medium text-white/70 mb-2">Vos playlists</h3>
        
        <div v-if="availablePlaylists.length === 0" class="text-center py-8 text-white/50">
          <p>Aucune playlist disponible</p>
          <p class="text-sm">Créez votre première playlist ci-dessus</p>
        </div>
        
        <div 
          v-for="playlist in availablePlaylists" 
          :key="playlist.id"
          @click="addToPlaylist(playlist)"
          :class="`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            isTrackInPlaylist(playlist.id) 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-white/5 hover:bg-white/10'
          }`"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <!-- Icône de playlist -->
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white/70">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
              </svg>
            </div>
            
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ playlist.name }}</p>
              <p class="text-xs text-white/60 truncate">
                {{ playlist.trackCount }} musique{{ playlist.trackCount > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          
          <!-- Statut -->
          <div class="flex-shrink-0">
            <div v-if="isTrackInPlaylist(playlist.id)" class="flex items-center space-x-1 text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm">Ajoutée</span>
            </div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white/40">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-end space-x-3 mt-4 pt-4 border-t border-white/10">
        <button 
          @click="close"
          class="px-4 py-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useMusicStore } from '../../assets/script';

const musicStore = useMusicStore();

// Props et Events
const props = defineProps({
  track: Object,
  isVisible: Boolean
});

const emit = defineEmits(['close', 'added']);

// État local
const showCreateNew = ref(false);
const newPlaylistName = ref('');

// Computed
const trackToAdd = computed(() => props.track);

const availablePlaylists = computed(() => {
  return musicStore.playlists.filter(playlist => 
    // Exclure les playlists par défaut sauf les favoris
    playlist.id === 'favorites' || !playlist.isDefault
  ).sort((a, b) => {
    // Mettre les favoris en premier
    if (a.id === 'favorites') return -1;
    if (b.id === 'favorites') return 1;
    return a.name.localeCompare(b.name);
  });
});

// Méthodes
const isTrackInPlaylist = (playlistId) => {
  if (!trackToAdd.value) return false;
  return musicStore.isTrackInPlaylist(trackToAdd.value.id, playlistId);
};

const addToPlaylist = (playlist) => {
  if (!trackToAdd.value) return;
  
  if (isTrackInPlaylist(playlist.id)) {
    // Si déjà dans la playlist, la supprimer
    const success = musicStore.removeTrackFromPlaylist(trackToAdd.value.id, playlist.id);
    if (success) {
      emit('added', { 
        action: 'removed', 
        playlist: playlist.name, 
        track: trackToAdd.value.title 
      });
    }
  } else {
    // Sinon, l'ajouter
    const success = musicStore.addTrackToPlaylist(trackToAdd.value.id, playlist.id);
    if (success) {
      emit('added', { 
        action: 'added', 
        playlist: playlist.name, 
        track: trackToAdd.value.title 
      });
    }
  }
};

const createAndAdd = () => {
  if (!newPlaylistName.value.trim() || !trackToAdd.value) return;
  
  const newPlaylist = musicStore.createPlaylist(newPlaylistName.value.trim());
  if (newPlaylist) {
    const success = musicStore.addTrackToPlaylist(trackToAdd.value.id, newPlaylist.id);
    if (success) {
      emit('added', { 
        action: 'created', 
        playlist: newPlaylist.name, 
        track: trackToAdd.value.title 
      });
      
      // Reset
      newPlaylistName.value = '';
      showCreateNew.value = false;
    }
  }
};

const close = () => {
  showCreateNew.value = false;
  newPlaylistName.value = '';
  emit('close');
};

// Watchers
watch(() => props.isVisible, (visible) => {
  if (!visible) {
    showCreateNew.value = false;
    newPlaylistName.value = '';
  }
});
</script>

<style scoped>
.scrollBar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.scrollBar::-webkit-scrollbar {
  width: 6px;
}

.scrollBar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollBar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
</style>