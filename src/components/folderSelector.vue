<template>
  <div class="h-full p-4 bg-gray-900 text-white rounded shadow-lg">
    <button @click="selectFolder" class="bg-blue-500 px-4 py-2 rounded">🎵 Check Folder</button>

    <!-- <ul v-if="tracks.length" class="mt-4 overflow-auto">
      <li v-for="(track, index) in tracks" :key="index">
        {{ track.title }}
      </li>
    </ul> -->
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["update-tracks"]); // ✅ Déclare bien l'événement
const tracks = ref([]);

const selectFolder = async () => {
  if (!window.electron) {
    alert("Electron n'est pas disponible !");
    return;
  }

  const files = await window.electron.openFolderDialog();
  if (files) {
    tracks.value = files;
    // console.log("Tracks chargés :", tracks.value); // 🔍 Vérifie si les fichiers sont bien reçus
    emit("update-tracks", tracks.value); // ✅ Émet l’événement avec les nouvelles musiques
  }
};
</script>