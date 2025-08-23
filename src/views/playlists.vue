<template>
  <div class="text-white w-full h-full p-2">
    <div class="flex flex-col space-y-4 w-full h-full p-3">
      <!-- En-tête avec bouton créer playlist -->
      <div class="flex items-center justify-between">
        <h1 class="text-4xl font-semibold">Playlists</h1>
        <button 
          @click="showCreateModal = true"
          class="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 px-3.5 py-1.5 text-sm rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Nouvelle Playlist</span>
        </button>
      </div>

      <!-- Statistiques -->
      <div class="flex flex-wrap gap-4">
        <div class="flex gap-2 md:block lg:gap-0 bg-white/10 rounded-lg p-1 px-2 md:p-3">
          <h3 class="text-xs md:text-sm font-medium">Total Playlists</h3>
          <p class="text-xs md:text-xl text-cyan-400">{{ playlistStats.totalPlaylists }}</p>
        </div>
        <div class="flex gap-2 md:block lg:gap-0 bg-white/10 rounded-lg p-1 md:p-3">
          <h3 class="text-xs md:text-sm font-medium">Mes Playlists</h3>
          <p class="text-xs md:text-xl text-cyan-400">{{ playlistStats.userPlaylists }}</p>
        </div>
        <div class="flex gap-2 md:block lg:gap-0 bg-white/10 rounded-lg p-1 md:p-3">
          <h3 class="text-xs md:text-sm font-medium">Total Musiques</h3>
          <p class="text-xs md:text-xl text-cyan-400">{{ playlistStats.totalTracksInPlaylists }}</p>
        </div>
        <div class="flex gap-2 md:block lg:gap-0 bg-white/10 rounded-lg p-1 md:p-3">
          <h3 class="text-xs md:text-sm font-medium">Durée Totale</h3>
          <p class="text-xs md:text-xl text-cyan-400">{{ formatDuration(playlistStats.totalDuration) }}</p>
        </div>
      </div>

      <!-- Liste des playlists -->
      <div class="flex-1 overflow-auto scrollBar">
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <!-- Playlist card -->
          <div 
            v-for="playlist in allPlaylists" 
            :key="playlist.id"
            @click="openPlaylist(playlist)"
            class="bg-white/10 rounded-lg p-2 cursor-pointer hover:bg-white/20 transition-all duration-200 group relative"
          >
            <!-- Menu contexte -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-99">
              <button 
                @click.stop="togglePlaylistMenu(playlist.id)"
                class="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5">
                  <path d="M4 8C4 9.10457 3.10457 10 2 10C0.895431 10 0 9.10457 0 8C0 6.89543 0.895431 6 2 6C3.10457 6 4 6.89543 4 8Z" fill="currentColor"/>
                  <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z" fill="currentColor"/>
                  <path d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" fill="currentColor"/>
                </svg>
              </button>
              
              <!-- Menu déroulant -->
              <div 
                v-if="activePlaylistMenu === playlist.id" 
                class="absolute top-8 right-0 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg py-1 min-w-48 z-10"
                @click.stop
              >
                <button 
                  @click="playPlaylist(playlist)"
                  class="w-full text-left px-3 py-1 text-sm hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                  </svg>
                  <span>Lire</span>
                </button>
                
                <button 
                  v-if="!playlist.isDefault"
                  @click="startRename(playlist)"
                  class="w-full text-left px-3 py-1 text-sm hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  <span>Renommer</span>
                </button>
                
                <button 
                  @click="duplicatePlaylist(playlist)"
                  class="w-full text-left px-3 py-1 text-sm hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                  <span>Dupliquer</span>
                </button>
                
                <button 
                  @click="clearPlaylist(playlist)"
                  class="w-full text-left px-3 py-1 text-sm hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Vider</span>
                </button>
                
                <div v-if="!playlist.isDefault" class="border-t border-white/20 my-1"></div>
                
                <button 
                  v-if="!playlist.isDefault"
                  @click="confirmDelete(playlist)"
                  class="w-full text-left px-3 py-1 text-sm hover:bg-red-500/20 text-red-400 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  <span>Supprimer</span>
                </button>
              </div>
            </div>

            <!-- Image de couverture -->
            <div class="w-full aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-white/50">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
              </svg>
            </div>

            <!-- Informations de la playlist -->
            <div class="space-y-1">
              <h3 class="font-medium text-lg truncate">{{ playlist.name }}</h3>
              <p class="text-sm text-white/70 line-clamp-2">{{ playlist.description || 'Aucune description' }}</p>
              
              <div class="flex items-center justify-between text-[10px] text-white/50">
                <span>{{ playlist.trackCount }} musique(s)</span>
                <span>{{ formatDuration(playlist.duration) }}</span>
              </div>
              
              <div class="text-[10px] text-white/40">
                Modifiée {{ formatDate(playlist.dateModified) }}
              </div>
            </div>

            <!-- Badge pour playlists par défaut -->
            <div v-if="playlist.isDefault" class="absolute top-2 left-2">
              <span class="bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded text-xs">
                Système
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de playlist -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreateModal = false">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Créer une nouvelle playlist</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nom de la playlist</label>
            <input 
              v-model="newPlaylistName"
              type="text" 
              placeholder="Ma super playlist"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              @keyup.enter="createPlaylist"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Description (optionnel)</label>
            <textarea 
              v-model="newPlaylistDescription"
              placeholder="Description de votre playlist..."
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 resize-none"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="createPlaylist"
            :disabled="!newPlaylistName.trim()"
            class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de renommage -->
    <div v-if="showRenameModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showRenameModal = false">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Renommer la playlist</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nouveau nom</label>
            <input 
              v-model="renamePlaylistName"
              type="text" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
              @keyup.enter="confirmRename"
            />
          </div>
        </div>
        
        <div class="flex justify-end text-sm space-x-3 mt-6">
          <button 
            @click="showRenameModal = false"
            class="px-2 py-1 text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="confirmRename"
            :disabled="!renamePlaylistName.trim()"
            class="px-2 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Renommer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showDeleteModal = false">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4 text-red-400">Supprimer la playlist</h2>
        <p class="text-gray-300 mb-6">
          Êtes-vous sûr de vouloir supprimer la playlist "<strong>{{ playlistToDelete?.name }}</strong>" ? 
          Cette action est irréversible.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="confirmDeletePlaylist"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMusicStore } from '@/assets/script';

