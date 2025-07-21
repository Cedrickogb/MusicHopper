import { defineStore } from 'pinia';
import { parseBlob } from "music-metadata-browser";

var tracks = [];
let electron = window.electron;

interface Track {
  artist: string;
  album: string;
  cover: string;
  title: string;
  src: string;
  year: number;
  track: string;
}

export const useMusicStore = defineStore("music", {
  state: () => ({
    tracks: [
      { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
    ] as Track[], // Tableau typé de musiques
    activeTracks: [
      { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" }
    ] as Track[], // Tableau typé de musiques
    activeTrackId: 0 as number,
    trigger: false as boolean,
    activeTrack: { title: "Chargement...", artist: "Inconnu", album: "Inconnu", cover: "./public/Images/black.jpg", src: "" } as object,
    isPlaying: false as boolean,
  }),

  actions: {
    async setTracks(newTracks: Track[]) {
      this.tracks = newTracks;
    },
    setActiveTrackId(id: number) {
      this.activeTrackId = id;
      this.trigger = !this.trigger;
    },
    setActiveTracks(newTracks: Track[]) {
      this.activeTracks = newTracks;
    },
    setActiveTrack(trackData: {track: object, state: boolean}) {
      this.activeTrack = trackData.track;
      this.isPlaying = trackData.state;
    },
  }
});

export async function loadMetadata(track: Track) {
  try {
    let currentTrack = {
      title: "Chargement...",
      artist: "Inconnu",
      album: "Inconnu",
      cover: "",
      track: {},
      year: 0,
      src: track.src
    };

    const filePath = track.src.replace("file://", "");
    let fileBuffer
    if(typeof window !== "undefined" && window.electron){
      fileBuffer = await window.electron.readFile(filePath);
    }
    if (!fileBuffer) throw new Error("Impossible de lire le fichier");

    const metadata = await parseBlob(new Blob([fileBuffer]));

    currentTrack.title = metadata.common.title || track.title || "Titre inconnu";
    currentTrack.artist = metadata.common.artist || track.artist || "Artiste inconnu";
    currentTrack.album = metadata.common.album || track.album || "Album inconnu";
    currentTrack.track = metadata.common.track || track.track || {};
    currentTrack.year = metadata.common.year || track.year || 0;

    if (typeof metadata.common.picture === "object" && metadata.common.picture?.length > 0) {
      const picture = metadata.common.picture[0];
      const blobUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
      currentTrack.cover = blobUrl;
    } else {
      currentTrack.cover = track.cover || "./public/Images/black.jpg";
    }

    return currentTrack;
  } catch (error) {
    console.error("Erreur lors du chargement des métadonnées :", error);
  }
};