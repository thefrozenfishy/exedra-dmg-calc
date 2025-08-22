import { createRouter, createWebHashHistory } from 'vue-router'
import GalleryPage from '../pages/GalleryPage.vue'
import BestTeam from '../pages/BestTeam.vue'
import SingleTeam from '../pages/SingleTeam.vue'

const routes = [
    { path: '/team-setup', name: 'Team Setup', component: GalleryPage },
    { path: '/simulator-multiple', name: 'Calculate Best Team', component: BestTeam },
    { path: '/simulator-single', name: 'Simulate Single Battle', component: SingleTeam },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