const router = useRouter();
const musicStore = useMusicStore();

// État local
const activePlaylistMenu = ref(null);
const showCreateModal = ref(false);
const showRenameModal = ref(false);
const showDeleteModal = ref(false);
const newPlaylistName = ref('');
const newPlaylistDescription = ref('');
const renamePlaylistName = ref('');
const renamePlaylistId = ref('');
const playlistToDelete = ref(null);

// Computed
const allPlaylists = computed(() => musicStore.playlists);
const playlistStats = computed(() => musicStore.getPlaylistStats);

// Actions
const togglePlaylistMenu = (playlistId) => {
  activePlaylistMenu.value = activePlaylistMenu.value === playlistId ? null : playlistId;
};

const createPlaylist = () => {
  if (!newPlaylistName.value.trim()) return;
  
  musicStore.createPlaylist(newPlaylistName.value, newPlaylistDescription.value);
  
  // Reset
  newPlaylistName.value = '';
  newPlaylistDescription.value = '';
  showCreateModal.value = false;
};

const startRename = (playlist) => {
  renamePlaylistId.value = playlist.id;
  renamePlaylistName.value = playlist.name;
  showRenameModal.value = true;
  activePlaylistMenu.value = null;
};

const confirmRename = () => {
  if (!renamePlaylistName.value.trim()) return;
  
  musicStore.renamePlaylist(renamePlaylistId.value, renamePlaylistName.value);
  
  showRenameModal.value = false;
  renamePlaylistId.value = '';
  renamePlaylistName.value = '';
};

const duplicatePlaylist = (playlist) => {
  musicStore.duplicatePlaylist(playlist.id);
  activePlaylistMenu.value = null;
};

const clearPlaylist = (playlist) => {
  if (confirm(`Vider la playlist "${playlist.name}" ? Toutes les musiques seront supprimées.`)) {
    musicStore.clearPlaylist(playlist.id);
  }
  activePlaylistMenu.value = null;
};

const confirmDelete = (playlist) => {
  playlistToDelete.value = playlist;
  showDeleteModal.value = true;
  activePlaylistMenu.value = null;
};

const confirmDeletePlaylist = () => {
  if (playlistToDelete.value) {
    musicStore.deletePlaylist(playlistToDelete.value.id);
  }
  
  showDeleteModal.value = false;
  playlistToDelete.value = null;
};

const playPlaylist = (playlist) => {
  if (playlist.tracks.length === 0) {
    alert('Cette playlist est vide.');
    return;
  }
  
  musicStore.playPlaylist(playlist.id);
  activePlaylistMenu.value = null;
};

const openPlaylist = (playlist) => {
  // Navigation vers la vue détail de la playlist
  router.push(`/playlist/${playlist.id}`);
};

// Utilitaires
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const formatDate = (date) => {
  const now = new Date();
  const diffTime = now - new Date(date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Aujourd\'hui';
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  
  return new Date(date).toLocaleDateString('fr-FR');
};

// Fermer les menus en cliquant ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    activePlaylistMenu.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Charger les playlists sauvegardées
  musicStore.loadPlaylistsFromStorage();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>