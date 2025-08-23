<template>
    <div class="text-white w-full h-full p-2">
        <div class="flex flex-col space-y-4 w-full h-full p-3">
          <div class="flex items-center justify-between">
            <h1 class="text-4xl font-semibold">Songs</h1>

            <div class="flex items-center space-x-4">
              <!-- Filtre par favoris -->
              <button 
                @click="toggleFavoritesFilter"
                :class="`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showOnlyFavorites ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-black/10 border border-white/20 hover:bg-white/10'
                }`"
              >
                <svg xmlns="http://www.w3.org/2000/svg" :fill="showOnlyFavorites ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span>{{ showOnlyFavorites ? 'Tous' : 'Favoris' }}</span>
              </button>

              <!-- Menu de tri -->
              <div class="relative w-fit">
                <div @click="()=>{showOrderOptions = !showOrderOptions}" class="flex space-x-2 justify-center items-center text-sm bg-black/10 rounded-lg p-2 px-4 border border-white/20 text-white backdrop-blur-sm cursor-pointer">
                  <span>Trier par</span>
                  <span class="flex">
                    <svg v-if="!showOrderOptions" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
    
                    <svg v-if="showOrderOptions" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                  </span>
                </div>

                <div v-if="showOrderOptions" class="absolute bottom-0 left-0 translate-y-[102%] flex flex-col w-full bg-black/70 rounded-lg border border-white/20 text-white text-[0.8em] backdrop-blur-sm overflow-hidden z-10">
                  <span @click="()=>{activeSens = 'croissant', orderSongBy(), showOrderOptions = false}" class="flex justify-between items-center border-b border-white/20 p-1 px-3 cursor-pointer hover:bg-white/10">
                    <p>Croissant</p>
                    <svg v-if="activeSens == 'croissant'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                      <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                    </svg>
                  </span>
                  <span @click="()=>{activeSens = 'decroissant', orderSongBy(), showOrderOptions = false}" class="flex justify-between items-center border-b border-white/20 p-1 px-3 cursor-pointer hover:bg-white/10">
                    <p>Décroissant</p>
                    <svg v-if="activeSens == 'decroissant'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                      <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                    </svg>
                  </span>
                  <span @click="orderSongBy('song')" class="flex justify-between items-center border-b border-white/20 p-1 px-3 cursor-pointer hover:bg-white/10">
                    <p>Titre</p>
                    <svg v-if="activeOrder == 'song'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                      <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                    </svg>
                  </span>
                  <span @click="orderSongBy('artist')" class="flex justify-between items-center p-1 px-3 cursor-pointer hover:bg-white/10">
                    <p>Artiste</p>
                    <svg v-if="activeOrder == 'artist'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                      <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex w-full py-4 overflow-scroll scrollBar p-2">
            <div class="flex flex-col w-full space-y-1">
              <div v-for="(track, index) in displayedTracks" 
                :key="track.id || index"
                @click="playTrack(index)" 
                :class="`w-full ${index%2 == 0 ? `bg-white/10` : `bg-transparent`} ${isActiveTrack(track) ? 'bg-cyan-500/20 border border-cyan-500/30' : ''} p-1 px-2 rounded-md cursor-pointer hover:bg-white/20 transition-colors group`"
              >
              
                <div v-if="track != undefined" class="flex space-x-2 items-center justify-between text-[0.76em] font-light">
                  <div class="flex w-[25%] space-x-2 items-center justify-start text-truncate">
                    <p class="flex flex-shrink-0 w-8 justify-center">
                      {{ isActiveTrack(track) && !isPlaying ? '⏸️' : getTrackNumber(track, index) }}
                    </p>
                    
                    <div class="flex flex-shrink-0 w-11 h-11 bg-black rounded-md overflow-hidden">
                        <img v-if="track.cover != undefined" class="w-full h-full object-cover" :src="track.cover" alt="">
                    </div>
                    
                    <!-- Indicateur de lecture -->
                    <span v-if="isActiveTrack(track)" class="text-cyan-500 flex-shrink-0">
                      <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="size-7 animate-pulse" style="shape-rendering: auto; display: block; background: transparent;">
                        <g>
                          <rect fill="currentColor" height="40" width="14" y="30" x="18">
                            <animate begin="-0.18181818181818182s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="16;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="y"></animate>
                            <animate begin="-0.18181818181818182s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="68;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="height"></animate>
                          </rect>
                          <rect fill="currentColor" height="40" width="14" y="30" x="43">
                            <animate begin="-0.09090909090909091s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="19.499999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="y"></animate>
                            <animate begin="-0.09090909090909091s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="61.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="height"></animate>
                          </rect>
                          <rect fill="currentColor" height="40" width="14" y="30" x="68">
                            <animate keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="19.499999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="y"></animate>
                            <animate keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="61.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="height"></animate>
                          </rect>
                        </g>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-7">
                        <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
                      </svg>
                    </span>
                      
                    <!-- Bouton favoris -->
                    <button 
                      @click.stop="toggleFavorite(track)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                    >
                      <svg 
                        v-if="isTrackFavorite(track.id)" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        class="w-4 h-4 text-red-500"
                      >
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                      </svg>
                      <svg 
                        v-else 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke-width="1.5" 
                        stroke="currentColor" 
                        class="w-4 h-4 text-white/60 hover:text-red-400"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </button>
                    
                    <div class="flex flex-col min-w-0 flex-1">
                      <p class="flex font-medium truncate" :class="isActiveTrack(track) ? 'text-cyan-400' : 'text-white'">
                        {{ track.title }}
                      </p>
                      <!-- Barre de progression pour la musique active -->
                      <div v-if="isActiveTrack(track)" class="w-full bg-white/20 rounded-full h-1 mt-1">
                        <div 
                          class="bg-cyan-500 h-full rounded-full transition-all duration-300"
                          :style="{ width: progressPercentage + '%' }"
                        ></div>
                      </div>
                    </div>
                </div>
                
                <div class="flex text-white/50 w-[25%] justify-center items-center text-truncate">
                  <p class="flex truncate" :class="isActiveTrack(track) ? 'text-cyan-300' : 'text-white/50'">{{ track.artist }}</p>
                </div>

                <div class="flex text-white/50 w-[25%] justify-center items-center text-truncate">
                  <p class="flex truncate" :class="isActiveTrack(track) ? 'text-cyan-300' : 'text-white/50'">{{ track.album }}</p>
                </div>

                <div class="flex w-[12.5%] justify-end items-center">
                    <p class="flex text-white/50"> 
                      {{ isActiveTrack(track) ? formattedTime.currentTime + ' / ' + formattedTime.totalTime : formatDuration(track.duration || 0) }}
                    </p>
                  </div>

                  <div class="flex w-[12.5%] justify-end items-center">
                      <div class="relative">
                        <button 
                          @click="(e)=>{e.stopPropagation(), toggleTrackMenu(track.id)}" 
                          class="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                        >
                          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4">
                            <path d="M4 8C4 9.10457 3.10457 10 2 10C0.895431 10 0 9.10457 0 8C0 6.89543 0.895431 6 2 6C3.10457 6 4 6.89543 4 8Z" fill="currentColor"/>
                            <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z" fill="currentColor"/>
                            <path d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" fill="currentColor"/>
                          </svg>
                        </button>

                        <!-- Menu de la musique -->
                        <div 
                          v-if="activeTrackMenu === track.id" 
                          class="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg py-1 min-w-48 z-99"
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
                            @click="openPlaylistModal(track)"
                            class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                            <span>Ajouter à une playlist</span>
                          </button>

                          <button 
                            @click="toggleFavoriteFromMenu(track)"
                            class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                          >
                            <svg 
                              v-if="!isTrackFavorite(track.id)" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke-width="1.5" 
                              stroke="currentColor" 
                              class="w-4 h-4"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                            <svg 
                              v-else 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="currentColor" 
                              class="w-4 h-4 text-red-500"
                            >
                              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                            </svg>
                            <span>{{ isTrackFavorite(track.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}</span>
                          </button>

                          <div class="border-t border-white/20 my-1"></div>

                          <!-- Playlists contenant cette musique -->
                          <div v-if="getTrackPlaylists(track.id).length > 0" class="px-3 py-1">
                            <p class="text-xs text-white/50 mb-1">Dans les playlists :</p>
                            <div class="space-y-1">
                              <div 
                                v-for="playlist in getTrackPlaylists(track.id).slice(0, 3)" 
                                :key="playlist.id"
                                class="text-xs text-cyan-400 truncate"
                              >
                                {{ playlist.name }}
                              </div>
                              <div v-if="getTrackPlaylists(track.id).length > 3" class="text-xs text-white/40">
                                +{{ getTrackPlaylists(track.id).length - 3 }} autre(s)
                              </div>
                            </div>
                          </div>

                          <button 
                            @click="showTrackDetails(track)"
                            class="w-full text-left px-3 py-1 hover:bg-white/10 transition-colors flex items-center space-x-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                            <span>Détails</span>
                          </button>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Toast de notification -->
        <div v-if="showToast" class="fixed bottom-20 right-4 bg-gray-800 border border-white/20 rounded-lg p-3 z-50 animate-slide-up">
          <p class="text-sm text-white">{{ toastMessage }}</p>
        </div>

        <!-- Modal d'ajout à une playlist -->
        <AddToPlaylistModal 
          :track="selectedTrack"
          :isVisible="showPlaylistModal"
          @close="showPlaylistModal = false"
          @added="handlePlaylistAction"
        />

        <!-- Modal de détails de la musique -->
        <div v-if="showDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showDetailsModal = false">
          <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 class="text-xl font-semibold mb-4">Détails de la musique</h2>
            
            <div v-if="selectedTrack" class="space-y-4">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <img v-if="selectedTrack.cover" :src="selectedTrack.cover" :alt="selectedTrack.title" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold truncate">{{ selectedTrack.title }}</h3>
                  <p class="text-white/70 truncate">{{ selectedTrack.artist }}</p>
                  <p class="text-sm text-white/50 truncate">{{ selectedTrack.album }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-white/50">Durée</p>
                  <p>{{ formatDuration(selectedTrack.duration || 0) }}</p>
                </div>
                <div>
                  <p class="text-white/50">Année</p>
                  <p>{{ selectedTrack.year || 'Inconnue' }}</p>
                </div>
                <div>
                  <p class="text-white/50">Playlists</p>
                  <p>{{ getTrackPlaylists(selectedTrack.id).length }}</p>
                </div>
                <div>
                  <p class="text-white/50">Favoris</p>
                  <p>{{ isTrackFavorite(selectedTrack.id) ? 'Oui' : 'Non' }}</p>
                </div>
              </div>

              <div v-if="getTrackPlaylists(selectedTrack.id).length > 0">
                <p class="text-white/50 text-sm mb-2">Présente dans :</p>
                <div class="space-y-1 max-h-32 overflow-auto scrollBar">
                  <div 
                    v-for="playlist in getTrackPlaylists(selectedTrack.id)" 
                    :key="playlist.id"
                    class="text-sm text-cyan-400 bg-white/5 rounded px-2 py-1"
                  >
                    {{ playlist.name }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button 
                @click="showDetailsModal = false"
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { useMusicStore } from '@/assets/script';
import AddToPlaylistModal from '../components/AddToPlaylistModal.vue';

const showOrderOptions = ref(false);
const showOnlyFavorites = ref(false);
const activeTrackMenu = ref(null);
const showPlaylistModal = ref(false);
const showDetailsModal = ref(false);
const selectedTrack = ref(null);
const showToast = ref(false);
const toastMessage = ref('');

const musicStore = useMusicStore();
const tracksList = ref([]);

// Computed properties
const isPlaying = computed(() => musicStore.playbackState.isPlaying);
const progressPercentage = computed(() => musicStore.getProgressPercentage);
const formattedTime = computed(() => musicStore.getFormattedState);

const displayedTracks = computed(() => {
  if (showOnlyFavorites.value) {
    const favorites = musicStore.getPlaylistById('favorites');
    return favorites ? favorites.tracks : [];
  }
  return tracksList.value;
});

// Fonctions
const isActiveTrack = (track) => musicStore.isActiveTrack(track);
const isTrackFavorite = (trackId) => musicStore.isTrackFavorite(trackId);

const getTrackPlaylists = (trackId) => {
  return musicStore.getPlaylistsWithTrack(trackId);
};

const getTrackNumber = (track, index) => {
  return showOnlyFavorites.value ? 
    musicStore.getPlaylistById('favorites')?.tracks.findIndex(t => t.id === track.id) + 1 || index + 1 :
    index + 1;
};

const playTrack = (index) => {
  const tracks = displayedTracks.value;
  if (isActiveTrack(tracks[index])) {
    musicStore.togglePlay();
  } else {
    musicStore.playTrack(tracks, index);
  }
};

const toggleTrackMenu = (trackId) => {
  activeTrackMenu.value = activeTrackMenu.value === trackId ? null : trackId;
};

const toggleFavorite = (track) => {
  musicStore.toggleFavorite(track.id);
  showToast.value = true;
  toastMessage.value = isTrackFavorite(track.id) ? 
    `"${track.title}" ajouté aux favoris` : 
    `"${track.title}" retiré des favoris`;
  
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const toggleFavoriteFromMenu = (track) => {
  toggleFavorite(track);
  activeTrackMenu.value = null;
};

const toggleFavoritesFilter = () => {
  showOnlyFavorites.value = !showOnlyFavorites.value;
};

const addToQueue = (track) => {
  musicStore.addToQueue(track);
  activeTrackMenu.value = null;
  showToast.value = true;
  toastMessage.value = `"${track.title}" ajouté à la file d'attente`;
  setTimeout(() => showToast.value = false, 3000);
};

