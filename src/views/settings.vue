<template>
    <div class="relative text-white w-full h-full p-2 overflow-hidden">
        <div class="flex flex-col space-y-2 w-full h-full p-3">
            <h1 class="text-4xl font-semibold">Settings</h1>

            <div class="flex flex-col w-full text-xl space-y-3 overflow-auto">
                <p>Libraries</p>
                <div :class="`relative flex w-[50%] bg-white/10 space-x-2 text-base rounded-md p-2 px-4 justify-between items-center border border-white/20`">
                    <div class="flex justify-center items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                        </svg>
    
                        <div>Location of the music library</div>
                    </div>

                    <div class="flex space-x-2 justify-center items-center">
                        <span :class="`bg-cyan-600 text-white text-sm p-1 px-3 rounded-md cursor-pointer`" @click="selectFolder()">Add a folder</span>
                        <span :class="`flex`">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>

            <div v-if="isloading" class="absolute left-0 -top-[10%] flex justify-center items-center w-full h-[110%] bg-black/30 backdrop-blur-md  z-10">
                <span :class="`flex text-cyan-600`">
                    <svg class="size-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><radialGradient id="a12" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"><stop offset="0" stop-color="currentColor"></stop><stop offset=".3" stop-color="currentColor" stop-opacity=".9"></stop><stop offset=".6" stop-color="currentColor" stop-opacity=".6"></stop><stop offset=".8" stop-color="currentColor" stop-opacity=".3"></stop><stop offset="1" stop-color="currentColor" stop-opacity="0"></stop></radialGradient><circle transform-origin="center" fill="none" stroke="url(#a12)" stroke-width="14" stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100" r="70"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></circle><circle transform-origin="center" fill="none" opacity=".2" stroke="currentColor" stroke-width="14" stroke-linecap="round" cx="100" cy="100" r="70"></circle></svg>                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { parseBlob } from "music-metadata-browser";
import { useMusicStore } from '@/assets/script';

var isloading = ref(false)
const musicStore = useMusicStore();

// Simulation : Fonction pour récupérer des musiques (remplace par ton code réel)
const loadTracks = (tracksTab) => {
  const newTracks = tracksTab;
  musicStore.setTracks(newTracks);

  console.log(musicStore.tracks, "settings")
};

const selectFolder = async () => {
    isloading.value = true;

    if (!window.electron) {
        alert("Electron n'est pas disponible !");
        return;
    }

    const files = await window.electron.openFolderDialog();
    if (files) {
        // tracks.value = files;
        var validSongs = await initTrackList(files)
        loadTracks(validSongs);

        isloading.value = false
        // console.log("Tracks chargés :", tracks.value); // 🔍 Vérifie si les fichiers sont bien reçus
    }
};

const loadMetadata = async (track) => {
  try {
    // const track = props.tracks[currentTrackIndex.value];
    let currentTrack = {
      title: "Chargement...",
      artist: "Inconnu",
      album: "Inconnu",
      cover: "",
      track: {},
      year: "",
      src: ""
    }
    currentTrack.src = track.src;

    
    // const response = await fetch(track.src);
    
    // const blob = await response.blob();
    // const metadata = await parseBlob(blob);
    
    const filePath = track.src.replace("file://", ""); // Nettoyer le chemin
    const fileBuffer = await window.electron.readFile(filePath);

    if (!fileBuffer) throw new Error("Impossible de lire le fichier");
    
    const metadata = await parseBlob(new Blob([fileBuffer]));
    console.log(metadata, "Fetched")


    // console.log(metadata)

    currentTrack.title = metadata.common.title || track.title || "Titre inconnu";
    currentTrack.artist = metadata.common.artist || track.artist || "Artiste inconnu";
    currentTrack.album = metadata.common.album || track.album || "Album inconnu";
    currentTrack.track = metadata.common.track || track.track || "Album inconnu";
    currentTrack.year = metadata.common.year || track.year || "Album inconnu";

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
</script>