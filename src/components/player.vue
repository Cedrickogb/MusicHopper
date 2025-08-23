<template>
  <div class="flex w-full h-fit bg-transparent justify-center items-center p-1">
    <div class="flex flex-col w-full bg-transparent space-y-1 text-white p-2 rounded-md">
      <div class="flex w-full">
        <span class="flex w-[10%] justify-center items-center text-sm">
          <p>{{currentTime}}</p>
        </span>
        <!-- <div class="wrapper w-full"> -->
          <!-- <div class="range"> -->
            <input type="range" min="0" :max="duration" step="0.1" v-model="progress" @input="seek" class="trackProgressBar w-[80%]"    />
          <!-- </div> -->
        <!-- </div> -->
        <span class="flex w-[10%] justify-center items-center text-sm">
          <p>{{totalTime}}</p>
        </span>
      </div>

      <div class="flex w-full justify-between">
        <div class="flex w-[24%] gap-2 items-center justify-center">
          <button @click="toggleShuffle">
            <span class="flex" :class="`${shuffle ? `text-cyan-500` : `text-white`}`">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5 lg:size-6">
                <path d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>

          <button @click="prevTrack()">
            <span class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 lg:size-6">
                <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
              </svg>
            </span>
          </button>

          <button @click="togglePlay()">
            <span v-if="!isPlaying" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 lg:size-6">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="isPlaying" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 lg:size-6">
                <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>

          <button @click="nextTrack()">
            <span class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 lg:size-6">
                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
              </svg>
            </span>
          </button>

          <button @click="toggleLoop()">
            <span :class="`flex ${loop ? `text-cyan-500` : `text-white`}`">
              <svg viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="size-5 lg:size-6">
                <path d="M1 9c0 2.206 1.711 4 3.813 4v1c-2.654 0-4.813-2.243-4.813-5s2.159-5 4.813-5h4.229l-1.646-1.646 0.707-0.707 2.854 2.853-2.853 2.854-0.708-0.708 1.647-1.646h-4.23c-2.102 0-3.813 1.794-3.813 4zM12.187 4v1c2.102 0 3.813 1.794 3.813 4s-1.711 4-3.813 4h-4.23l1.646-1.646-0.707-0.707-2.853 2.853 2.854 2.854 0.707-0.707-1.647-1.647h4.229c2.655 0 4.814-2.243 4.814-5s-2.159-5-4.813-5z" fill="currentColor" />
              </svg>
            </span>
          </button>
        </div>

        <div class="relative flex w-[50%] bg-white/15 space-x-2 rounded-md p-1 items-center border border-white/20 inset-shadow-sm">
          <div class="group flex w-10 h-10 bg-black rounded-md overflow-hidden cursor-pointer">
            <img v-if="currentTrack.artist != 'Inconnu'" class="w-full h-full" :src="currentTrack.cover" alt="">

            <div v-if="currentTrack.artist != 'Inconnu'" class="group-hover:flex group-hover:opacity-100 hidden opacity-0 absolute left-0 top-0 translate-x-[-25%] translate-y-[-102%] bg-white/20 w-72 h-72 p-[3px] rounded-md ease-out transition-all duration-500">
              <img class="w-full h-full rounded-md" :src="currentTrack.cover" alt="">
            </div>
          </div>
          <div class="flex flex-col">
            <p class="text-[0.75em] font-semibold">{{ currentTrack.title }}</p>
            <span class="flex text-[0.65em] space-x-2"><p>{{ currentTrack.album }}</p><p>- {{ currentTrack.artist }}</p></span>
          </div>
        </div>

        <div class="flex w-[24%] space-x-3 items-center justify-center">
          <button>
            <span v-if="volume > 0" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 lg:size-6">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
            </span>
            <span v-if="volume == 0" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 lg:size-6">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
              </svg>
            </span>
          </button>

          <input class="slider w-full" type="range" v-model="volume" min="0" max="1" step="0.01" @input="setVolume" />
          
          <button @click="()=>{fullScreen = true}">
            <span class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 lg:size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="fullScreen" class="absolute flex w-[100vw] h-[100vh] bg-black mt-[36px]">
    <span @click="()=>{fullScreen = false}" class="group absolute top-2 left-2 bg-black/20 rounded-lg p-2 border border-white/20 text-white backdrop-blur-sm z-10 cursor-pointer transition-all">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3 group-hover:size-4 transition-all">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
    </span>

    <div class="big-gradient-bg absolute top-0 left-0 w-full h-full bg-white/30 backdrop-blur-sm overflow-hidden">
      <div :class="`absolute flex top-0 left-0 w-full h-full bg-black/50 blur-lg`"></div>
      <div :class="`g1 absolute flex top-0 left-0 w-[20em] h-full bg-[${currentTrackColors[0]}] blur-lg`"></div>
      <div :class="`g2 absolute flex top-[10%] left-[20%] w-[30em] h-[25em] bg-[${currentTrackColors[1]}] rounded-full blur-lg`"></div>
      <div :class="`g3 absolute flex top-0 right-0 w-[30em] h-[50%] bg-[${currentTrackColors[2]}] blur-lg`"></div>
      <div :class="`g4 absolute flex top-[20%] right-[20%] w-[20%] h-[40%] bg-[${currentTrackColors[3]}] rounded-full blur-lg`"></div>
      <div :class="`g5 absolute flex top-[70%] left-0 w-[20%] h-[40%] bg-[${currentTrackColors[4]}] rounded-full blur-lg`"></div>
      <div :class="`g5 absolute flex top-[50%] left-[30%] w-[20em] h-[20em] bg-[${currentTrackColors[4]}] rounded-full blur-lg`"></div>
      <div :class="`g1 absolute flex bottom-0 left-[75%] w-[50%] h-[40%] bg-[${currentTrackColors[0]}] rounded-full blur-lg`"></div>
    </div>

    <div class="relative flex w-full lg:w-[60%] h-full bg-transparent justify-start items-center">
      <img class="fading-box lg:w-auto lg:h-full" :src="currentTrack.cover" alt="">

      <div class="group flex flex-col space-y-1 absolute bottom-[10%] left-[50%] translate-x-[-50%] w-[45%] h-fit bg-black/30 rounded-xl p-2 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:ease-in-out">
        
        <div class="flex w-full justify-between items-start p-1">
          <div class="flex flex-col">
            <p class="text-[0.85em] font-semibold">{{ currentTrack.title }}</p>
            <span class="flex text-[0.76em] text-white/80 space-x-2"><p>{{ currentTrack.artist }}</p></span>
          </div>

          <button>
            <svg  viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4" >
              <path d="M4 8C4 9.10457 3.10457 10 2 10C0.895431 10 0 9.10457 0 8C0 6.89543 0.895431 6 2 6C3.10457 6 4 6.89543 4 8Z" fill="currentColor"/>
              <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z" fill="currentColor"/>
              <path d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="group-hover:flex hidden w-full text-[0.76em] transition-all duration-300 ease-in-out">
          <span class="flex w-[15%] justify-center items-center">
            <p>{{currentTime}}</p>
          </span>
          <input type="range" min="0" :max="duration" step="0.1" v-model="progress" @input="seek" class="trackProgressBar w-[70%]"    />
          <span class="flex w-[15%] justify-center items-center">
            <p>{{totalTime}}</p>
          </span>
        </div>

        <div class="group-hover:flex hidden w-full space-x-2 justify-center items-center transition-all duration-300 ease-in-out">
          <button @click="toggleShuffle" :class="`${shuffle ? `text-cyan-500` : `text-white`}`">
            <span class="flex">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5">
                <path d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>

          <button @click="prevTrack()">
            <span class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
              </svg>
            </span>
          </button>

          <button @click="togglePlay()">
            <span v-if="!isPlaying" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="isPlaying" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>

          <button @click="nextTrack()">
            <span class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
              </svg>
            </span>
          </button>

          <button @click="toggleLoop()">
            <span :class="`flex ${loop ? `text-cyan-500` : `text-white`}`">
              <svg viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="size-5">
                <path d="M1 9c0 2.206 1.711 4 3.813 4v1c-2.654 0-4.813-2.243-4.813-5s2.159-5 4.813-5h4.229l-1.646-1.646 0.707-0.707 2.854 2.853-2.853 2.854-0.708-0.708 1.647-1.646h-4.23c-2.102 0-3.813 1.794-3.813 4zM12.187 4v1c2.102 0 3.813 1.794 3.813 4s-1.711 4-3.813 4h-4.23l1.646-1.646-0.707-0.707-2.853 2.853 2.854 2.854 0.707-0.707-1.647-1.647h4.229c2.655 0 4.814-2.243 4.814-5s-2.159-5-4.813-5z" fill="currentColor" />
              </svg>
            </span>
          </button>
        </div>

        <div class="group-hover:flex hidden w-full space-x-2 transition-all duration-300 ease-in-out">
          <button>
            <span v-if="volume > 0" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
            </span>
            <span v-if="volume == 0" class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
              </svg>
            </span>
          </button>

          <input class="slider grow" type="range" v-model="volume" min="0" max="1" step="0.01" @input="setVolume" />
        </div>

      </div>
    </div>
  </div>
