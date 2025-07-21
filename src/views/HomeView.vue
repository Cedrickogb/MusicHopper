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


onMounted(async () => {
});
</script>