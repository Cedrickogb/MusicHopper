import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Buffer } from 'buffer';
import { createPinia } from 'pinia';
window.Buffer = Buffer;


const app = createApp(App)
app.use(createPinia());
app.use(router)

app.mount('#app')
