<template>
  <div v-if="playlist" class="text-white h-full p-2">
    <span @click="$router.push('/playlists')" class="group absolute top-2 left-2 bg-black/20 rounded-lg p-2 border border-white/20 text-white backdrop-blur-sm z-10 cursor-pointer transition-all">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3 group-hover:size-4 transition-all">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
    </span>

    <div class="flex flex-col space-y-6 w-full h-full p-3">
      <!-- En-tête de la playlist -->
      <div class="flex flex-wrap items-end gap-6">
        <!-- Image de couverture -->
        <div class="w-48 h-48 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-white/50">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
          </svg>
        </div>

        <!-- Informations de la playlist -->
        <div class="flex-1 space-y-4">
          <div>
            <p class="text-sm text-white/70 uppercase tracking-wide">Playlist</p>
            <h1 class="text-4xl font-bold mb-2">{{ playlist.name }}</h1>
            <p v-if="playlist.description" class="text-lg text-white/80">{{ playlist.description }}</p>
          </div>

          <div class="flex items-center space-x-4 text-sm text-white/60">
            <span>{{ playlist.trackCount }} musique{{ playlist.trackCount > 1 ? 's' : '' }}</span>
            <span>•</span>
            <span>{{ formatDuration(playlist.duration) }}</span>
            <span>•</span>
            <span>Créée {{ formatDate(playlist.dateCreated) }}</span>
          </div>

          <!-- Actions principales -->
          <div class="flex items-center space-x-4">
            <button 
              @click="playPlaylist"
              :disabled="playlist.tracks.length === 0"
              :class="`flex space-x-1 items-center justify-center bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed text-[0.7em] p-1 px-6 transition-all rounded-md cursor-pointer`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
              <span>Lire</span>
            </button>

            <button 
              @click="shufflePlaylist"
              :disabled="playlist.tracks.length === 0"
              class="flex space-x-1 items-center justify-center bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-[0.7em] p-1 px-6 transition-all rounded-md cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4">
                <path d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Aléatoire</span>
            </button>

            <!-- Menu actions -->
            <div class="relative">
              <button 
                @click="showActions = !showActions"
                class="bg-white/10 hover:bg-white/20 p-1 rounded-md transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5">
                  <path d="M4 8C4 9.10457 3.10457 10 2 10C0.895431 10 0 9.10457 0 8C0 6.89543 0.895431 6 2 6C3.10457 6 4 6.89543 4 8Z" fill="currentColor"/>
                  <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z" fill="currentColor"/>
                  <path d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" fill="currentColor"/>
                </svg>
              </button>

              <div 
                v-if="showActions" 
                class="absolute top-8 right-0 bg-black/90 backdrop-blur-sm border border-white/20 text-xs rounded-lg py-1 min-w-48 z-10"
              >
                <button 
                  v-if="!playlist.isDefault"
                  @click="startEditPlaylist"
                  class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  <span>Modifier les détails</span>
                </button>

                <button 
                  @click="addMusicToPlaylist"
                  class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Ajouter des musiques</span>
                </button>

                <button 
                  @click="duplicatePlaylist"
                  class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                  <span>Dupliquer</span>
                </button>

                <div class="border-t border-white/20 my-1"></div>

                <button 
                  @click="clearPlaylist"
                  class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Vider la playlist</span>
                </button>

                <button 
                  v-if="!playlist.isDefault"
                  @click="deletePlaylist"
                  class="w-full text-left px-3 py-2 hover:bg-red-500/20 text-red-400 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  <span>Supprimer la playlist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des musiques -->
      <div class="flex-1 overflow-auto p-1 scrollBar">
        <div v-if="playlist.tracks.length === 0" class="text-center py-12">
          <div class="text-white/80 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
            </svg>
            <h3 class="text-xl font-semibold mb-2">Cette playlist est vide</h3>
            <p class="text-white/40 mb-4">Commencez par ajouter des musiques à votre playlist</p>
            <button 
              @click="addMusicToPlaylist"
              class="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Ajouter des musiques
            </button>
          </div>
        </div>

        <div v-else class="space-y-1">
          <!-- En-tête des colonnes -->
          <div class="flex items-center space-x-4 px-4 py-1 text-white/60 text-sm border-b border-white/10 mb-2">
            <div class="w-8">#</div>
            <div class="flex-1">Titre</div>
            <div class="w-48">Album</div>
            <div class="w-32">Ajoutée le</div>
            <div class="w-16">Durée</div>
            <div class="w-8"></div>
          </div>

          <!-- Musiques -->
          <div 
            v-for="(track, index) in playlist.tracks" 
            :key="track.id"
            @click="playTrack(index)"
            :class="`flex items-center space-x-4 px-4 py-1 rounded-lg cursor-pointer transition-all group text-[0.76em] font-light ${
              isActiveTrack(track) ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-white/10'
            }`"
          >
            <!-- Numéro / Icône de lecture -->
            <div class="w-8 flex justify-center">
              <span v-if="!isActiveTrack(track)" class="group-hover:hidden text-white/60">{{ index + 1 }}</span>
              <svg v-if="!isActiveTrack(track)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 hidden group-hover:block">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
              
              <!-- Indicateur de lecture actuelle -->
              <div v-if="isActiveTrack(track)" class="text-cyan-500">
                <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-4 h-4 animate-pulse">
                  <rect fill="currentColor" height="40" width="14" y="30" x="18">
                    <animate values="16;30;30" keyTimes="0;0.5;1" dur="0.9s" repeatCount="indefinite" attributeName="y"></animate>
                    <animate values="68;40;40" keyTimes="0;0.5;1" dur="0.9s" repeatCount="indefinite" attributeName="height"></animate>
                  </rect>
                  <rect fill="currentColor" height="40" width="14" y="30" x="43">
                    <animate values="19.5;30;30" keyTimes="0;0.5;1" dur="0.9s" repeatCount="indefinite" attributeName="y"></animate>
                    <animate values="61;40;40" keyTimes="0;0.5;1" dur="0.9s" repeatCount="indefinite" attributeName="height"></animate>
                  </rect>
                  <rect fill="currentColor" height="40" width="14" y="30" x="68">
                    <animate values="19.5;30;30" keyTimes="0;0.5;1" dur="0.9s" repeatCount="indefinite" attributeName="y"></animate>
                    <animate values="61;40;40" keyTimes="0;0.5;1" dur="0.9s" repeatCount="indefinite" attributeName="height"></animate>
                  </rect>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Informations de la musique -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                  <img v-if="track.cover" :src="track.cover" :alt="track.title" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0 flex-1">
                  <p :class="`font-semibold truncate ${isActiveTrack(track) ? 'text-cyan-400' : 'text-white'}`">
                    {{ track.title }}
                  </p>
                  <p class="text-sm text-white/60 truncate">{{ track.artist }}</p>
                </div>
              </div>
            </div>

            <!-- Album -->
            <div class="w-48 text-white/60 truncate">{{ track.album }}</div>

            <!-- Date d'ajout -->
            <div class="w-32 text-white/60">{{ formatDate(track.dateAdded) }}</div>

            <!-- Durée -->
            <div class="w-16 text-white/60">{{ formatDuration(track.duration || 0) }}</div>

            <!-- Actions sur la musique -->
            <div class="w-8">
              <div class="relative">
                <button 
                  @click.stop="toggleTrackMenu(track.id)"
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                >
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4">
                    <path d="M4 8C4 9.10457 3.10457 10 2 10C0.895431 10 0 9.10457 0 8C0 6.89543 0.895431 6 2 6C3.10457 6 4 6.89543 4 8Z" fill="currentColor"/>
                    <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z" fill="currentColor"/>
                    <path d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" fill="currentColor"/>
                  </svg>
                </button>

                <!-- Menu de la musique -->
                <div 
                  v-if="activeTrackMenu === track.id" 
                  class="absolute top-6 right-0 bg-black/90 backdrop-blur-sm border border-white/20 text-xs rounded-lg py-1 min-w-48 z-10"
                  @click.stop
                >
                  <button 
                    @click="addToQueue(track)"
                    class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Ajouter à la file</span>
                  </button>

                  <button 
                    @click="toggleFavorite(track)"
                    class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <svg v-if="!isTrackFavorite(track.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-red-500">
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                    <span>{{ isTrackFavorite(track.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}</span>
                  </button>

                  <div class="border-t border-white/20 my-1"></div>

                  <button 
                    @click="removeFromPlaylist(track)"
                    class="w-full text-left px-3 py-1 hover:bg-red-500/20 text-red-400 transition-colors flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Supprimer de cette playlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition de playlist -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Modifier la playlist</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block font-medium mb-2">Nom</label>
            <input 
              v-model="editName"
              type="text" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea 
              v-model="editDescription"
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 resize-none"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="showEditModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="savePlaylistEdit"
            class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de musiques -->
    <div v-if="showAddMusicModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2" @click.self="showAddMusicModal = false">
      <div class="bg-gray-800 rounded-lg p-4 max-w-2xl w-[80%] max-h-[90%] flex flex-col">
        <h2 class="text-xl font-semibold mb-4">Ajouter des musiques à "{{ playlist.name }}"</h2>
        
        <!-- Barre de recherche -->
        <div class="mb-4">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher des musiques..."
            class="w-full h-8 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <!-- Liste des musiques disponibles -->
        <div class="flex-1 overflow-auto scrollBar space-y-1">
          <div 
            v-for="track in filteredAvailableTracks" 
            :key="track.id"
            class="flex items-center justify-between p-1 px-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-10 h-10 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                <img v-if="track.cover" :src="track.cover" :alt="track.title" class="w-full h-full object-cover">
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium truncate">{{ track.title }}</p>
                <p class="text-xs text-white/60 truncate">{{ track.artist }}</p>
              </div>
            </div>
            
            <button 
              @click="addTrackToPlaylist(track)"
              :disabled="isTrackInCurrentPlaylist(track.id)"
              :class="`p-1 text-sm rounded-lg transition-colors ${
                isTrackInCurrentPlaylist(track.id) 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-cyan-500 hover:bg-cyan-600'
              }`"
            >
              <!-- {{ isTrackInCurrentPlaylist(track.id) ? 'Déjà ajoutée' : 'Ajouter' }} -->
              <svg v-if="!isTrackInCurrentPlaylist(track.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>

              <svg v-if="isTrackInCurrentPlaylist(track.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>



            </button>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-4">
          <button 
            @click="showAddMusicModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Message si playlist non trouvée -->
  <div v-else class="text-white w-full h-full flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-2xl font-semibold mb-2">Playlist non trouvée</h2>
      <p class="text-white/60 mb-4">Cette playlist n'existe pas ou a été supprimée.</p>
      <button 
        @click="$router.push('/playlists')"
        class="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg transition-colors"
      >
        Retour aux playlists
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMusicStore } from '../../assets/script';

const route = useRoute();
const router = useRouter();
const musicStore = useMusicStore();

// État local
const showActions = ref(false);
const showEditModal = ref(false);
const showAddMusicModal = ref(false);
const activeTrackMenu = ref(null);
const editName = ref('');
const editDescription = ref('');
const searchQuery = ref('');

// Computed
const playlist = computed(() => 
  musicStore.getPlaylistById(route.params.id)
);

const isPlaying = computed(() => musicStore.playbackState.isPlaying);

const isActiveTrack = (track) => musicStore.isActiveTrack(track);

const isTrackFavorite = (trackId) => musicStore.isTrackFavorite(trackId);

const filteredAvailableTracks = computed(() => {
  if (!searchQuery.value) return musicStore.tracks;
  
  const query = searchQuery.value.toLowerCase();
  return musicStore.tracks.filter(track => 
    track.title.toLowerCase().includes(query) ||
    track.artist.toLowerCase().includes(query) ||
    track.album.toLowerCase().includes(query)
  );
});

const isTrackInCurrentPlaylist = (trackId) => {
  return playlist.value?.tracks.some(track => track.id === trackId) || false;
};

// Actions
const playPlaylist = () => {
  if (playlist.value && playlist.value.tracks.length > 0) {
    musicStore.playPlaylist(playlist.value.id);
  }
};

const shufflePlaylist = () => {
  if (playlist.value && playlist.value.tracks.length > 0) {
    musicStore.updatePlaybackOptions({ shuffle: true });
    musicStore.playPlaylist(playlist.value.id);
  }
};

const playTrack = (index) => {
  if (isActiveTrack(playlist.value.tracks[index])) {
    musicStore.togglePlay();
  } else {
    musicStore.playTrack(playlist.value.tracks, index, playlist.value.id);
  }
};

const startEditPlaylist = () => {
  if (playlist.value) {
    editName.value = playlist.value.name;
    editDescription.value = playlist.value.description || '';
    showEditModal.value = true;
  }
  showActions.value = false;
};

const savePlaylistEdit = () => {
  if (playlist.value && editName.value.trim()) {
    musicStore.renamePlaylist(playlist.value.id, editName.value.trim());
    musicStore.updatePlaylistDescription(playlist.value.id, editDescription.value.trim());
  }
  showEditModal.value = false;
};

const addMusicToPlaylist = () => {
  showAddMusicModal.value = true;
  showActions.value = false;
};

const addTrackToPlaylist = (track) => {
  if (playlist.value) {
    const success = musicStore.addTrackToPlaylist(track.id, playlist.value.id);
    if (success) {
      console.log(`${track.title} ajouté à ${playlist.value.name}`);
    }
  }
};

const removeFromPlaylist = (track) => {
  if (playlist.value && confirm(`Supprimer "${track.title}" de cette playlist ?`)) {
    musicStore.removeTrackFromPlaylist(track.id, playlist.value.id);
  }
  activeTrackMenu.value = null;
};

const toggleTrackMenu = (trackId) => {
  activeTrackMenu.value = activeTrackMenu.value === trackId ? null : trackId;
};

const addToQueue = (track) => {
  musicStore.addToQueue(track);
  activeTrackMenu.value = null;
};

const toggleFavorite = (track) => {
  musicStore.toggleFavorite(track.id);
  activeTrackMenu.value = null;
};

const duplicatePlaylist = () => {
  if (playlist.value) {
    const newPlaylist = musicStore.duplicatePlaylist(playlist.value.id);
    if (newPlaylist) {
      router.push(`/playlist/${newPlaylist.id}`);
    }
  }
  showActions.value = false;
};

const clearPlaylist = () => {
  if (playlist.value && confirm(`Vider la playlist "${playlist.value.name}" ? Toutes les musiques seront supprimées.`)) {
    musicStore.clearPlaylist(playlist.value.id);
  }
  showActions.value = false;
};

const deletePlaylist = () => {
  if (playlist.value && confirm(`Supprimer définitivement la playlist "${playlist.value.name}" ?`)) {
    const success = musicStore.deletePlaylist(playlist.value.id);
    if (success) {
      router.push('/playlists');
    }
  }
  showActions.value = false;
};

// Utilitaires
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (date) => {
  if (!date) return '';
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = now - targetDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Aujourd\'hui';
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `${diffDays} j`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`;
  
  return targetDate.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

// Fermer les menus en cliquant ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showActions.value = false;
    activeTrackMenu.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Surveiller les changements de route
watch(() => route.params.id, () => {
  showActions.value = false;
  activeTrackMenu.value = null;
});
</script>

<style scoped>
</style>