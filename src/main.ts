import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import "vue3-toastify/dist/index.css"
import CharacterLink from './components/CharacterLink.vue'
import { useSettingsStore } from './store/settingsStore';
import { useCharacterStore } from './store/characterStore'
import { useTeamStore, useEnemyStore, usePvPStore } from './store/singleTeamStore';
import { useFriendStore } from './store/friendStore';

const app = createApp(App)
app.component('CharacterLink', CharacterLink)
app.use(createPinia())
if (import.meta.env.DEV) {
    const favicon = document.getElementById("app-icon") as HTMLLinkElement;
    favicon.href = favicon.href.replace("icon.png", "icon-dev.png?v=" + Date.now());
} else if (localStorage.getItem("beta")) {
    const favicon = document.getElementById("app-icon") as HTMLLinkElement;
    favicon.href = favicon.href.replace("icon.png", "icon-beta.png?v=" + Date.now());
}
await useCharacterStore().initializeCloud()
await useFriendStore().initialize()
useTeamStore().load()
usePvPStore().load()
useEnemyStore().load()
useSettingsStore().load()
app.use(router)
app.mount('#app')
