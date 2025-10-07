import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import "vue3-toastify/dist/index.css" 
import CharacterLink from './components/CharacterLink.vue'

const app = createApp(App)
app.component('CharacterLink', CharacterLink)
app.use(createPinia())
app.use(router)
app.mount('#app')