</template>
  
// Parties principales du composant Player mises à jour
<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { Howl, Howler } from 'howler';
import { parseBlob } from "music-metadata-browser";
import ColorThief from "colorthief"
import { useMusicStore } from '@/assets/script';

const musicStore = useMusicStore();

// Variables réactives locales au player
const fullScreen = ref(false);
const interval = ref();
const sound = ref();
const currentTrackColors = ref(['#2d302b', '#bba482', '#736d5b', '#91866d', '#847b6c']);
const currentTrackMainColor = ref("");

// Variables calculées basées sur le store global
const currentTrack = computed(() => musicStore.activeTrack);
const isPlaying = computed(() => musicStore.playbackState.isPlaying);
const volume = computed({
  get: () => musicStore.playbackState.volume,
  set: (value) => {
    musicStore.updatePlaybackState({ volume: value });
    setVolume();
  }
});
const progress = computed({
  get: () => musicStore.playbackState.progress,
  set: (value) => {
    musicStore.updatePlaybackState({ progress: value });
  }
});
const duration = computed(() => musicStore.playbackState.duration);
const currentTime = computed(() => formatTime(musicStore.playbackState.currentTime));
const totalTime = computed(() => formatTime(musicStore.playbackState.duration));
const shuffle = computed(() => musicStore.playbackOptions.shuffle);
const loop = computed(() => musicStore.playbackOptions.loop);

