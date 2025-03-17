<template>
    <div class="text-white w-full h-full p-2">
        <div class="flex flex-col space-y-4 w-full h-full p-3">
        <div>
          
        </div>
            <h1 class="text-4xl font-semibold">Songs</h1>

            <div class="flex w-full py-4 overflow-auto scrollBar p-2">
                <div class="flex flex-col w-full space-y-1">
                    <div v-for="(track, index) in tracksList" @click="playTrack(track, index, true)" :class="`w-full ${index%2 == 0 ? `bg-white/10` : `bg-transparent`} p-1 px-2 rounded-md cursor-pointer`">
                        <div class="flex space-x-2 items-center justify-between text-[0.76em]">
                            <div class="flex w-[25%] space-x-3 items-center justify-start">
                                <p>{{ index }}</p>
                                <div class="flex w-11 h-11 bg-black rounded-md overflow-hidden">
                                    <img class="w-full h-full" :src="track.cover" alt="">
                                </div>
                                <p class="font-semibold">{{ track.title }}</p>
                            </div>
                            
                            <div class="flex text-white/50 w-[25%] justify-center items-center">
                            <p class="flex">{{ track.artist }}</p>
                            </div>

                            <div class="flex text-white/50 w-[25%] justify-center items-center">
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
import { useMusicStore } from "@/assets/script"

const emit = defineEmits(["update-tracks"]);

const musicStore = useMusicStore();

var tracks = ref(musicStore.tracks)


var tracksList = ref([])


const loadMetadata = async (track) => {
  try {
    // const track = props.tracks[currentTrackIndex.value];
    let currentTrack = {
      title: "Chargement...",
      artist: "Inconnu",
      album: "Inconnu",
      cover: "",
      src: ""
    }
    currentTrack.src = track.src;

    const response = await fetch(track.src);
    const blob = await response.blob();
    const metadata = await parseBlob(blob);

    // console.log(metadata)

    currentTrack.title = metadata.common.title || track.title || "Titre inconnu";
    currentTrack.artist = metadata.common.artist || track.artist || "Artiste inconnu";
    currentTrack.album = metadata.common.album || track.album || "Album inconnu";

    // Extraction de la cover si disponible
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const blobUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
      currentTrack.cover = blobUrl;
    } else {
      currentTrack.cover = track.cover || "./public/Images/black.jpg";
    }

    return currentTrack
  } catch (error) {
    console.error("Erreur lors du chargement des métadonnées :", error);
  }
};

async function initTrackList(songs){
  var newTab = songs
  for (const [index, song] of songs.entries()){
    let newData = await loadMetadata(song)
    newTab[index] = newData
  };

  return newTab
}


function playTrack(track, index){
  emit("update-tracks", {tracks: tracksList.value, selectedTrack: index, restart: true}); // ✅ Émet l’événement avec les nouvelles musiques
}





onMounted(async () => {
  tracksList.value = await initTrackList(tracks.value)
  emit("update-tracks", {tracks: tracksList.value, selectedTrack: 0, restart: false})
});

</script>