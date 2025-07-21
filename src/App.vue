<template>

  <div class="big-gradient-bg realtive flex flex-col w-full h-[100vh]">
    <div class="gradient-bg absolute top-0 left-0 w-full h-full backdrop-blur-sm overflow-hidden -z-10">
      <div :class="`absolute flex top-0 left-0 w-full h-full bg-black/50 blur-lg`"></div>
      <div :class="`g1 absolute flex top-0 left-0 w-[20em] h-full blur-lg`"></div>
      <div :class="`g2 absolute flex top-[10%] left-[20%] w-[30em] h-[25em] rounded-full blur-lg`"></div>
      <div :class="`g3 absolute flex top-0 right-0 w-[30em] h-[50%] blur-lg`"></div>
      <div :class="`g4 absolute flex top-[20%] right-[20%] w-[20%] h-[40%] rounded-full blur-lg`"></div>
      <div :class="`g5 absolute flex top-[70%] left-0 w-[20%] h-[40%] rounded-full blur-lg`"></div>
      <div :class="`g5 absolute flex top-[50%] left-[30%] w-[20em] h-[20em] rounded-full blur-lg`"></div>
      <div :class="`g1 absolute flex bottom-0 left-[75%] w-[50%] h-[40%] rounded-full blur-lg`"></div>
    </div>


    <div class="flex w-full h-[80vh] p-1">
      <SideBar class="h-full"/>
      <RouterView @update-tracks="updateTracks" class="grow h-full bg-black/30 p-2 border border-white/40 rounded-lg backdrop-blur-md"/>

      <div v-if="isloading" class="absolute left-0 -top-[10%] flex justify-center items-center w-full h-[110%] bg-black/30 backdrop-blur-md  z-10">
          <span :class="`flex text-cyan-600`">
              <svg class="size-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><radialGradient id="a12" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"><stop offset="0" stop-color="currentColor"></stop><stop offset=".3" stop-color="currentColor" stop-opacity=".9"></stop><stop offset=".6" stop-color="currentColor" stop-opacity=".6"></stop><stop offset=".8" stop-color="currentColor" stop-opacity=".3"></stop><stop offset="1" stop-color="currentColor" stop-opacity="0"></stop></radialGradient><circle transform-origin="center" fill="none" stroke="url(#a12)" stroke-width="14" stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100" r="70"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></circle><circle transform-origin="center" fill="none" opacity=".2" stroke="currentColor" stroke-width="14" stroke-linecap="round" cx="100" cy="100" r="70"></circle></svg>
          </span>
      </div>
    </div>

    <Player class="flex w-full h-[20vh] justify-center items-center" :tracks="tracks" :restart="restart" :active="activeTrackId" @play-song="startPlaying" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router'
import router from '@/router';
import SideBar from './components/sideBar.vue';
import Player from '@/components/player.vue';
import { useMusicStore, loadMetadata } from '@/assets/script';

const musicStore = useMusicStore();

let isloading = ref(false)

var tracks = ref([])
var activeTrackId = ref(0)
var restart = ref(false)



async function initTrackList(songs) {
  const enriched = [];
  for (const song of songs) {
    const enrichedTrack = await loadMetadata(song);
    if (enrichedTrack) enriched.push(enrichedTrack);
  }
  return enriched;
}

const loadTracks = async (tracksTab) => {
  await musicStore.setTracks(tracksTab);
  if(musicStore.tracks[0].title != "Chargement"){
    console.log(router,"route")
  }

};


onMounted(async() => {
  isloading.value = true
  router.push('/')


  const result = await window.electron.validateFolder();
  if (result?.valid) {
    console.log("Dossier déjà sélectionné :", result.path);
    const validSongs = await initTrackList(result.musics);
    loadTracks(validSongs);

    router.push('/songs')
  } else {
    console.log("Aucun dossier valide trouvé, l'utilisateur devra en sélectionner un.");
    router.push('/settings')
  }

  isloading.value = false
})

</script>

<style scoped>
</style>