// Initialiser Howler avec le volume du store
Howler.volume(musicStore.playbackState.volume);

// Charger les métadonnées et initialiser l'audio
const loadMetadata = async (track) => {
  try {
    if (!track || !track.src) return;

    let currentTrack = { ...track };

    if (track.src !== "") {
      const response = await fetch(track.src);
      const blob = await response.blob();
      const metadata = await parseBlob(blob);

      currentTrack.title = metadata.common.title || track.title || "Titre inconnu";
      currentTrack.artist = metadata.common.artist || track.artist || "Artiste inconnu";
      currentTrack.album = metadata.common.album || track.album || "Album inconnu";

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const blobUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
        currentTrack.cover = blobUrl;
      } else {
        currentTrack.cover = "./public/Images/black.jpg";
      }

      // Mettre à jour le store avec les métadonnées complètes
      musicStore.activeTrack = currentTrack;
    }

    // Charger les couleurs
    if (currentTrack.cover) {
      currentTrackColors.value = await getPaletteColor(currentTrack.cover);
      currentTrackMainColor.value = await getDominantColor(currentTrack.cover);
      loadSongColor();
    }

    return currentTrack;
  } catch (error) {
    console.error("Erreur lors du chargement des métadonnées :", error);
  }
};

// Initialiser l'audio avec Howler
const initAudio = async (shouldPlay = false) => {
  if (sound.value) {
    sound.value.unload();
  }

  const track = musicStore.activeTrack;
  if (!track.src) return;

  // Charger les métadonnées d'abord
  await loadMetadata(track);

  sound.value = new Howl({
    src: [track.src],
    html5: true,
    volume: musicStore.playbackState.volume,
    onload() {
      const dur = sound.value.duration();
      musicStore.updatePlaybackState({ 
        duration: dur,
        isLoading: false 
      });
    },
    onplay() {
      musicStore.updatePlaybackState({ isPlaying: true, isPaused: false });
      interval.value = setInterval(updateProgress, 500);
    },
    onpause() {
      musicStore.updatePlaybackState({ isPlaying: false, isPaused: true });
      clearInterval(interval.value);
    },
    onend() {
      clearInterval(interval.value);
      if (loop.value) {
        play();
      } else {
        nextTrack();
      }
    },
    onstop() {
      clearInterval(interval.value);
      musicStore.updatePlaybackState({ 
        isPlaying: false, 
        isPaused: false, 
        currentTime: 0, 
        progress: 0 
      });
    }
  });

  if (shouldPlay) {
    play();
  }
};

