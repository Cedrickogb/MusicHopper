<template>
  <main>
     <div class="text-white w-full h-full p-2">
      <div class="flex w-full justify-between items-center p-3">
        <h1 class="text-4xl font-semibold">Home</h1>

        <div>
          <button @click="selectFolder" class="bg-blue-500 px-4 py-2 rounded">🎵 Check Folder</button>
        </div>
      </div>
      
      <!-- <FolderSelector @update-tracks="updateTracks" class="h-20" /> -->

     </div>
  </main>
</template>

<script setup >
import { onMounted, ref, watch } from 'vue';
import { parseBlob } from "music-metadata-browser";
import FolderSelector from '@/components/folderSelector.vue';

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

function replaceHead(tab){
  var newTab = tab
  for (const [index, song] of tab.entries()){
    newTab[index] = {
      title: song.title,
      artist: 'song.artist',
      album: 'song.album',
      cover: 'song.cover',
      src: song.src.replace('file://', 'local://') // On remplace le chemin vers le fichier local par le chemin vers le fichier local en mémoire
    }
  };

  return newTab
}

const updateTracks = async (newTracks) => {
  console.log("Nouvelles musiques reçues :", newTracks); // 🔍 Vérifier si ça logge bien
  newTracks.forEach(element => {
    element.src.replace('file://', 'local://')
  });
  // console.log("Nouvelles musiques reçues :", newTracks)

  tracks.value = replaceHead(newTracks);
  console.log("Nouvelles musiques reçues :", tracks.value)
  // tracksList.value = await initTrackList(tracks.value)
};

onMounted(async () => {
  tracksList.value = await initTrackList(tracks.value)

  // console.log(tracksList.value, "dpqsd,qs")
  // window.addEventListener("keydown", handleKeyPress);
});
</script>