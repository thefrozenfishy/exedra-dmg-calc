import { createRouter, createWebHashHistory } from 'vue-router'
import TeamSetupPage from '../pages/TeamSetupPage.vue'
import BestTeamPage from '../pages/BestTeamPage.vue'
import SingleTeamPage from '../pages/SingleTeamPage.vue'

const routes = [
    { path: '/team-setup', name: 'Team Setup', component: TeamSetupPage },
    { path: '/simulator-multiple', name: 'Calculate Best Team', component: BestTeamPage },
    { path: '/simulator-single', name: 'Simulate Single Battle', component: SingleTeamPage },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
