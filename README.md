# 🎵 MusicHopper

> Un lecteur de musique de bureau moderne, fluide et cross-platform, conçu pour redécouvrir votre bibliothèque locale.

![MusicHopper Banner](https://private-user-images.githubusercontent.com/123470735/517123715-0c3c681a-c5c1-4c48-8550-141d65891fe1.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM2ODAxNDYsIm5iZiI6MTc2MzY3OTg0NiwicGF0aCI6Ii8xMjM0NzA3MzUvNTE3MTIzNzE1LTBjM2M2ODFhLWM1YzEtNGM0OC04NTUwLTE0MWQ2NTg5MWZlMS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyMFQyMzA0MDZaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00YmM2YTUxMjJiODI2NjI1MDg4MjQzOGQ5NjA1ZTI1NzEyZWYwNTM5MTJlZjM1NmJlNDg5NWFhNDU3NTNiYWYzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.o3kgCnT1PgExNRz1_thx424NVa31yK5By28xyZ9TE7Q)

## 📋 À propos

**MusicHopper** est un projet personnel né de l'envie de créer une expérience musicale locale supérieure. Développé avec **Electron** et **Vue 3**, il combine la performance d'une application native avec la flexibilité des technologies web modernes.

Sa fonctionnalité signature est l'affichage de **paroles synchronisées (Karaoké)** en temps réel, capable de gérer intelligemment les pauses instrumentales pour une immersion totale.

## ✨ Fonctionnalités Clés

### 🎧 Expérience Audio
* **Scan Intelligent :** Importation récursive de dossiers locaux avec extraction rapide des métadonnées (ID3 tags, pochettes) via `music-metadata`.
* **Contrôles Avancés :** File d'attente prioritaire (Queue), lecture aléatoire (Shuffle), boucle et historique de lecture.
* **Formats supportés :** MP3, FLAC, WAV, OGG, M4A.

### 🎤 Paroles Synchronisées (Live Lyrics)
* **Synchronisation Précise :** Utilisation de l'API **Lrclib** pour récupérer les paroles au format LRC.
* **Visualisation Dynamique :** Auto-scroll fluide, surlignage de la ligne active et effets visuels.
* **Gestion Instrumentale :** Détection algorithmique des pauses (>10s) pour afficher des indicateurs visuels (`• • •`) pendant les solos ou intros.
* **Cache Intelligent :** Système de mise en cache en mémoire pour réduire les appels API et garantir un affichage instantané.

### 📂 Gestion de Bibliothèque
* **Playlists Persistantes :** Création et modification de playlists sauvegardées localement (JSON) via le système de fichiers.
* **Architecture Robuste :** Utilisation d'Electron IPC (Inter-Process Communication) pour sécuriser les opérations d'écriture disque.

## 🛠️ Stack Technique

Ce projet est une démonstration de compétences Fullstack JS appliquées au Desktop :

* **Cœur :** [Electron](https://www.electronjs.org/) (Architecture sécurisée avec Context Isolation)
* **Frontend :** [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
* **State Management :** [Pinia](https://pinia.vuejs.org/) (Stores modulaires pour le Player et les Data)
* **UI/UX :** [TailwindCSS](https://tailwindcss.com/) (Design réactif et moderne)
* **Langage :** [TypeScript](https://www.typescriptlang.org/) (Typage strict pour la maintenabilité)
* **Build :** [Vite](https://vitejs.dev/) & Electron-Builder
