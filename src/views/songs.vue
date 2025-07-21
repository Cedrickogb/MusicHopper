<template>
    <div class="text-white w-full h-full p-2">
        <div class="flex flex-col space-y-4 w-full h-full p-3">
        <div>
          
        </div>
          <div class="flex items-center justify-between">
            <h1 class="text-4xl font-semibold">Songs</h1>

            <div class="relative w-fit">
              <div @click="()=>{showOrderOptions = !showOrderOptions}" class="flex space-x-2 justify-center items-center text-sm bg-black/10 rounded-lg p-2 px-4 border border-white/20 text-white backdrop-blur-sm">
                <span>Oder by</span>
                <span class="flex">
                  <svg v-if="!showOrderOptions" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
  
                  <svg v-if="showOrderOptions" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg>
                </span>
              </div>

              <div v-if="showOrderOptions" class="absolute bottom-0 left-0 translate-y-[102%] flex flex-col w-full bg-black/70 rounded-lg border border-white/20 text-white text-[0.8em] backdrop-blur-sm overflow-hidden">
                <span @click="()=>{activeSens = 'croissant', orderSongBy()}" class="flex justify-between items-center border-b border-white/20 p-1 px-3">
                  <p>Croissant</p>
                  <svg v-if="activeSens == 'croissant'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                    <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                  </svg>
                </span>
                <span @click="()=>{activeSens = 'decroissant', orderSongBy()}" class="flex justify-between items-center border-b border-white/20 p-1 px-3">
                  <p>Décroissant</p>
                  <svg v-if="activeSens == 'decroissant'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                    <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                  </svg>
                </span>
                <span @click="orderSongBy('song')" class="flex justify-between items-center border-b border-white/20 p-1 px-3">
                  <p>Song</p>
                  <svg v-if="activeOrder == 'song'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                    <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                  </svg>
                </span>
                <span @click="orderSongBy('artist')" class="flex justify-between items-center border-b border-white/20 p-1 px-3">
                  <p>Artist</p>
                  <svg v-if="activeOrder == 'artist'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3">
                    <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="white"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div class="flex w-full py-4 overflow-auto scrollBar p-2">
            <div class="flex flex-col w-full space-y-1">
              <div v-for="(track, index) in tracksList" @click="playTrack(tracksList, index, true)" :class="`w-full ${index%2 == 0 ? `bg-white/10` : `bg-transparent`} p-1 px-2 rounded-md cursor-pointer`">
                  <div v-if="track != undefined" class="flex space-x-2 items-center justify-between text-[0.76em]">
                      <div class="flex w-[25%] space-x-2 items-center justify-start text-truncate">
                          <p class="flex flex-shrink-0">{{ index }}</p>
                          <div class="flex flex-shrink-0 w-11 h-11 bg-black rounded-md overflow-hidden">
                              <img v-if="track.cover != undefined" class="w-full h-full" :src="track.cover" alt="">
                          </div>
                          <span v-if="globalActiveTrack.title == track.title && globalActiveTrack.artist == track.artist" class="text-cyan-600">
                            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="size-7" style="shape-rendering: auto; display: block; background: transparent;" xmlns:xlink="http://www.w3.org/1999/xlink">
                              <g>
                                <rect fill="currentColor" height="40" width="14" y="30" x="18">
                                  <animate v-if="globalActiveTrackIsPlaying" begin="-0.18181818181818182s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="16;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="y"></animate>
                                  <animate v-if="globalActiveTrackIsPlaying" begin="-0.18181818181818182s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="68;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="height"></animate>
                                </rect>
                                <rect fill="currentColor" height="40" width="14" y="30" x="43">
                                  <animate v-if="globalActiveTrackIsPlaying" begin="-0.09090909090909091s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="19.499999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="y"></animate>
                                  <animate v-if="globalActiveTrackIsPlaying" begin="-0.09090909090909091s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="61.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="height"></animate>
                                </rect>
                                <rect fill="currentColor" height="40" width="14" y="30" x="68">
                                  <animate v-if="globalActiveTrackIsPlaying" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="19.499999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="y"></animate>
                                  <animate v-if="globalActiveTrackIsPlaying" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="61.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="0.9090909090909091s" repeatCount="indefinite" attributeName="height"></animate>
                                </rect>
                                <g></g>
                              </g><!-- [ldio] generated by https://loading.io -->
                            </svg>
                          </span>
                          <p class="flex  font-semibold">{{ track.title }}</p>
                      </div>
                      
                      <div class="flex text-white/50 w-[25%] justify-center items-center text-truncate">
                        <p class="flex">{{ track.artist }}</p>
                      </div>

                      <div class="flex text-white/50 w-[25%] justify-center items-center text-truncate">
                        <p class="flex">{{ track.album }}</p>
                      </div>

                      <div class="flex w-[12.5%] justify-end items-center">
                          <p class="flex"> 0.00 </p>
                      </div>

                      <div class="flex w-[12.5%] justify-end items-center">
                          <button @click="()=>{console.log(track)}">
                            <svg  viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4" >
                              <path d="M4 8C4 9.10457 3.10457 10 2 10C0.895431 10 0 9.10457 0 8C0 6.89543 0.895431 6 2 6C3.10457 6 4 6.89543 4 8Z" fill="currentColor"/>
                              <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z" fill="currentColor"/>
                              <path d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" fill="currentColor"/>
                            </svg>
                          </button>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { parseBlob } from "music-metadata-browser";
import { useMusicStore } from '@/assets/script';

var showOrderOptions = ref(false)
const emit = defineEmits(["update-tracks"]);

const musicStore = useMusicStore();
var tracksList = ref([])

const loadTracks = (tracksTab, index) => {
  const newTracks = tracksTab;
  musicStore.setActiveTracks(newTracks);
  musicStore.setActiveTrackId(index);

  console.log(musicStore.activeTracks, "songs", musicStore.activeTrackId)
};
function playTrack(tracks, index){
  // emit("update-tracks", {tracks: tracksList.value, selectedTrack: index, restart: true}); // ✅ Émet l’événement avec les nouvelles musiques
  loadTracks(tracks, index)
}

var activeOrder = ref("")
var activeSens = ref("croissant")
function orderSongBy(option){
  activeOrder.value = option
  if(activeOrder.value == "song"){
    if(activeSens.value == "croissant"){
      tracksList.value = tracksList.value.sort((a, b) => a.title.localeCompare(b.title))
    }else{
      tracksList.value = tracksList.value.sort((a, b) => b.title.localeCompare(a.title))
    }
  } else if(activeOrder.value == "artist"){
    if(activeSens.value == "croissant"){
      tracksList.value = tracksList.value.sort((a, b) => a.artist.localeCompare(b.artist))
    }else{
      tracksList.value = tracksList.value.sort((a, b) => b.artist.localeCompare(a.artist))
    }
  } else {

  }
}


var globalActiveTrack = ref({})
var globalActiveTrackIsPlaying = ref(false)


onMounted(async () => {
  tracksList.value = musicStore.tracks
  
  console.log("tracks", tracksList.value)
});

watch(() => musicStore.activeTrack, () => {
  globalActiveTrack.value = musicStore.activeTrack
  globalActiveTrackIsPlaying.value = musicStore.isPlaying

  // console.log("globalActiveTrack", track);
});

</script>