// Fonctions de contrôle audio
const play = () => {
  if (!sound.value) return;
  sound.value.play();
};

const pause = () => {
  if (!sound.value) return;
  sound.value.pause();
};

const togglePlay = () => {
  if (!sound.value) return;
  
  if (sound.value.playing()) {
    sound.value.pause();
  } else {
    sound.value.play();
  }
};

const nextTrack = () => {
  musicStore.nextTrack();
};

const prevTrack = () => {
  musicStore.prevTrack();
};

const toggleShuffle = () => {
  musicStore.toggleShuffle();
};

const toggleLoop = () => {
  musicStore.toggleLoop();
};

const setVolume = () => {
  Howler.volume(musicStore.playbackState.volume);
};

const seek = (event) => {
  if (!sound.value) return;
  const newTime = parseFloat(event.target.value);
  sound.value.seek(newTime);
  musicStore.updatePlaybackState({ 
    currentTime: newTime, 
    progress: newTime 
  });
};

// Mettre à jour la progression
const updateProgress = () => {
  if (!sound.value) return;
  const time = sound.value.seek() || 0;
  musicStore.updateProgress(time, sound.value.duration() || 0);
};

// Fonctions utilitaires
const formatTime = (seconds) => {
  if (isNaN(seconds) || !seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const getPaletteColor = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 5);
        const newColors = colors.map(color => `${color[0]}, ${color[1]}, ${color[2]}`);
        resolve(newColors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (err) => reject(err);
  });
};

const getDominantColor = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(img);
        const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        resolve(rgbColor);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (err) => reject(err);
  });
};

const loadSongColor = () => {
  document.documentElement.style.setProperty('--color-bg1', currentTrackMainColor.value);
  document.documentElement.style.setProperty('--color-bg2', currentTrackMainColor.value);
  document.documentElement.style.setProperty('--color1', currentTrackColors.value[0]);
  document.documentElement.style.setProperty('--color2', currentTrackColors.value[1]);
  document.documentElement.style.setProperty('--color3', currentTrackColors.value[2]);
  document.documentElement.style.setProperty('--color4', currentTrackColors.value[3]);
  document.documentElement.style.setProperty('--color5', currentTrackColors.value[4]);
};

// Gestion des touches clavier
const handleKeyPress = (event) => {
  if (event.code === "Space" && !event.target.matches('input, textarea, [contenteditable]')) {
    event.preventDefault();
    togglePlay();
  }
};

// Lifecycle hooks
onMounted(async () => {
  window.addEventListener("keydown", handleKeyPress);
  
  // Initialiser avec la musique active du store
  if (musicStore.activeTrack.src) {
    await initAudio(musicStore.playbackState.isPlaying);
  }
});

// Watchers pour synchroniser avec le store
watch(() => musicStore.trigger, async () => {
  console.log("Nouvelle musique détectée dans le store");
  musicStore.updatePlaybackState({ isLoading: true });
  await initAudio(true);
});

// Watcher pour les changements de volume depuis le store
watch(() => musicStore.playbackState.volume, (newVolume) => {
  if (sound.value) {
    Howler.volume(newVolume);
  }
});

// Nettoyer lors du démontage
import { onUnmounted } from 'vue';
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
  if (sound.value) {
    sound.value.unload();
  }
  if (interval.value) {
    clearInterval(interval.value);
  }
});
</script>