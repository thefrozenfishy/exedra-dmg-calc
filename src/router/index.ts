import { createRouter, createWebHashHistory } from 'vue-router'
import TeamSetupPage from '../pages/TeamSetupPage.vue'
import BestTeamPage from '../pages/BestTeamPage.vue'
import SingleTeamPage from '../pages/SingleTeamPage.vue'
import About from '../pages/About.vue'
import AccountHasPage from '../pages/AccountHasPage.vue'
import PvpTeamPage from '../pages/PvpTeamPage.vue'
import LinkRaid from '../pages/LinkRaid.vue'
import GachaRatePage from '../pages/GachaRatePage.vue'
import TierLists from '../pages/TierLists.vue'

const routes = [
    { path: '/team-setup', name: 'Team Setup', component: TeamSetupPage },
    { path: '/sa-simulator-multiple', name: 'Calculate Best Team', component: BestTeamPage },
    { path: '/sa-simulator-single', name: 'Simulate Single Battle', component: SingleTeamPage },
    { path: '/pvp-simulator', name: 'PvP Simulator', component: PvpTeamPage },
    { path: '/link-raid', name: 'Link Raid', component: LinkRaid },
    { path: '/tier-lists', name: 'Tier Lists', component: TierLists },
    { path: '/about', name: 'About', component: About },
    { path: '/my-kioku', name: 'My Kioku', component: AccountHasPage },
    { path: '/gacha-rate', name: 'Gacha Rate+Sim', component: GachaRatePage },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
