<template>
    <div class="text-white h-full p-2">
        <div class="flex flex-col w-full h-full justify-between items-center p-3">
            <div class="flex w-full items-center justify-between">
                <div class="flex justify-center items-center space-x-2">
                    <span v-if="showAlbum" @click="()=>{showAlbum = false}" class="group bg-black/20 rounded-lg p-2 border border-white/20 text-white backdrop-blur-sm z-10 cursor-pointer transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3 transition-all">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </span>
                    <h1 class="text-4xl font-semibold">Artists</h1>
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

            <div class="relative flex w-full h-[94%] p-2">
                <div class="flex flex-col space-y-2 w-[25%] h-full overflow-auto scrollBar p-1">
                    <div v-for="(artist, index) in artists" @click="selectArtist(artist)" :class="`flex space-x-2 items-center ${selectedArtist.name == artist.name ? `bg-white/10` : `bg-transparent`} text-[0.8em] p-2 px-4 rounded-lg cursor-pointer`">
                        <div>
                            <img :src="artist.cover" class="w-11 h-11 rounded-full" alt="">
                        </div>
                        <p> {{ artist.name }} </p>
                    </div>
                </div>

                <div class="relative flex w-[75%] h-full overflow-auto scrollBar p-2">
                    <div v-show="!showAlbum" class="flex flex-wrap gap-2">
                        <div v-for="(album, index) in selectedArtist.albums" :class="`w- bg-transparent p-1 rounded-md cursor-pointer`">
                            <div v-if="album != undefined" class="flex space-x-2 items-center justify-between text-[0.76em]">
                                <div class="flex flex-col w-36 h-48 space-y-1 items-start justify-center">
                                    <div class="group relative flex w-36 h-36 bg-white/20 p-[2px] rounded-md overflow-hidden album-cover-shadow">
                                        <img v-if="album.cover != undefined" @click="selectAlbum(album)" class="w-full h-full rounded-md" :src="album.cover" alt="">
    
                                        <span @click="playTrack(album.songs, 0)" class="absolute bottom-1 left-1 hidden group-hover:flex justify-center items-center bg-zinc-900 text-white hover:bg-cyan-600 p-1.5 rounded-full z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="text-truncate w-full">
                                        <p class="w-full text-[1em]">{{ album.name }}</p>
                                        <p class="w-full text-[0.9em] text-white/70">Year: {{ album.year }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="showAlbum" class="absolute top-0 left-0 flex flex-col space-y-5 w-full h-full p-2 z-10">
                        <div :class="`flex flex-wrap w-full gap-4`">
                            <div class="album-cover-shadow bg-white/20 w-60 h-60 p-[2px] rounded-lg overflow-hidden">
                                <img :src="activeAlbum.cover" class="w-full h-full rounded-lg" alt="">
                            </div>

                            <div class="flex flex-col items-start justify-end space-y-4">
                                <div class="flex flex-col">
                                    <p class="text-[1.5em] font-semibold">{{ activeAlbum.name }}</p>
                                    <p class="text-white/60">{{ activeAlbum.artist }}</p>
                                    <p class="text-[0.8em] text-white/60">{{ activeAlbum.year }}</p>
                                </div>

                                <div class="flex space-x-2">
                                    <span @click="playTrack(activeAlbum.songs, 0, false)" :class="`flex space-x-1 items-center justify-center bg-cyan-600 text-white text-[0.7em] p-1 px-6 rounded-md cursor-pointer`" >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                                        </svg>
                                        <p>Play</p>
                                    </span>
                                    <span @click="playTrack(activeAlbum.songs, 0, true)" :class="`flex space-x-1 items-center justify-center bg-cyan-600 text-white text-[0.7em] p-1 px-6 rounded-md cursor-pointer`" >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4">
                                            <path d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <p>Shuffle</p>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col w-full space-y-1">
                            <div v-for="(track, index) in activeAlbum.songs" 
                                :key="track.id || index"
                                @click="playTrack(activeAlbum.songs,  index)"  
                                :class="`flex w-full h-11 ${index%2 == 0 ? `bg-white/10` : `bg-transparent`} ${isActiveTrack(track) ? 'bg-cyan-500/20 border border-cyan-500/30' : ''} items-center p-1 px-2 rounded-md cursor-pointer`"
                            >
                                <div v-if="track != undefined" class="flex w-full space-x-2 items-center justify-between text-[0.70em]">
                                    <div class="flex w-[25%] space-x-3 items-center justify-start">
                                        <p>{{ track.track.no }}</p>
                                        <p class="font-semibold">{{ track.title }}</p>
                                    </div>
                                    
                                    <div class="flex text-white/50 w-[25%] justify-center items-center truncate">
                                    <p class="flex">{{ track.artist }}</p>
                                    </div>
        
                                    <div class="flex text-white/50 w-[25%] justify-center items-center">
                                    <p class="flex">{{ track.album }}</p>
                                    </div>
        
                                    <div class="flex w-[12.5%] justify-end items-center">
                                        <p class="flex"> 
                                            {{ isActiveTrack(track) ? formattedTime.currentTime + ' - ' + formattedTime.totalTime : '0:00' }}    
                                        </p>
                                    </div>
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
import { onMounted, ref, computed } from 'vue';
import { parseBlob } from "music-metadata-browser";
import { useMusicStore } from '@/assets/script';

const emit = defineEmits(["update-tracks"]);

const musicStore = useMusicStore();
var tracksList = ref([])
var tracksAlbums = ref([])
var artists = ref([])
var selectedArtist = ref({})

function groupSongsByArtist(albums) {
    const artistsMap = new Map();

    albums.forEach(album => {
        const { name, artist, cover, title, src, year } = album;

        if (!artistsMap.has(artist)) {
            artistsMap.set(artist, {
                name: artist,
                cover: cover,
                albums: []
            });
        }
        console.log(artistsMap, "poiuy")
        artistsMap.get(artist).albums.push(album);
    });

    return Array.from(artistsMap.values());
}

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
        albumsMap.get(album).songs.sort((a, b) => (a.track.no || 0) - (b.track.no || 0));
    });

    return Array.from(albumsMap.values());
}

var showArtistTracks = ref(false)
function selectArtist(artist){
    showAlbum.value = false
    selectedArtist.value = artist
}
var activeAlbum = ref({})
var showAlbum = ref(false)
function selectAlbum(album){
    showAlbum.value = true
    activeAlbum.value = album
}


// Computed properties pour suivre l'état global
const isPlaying = computed(() => musicStore.playbackState.isPlaying);
const progressPercentage = computed(() => musicStore.getProgressPercentage);
const formattedTime = computed(() => musicStore.getFormattedState);

// Fonction pour vérifier si une musique est active
const isActiveTrack = (track) => {
  return musicStore.isActiveTrack(track);
};

const playTrack = (albumTracks, index) => {
  // Si c'est déjà la musique active, on toggle play/pause
  if (isActiveTrack(albumTracks[index])) {
    musicStore.togglePlay();
  } else {
    // Sinon on joue la nouvelle musique
    musicStore.playTrack(albumTracks, index);
  }
};





onMounted(async () => {
    tracksList.value = musicStore.tracks;

    tracksAlbums.value = groupSongsByAlbum(tracksList.value)
    artists.value = groupSongsByArtist(tracksAlbums.value)
    console.log("tracks", artists.value)
  
});

</script>