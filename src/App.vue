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
    </div>

    <Player class="flex w-full h-[20vh] justify-center items-center" :tracks="tracks" :restart="restart" :active="activeTrackId" @play-song="startPlaying"  @request-tracks="loadTracksFromRouter" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router'
import router from '@/router';
import SideBar from './components/sideBar.vue';
import Player from '@/components/player.vue';

var tracks = ref([])
var activeTrackId = ref(0)
var restart = ref(false)


const updateTracks = async (newTracks) => {
  console.log("Mise à jour des pistes depuis song.vue :", newTracks);
  tracks.value = newTracks.tracks
  activeTrackId.value = newTracks.selectedTrack
  restart.value = newTracks.restart

  if(restart.value == true){
    restart.value = false
    startPlaying()
  }

  // loadTracksFromRouter(tracks.value, activeTrackId.value)
};

const loadTracksFromRouter = (tracks, index) => {
  // console.log("Requête de Player pour recharger les pistes", tracks, index);

  // Simule une requête aux données de RouterView
  // const dummyTracks = [
  //   { title: "Track 1", src: "file://song1.mp3" },
  //   { title: "Track 2", src: "file://song2.mp3" }
  // ];

  // updateTracks({ tracks: tracks, selectedTrack: index ? index : 0});
};

function startPlaying(){
  console.log("start playing")
}

onMounted(async() => {
  router.push('/settings')
})

</script>

<style scoped>
</style>
