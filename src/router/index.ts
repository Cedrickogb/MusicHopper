import type { Component } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Songs from '@/views/songs.vue'
import Artists from '@/views/artists.vue'
import Albums from '@/views/albums.vue'
import Playlists from '@/views/playlists.vue'
import Settings from '@/views/settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/songs',
      name: 'songs',
      component: Songs as Component,
    },
    {
      path: '/artists',
      name: 'artists',
      component: Artists as Component,
    },
    {
      path: '/albums',
      name: 'albums',
      component: Albums as Component,
    },
    {
      path: '/playlists',
      name: 'playlists',
      component: Playlists as Component,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings as Component,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
