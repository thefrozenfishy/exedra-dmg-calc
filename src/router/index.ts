import { createRouter, createWebHashHistory } from 'vue-router'
import TeamSetupPage from '../pages/TeamSetupPage.vue'
import BestTeamPage from '../pages/BestTeamPage.vue'
import SingleTeamPage from '../pages/SingleTeamPage.vue'
import About from '../pages/About.vue'
import PvpTeamPage from '../pages/PvpTeamPage.vue'

const routes = [
    { path: '/team-setup', name: 'Team Setup', component: TeamSetupPage },
    { path: '/sa-simulator-multiple', name: 'Calculate Best Team', component: BestTeamPage },
    { path: '/sa-simulator-single', name: 'Simulate Single Battle', component: SingleTeamPage },
    { path: '/pvp-simulator', name: 'PvP Simulator', component: PvpTeamPage },
    { path: '/about', name: 'About', component: About },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
