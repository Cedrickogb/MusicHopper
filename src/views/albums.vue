<template>
    <div class="text-white w-full h-full p-2">
        <div class="flex flex-col space-y-2 w-full h-full items-start p-3">
            <div class="flex w-full items-center justify-between">
                <div class="flex justify-center items-center space-x-2">
                    <span v-if="showAlbum" @click="()=>{showAlbum = false}" class="group bg-black/20 rounded-lg p-2 border border-white/20 text-white backdrop-blur-sm z-10 cursor-pointer transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3 transition-all">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </span>
                    <h1 class="text-4xl font-semibold">Albums</h1>
                </div>

                <div class="flex space-x-2 justify-center items-center text-sm">
                <span>Oder by</span>
                <span class="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
                </div>
            </div>

            <div class="relative flex w-full h-full py-4 overflow-auto scrollBar p-2">
                <div v-if="!showAlbum" class="flex flex-wrap gap-2 w-full">
                    <div v-for="(album, index) in tracksAlbums" :class="`w- bg-transparent p-1 rounded-md cursor-pointer`">
                        <div v-if="album != undefined" @click="selectAlbum(album)" class="flex space-x-2 items-center justify-between text-[0.76em]">
                            <div class="flex flex-col w-36 h-48 space-y-1 items-start justify-center">
                                <div class="group relative flex w-36 h-36 bg-black rounded-md overflow-hidden">
                                    <img v-if="album.cover == undefined" class="w-full h-full" src="./public/Images/black.jpg" alt="">
                                    <img v-if="album.cover != undefined" class="w-full h-full" :src="album.cover" alt="">

                                    <span class="absolute bottom-1 left-1 hidden group-hover:flex justify-center items-center bg-zinc-900 text-white hover:bg-cyan-600 p-1.5 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                                <div class="text-truncate w-full">
                                    <p class="w-full text-[1em]">{{ album.name }}</p>
                                    <p class="w-full text-[0.9em] text-white/70">{{ album.artist }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="showAlbum" class="absolute top-0 left-0 flex flex-col space-y-5 w-full h-full ">
                    <div :class="`flex w-full space-x-6`">
                        <div class="bg-white/20 w-60 h-60 p-[2px] rounded-lg overflow-hidden">
                            <img :src="activeAlbum.cover" class="w-full h-full rounded-lg" alt="">
                        </div>

                        <div class="flex flex-col justify-between">
                            <div class="flex flex-col">
                                <p class="text-[1.5em] font-semibold">{{ activeAlbum.name }}</p>
                                <p class="text-white/60">{{ activeAlbum.artist }}</p>
                                <p class="text-[0.8em] text-white/60">{{ activeAlbum.year }}</p>
                            </div>

                            <div class="flex space-x-2">
                                <span :class="`flex space-x-1 items-center justify-center bg-cyan-600 text-white text-[0.8em] p-1 px-6 rounded-md cursor-pointer`" >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                                    </svg>
                                    <p>Play</p>
                                </span>
                                <span :class="`flex space-x-1 items-center justify-center bg-cyan-600 text-white text-[0.8em] p-1 px-6 rounded-md cursor-pointer`" >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                                    </svg>
                                    <p>Shuffle</p>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col w-full space-y-1">
                        <div v-for="(track, index) in activeAlbum.songs"  :class="`flex w-full h-11 ${index%2 == 0 ? `bg-white/10` : `bg-transparent`} items-center p-1 px-2 rounded-md cursor-pointer`">
                            <div v-if="track != undefined" class="flex w-full space-x-2 items-center justify-between text-[0.76em]">
                                <div class="flex w-[25%] space-x-3 items-center justify-start">
                                    <p>{{ index }}</p>
                                    <!-- <div class="flex w-11 h-11 bg-black rounded-md overflow-hidden">
                                        <img v-if="track.cover == undefined" class="w-full h-full" src="./public/Images/black.jpg" alt="">
                                        <img v-if="track.cover != undefined" class="w-full h-full" :src="track.cover" alt="">
                                    </div> -->
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
var tracksList = ref([])
var tracksAlbums = ref([])

function groupSongsByAlbum(songs) {
    const albumsMap = new Map();

    songs.forEach(song => {
        const { album, artist, cover, title, src, year } = song;

        if (!albumsMap.has(album)) {
            albumsMap.set(album, {
                name: album,
                artist: artist,
                cover: cover,
                year: year,
                songs: []
            });
        }

        albumsMap.get(album).songs.push(song);
    });

    return Array.from(albumsMap.values());
}

var activeAlbum = ref({})
var showAlbum = ref(false)
function selectAlbum(album){
    showAlbum.value = true
    activeAlbum.value = album
}






onMounted(async () => {
  tracksList.value = musicStore.tracks

  tracksAlbums.value = groupSongsByAlbum(tracksList.value)
  console.log("tracks", tracksList.value)
  
});

</script>