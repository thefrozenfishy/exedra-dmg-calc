import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import "vue3-toastify/dist/index.css" 
import CharacterLink from './components/CharacterLink.vue'
import { useSettingsStore } from './store/settingsStore';
import { useTeamStore, useEnemyStore } from './store/singleTeamStore';

const app = createApp(App)
app.component('CharacterLink', CharacterLink)
app.use(createPinia())

useTeamStore().load()
useEnemyStore().load()
useSettingsStore().load()
app.use(router)
app.mount('#app')
