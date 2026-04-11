import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import "vue3-toastify/dist/index.css"
import CharacterLink from './components/CharacterLink.vue'
import { useSettingsStore } from './store/settingsStore';
import { useTeamStore, useEnemyStore, usePvPStore } from './store/singleTeamStore';

const app = createApp(App)
app.component('CharacterLink', CharacterLink)
app.use(createPinia())
if (import.meta.env.DEV) {
    const favicon = document.getElementById("app-icon") as HTMLLinkElement;
    favicon.href = favicon.href.replace("icon", "icon-dev");
}
useTeamStore().load()
usePvPStore().load()
useEnemyStore().load()
useSettingsStore().load()
app.use(router)
app.mount('#app')