const openPlaylistModal = (track) => {
  selectedTrack.value = track;
  showPlaylistModal.value = true;
  activeTrackMenu.value = null;
};

const showTrackDetails = (track) => {
  selectedTrack.value = track;
  showDetailsModal.value = true;
  activeTrackMenu.value = null;
};

const handlePlaylistAction = (data) => {
  showToast.value = true;
  if (data.action === 'added') {
    toastMessage.value = `"${data.track}" ajouté à "${data.playlist}"`;
  } else if (data.action === 'removed') {
    toastMessage.value = `"${data.track}" retiré de "${data.playlist}"`;
  } else if (data.action === 'created') {
    toastMessage.value = `"${data.track}" ajouté à la nouvelle playlist "${data.playlist}"`;
  }
  
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// Tri des musiques
const activeOrder = ref("song");
const activeSens = ref("croissant");

const orderSongBy = (option) => {
  if (option) activeOrder.value = option;
  
  if (activeOrder.value == "song") {
    if (activeSens.value == "croissant") {
      tracksList.value = tracksList.value.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      tracksList.value = tracksList.value.sort((a, b) => b.title.localeCompare(a.title));
    }
  } else if (activeOrder.value == "artist") {
    if (activeSens.value == "croissant") {
      tracksList.value = tracksList.value.sort((a, b) => a.artist.localeCompare(b.artist));
    } else {
      tracksList.value = tracksList.value.sort((a, b) => b.artist.localeCompare(a.artist));
    }
  }
  showOrderOptions.value = false;
};

// Utilitaires
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Fermer les menus en cliquant ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showOrderOptions.value = false;
    activeTrackMenu.value = null;
  }
};

onMounted(async () => {
  tracksList.value = musicStore.tracks;
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>