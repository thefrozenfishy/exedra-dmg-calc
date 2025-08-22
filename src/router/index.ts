import { createRouter, createWebHistory } from 'vue-router'
import GalleryPage from '../pages/GalleryPage.vue'
import BestTeam from '../pages/BestTeam.vue'
import SingleTeam from '../pages/SingleTeam.vue'

const routes = [
    { path: '/team-setup', name: 'Team Setup', component: GalleryPage },
    { path: '/simulator-multiple', name: 'Calculate Best Team', component: BestTeam },
    { path: '/simulator-single', name: 'Simulate Single Battle', component: SingleTeam },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // <-- uses base from vite.config.ts
    routes,
})

export default router
