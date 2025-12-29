import { createRouter, createWebHashHistory } from 'vue-router'
import TeamSetupPage from '../pages/TeamSetupPage.vue'
import BestTeamPage from '../pages/BestTeamPage.vue'
import SingleTeamPage from '../pages/SingleTeamPage.vue'
import About from '../pages/About.vue'
import AccountHasPage from '../pages/AccountHasPage.vue'
import PvpTeamPage from '../pages/PvpTeamPage.vue'
import Pvp101Page from '../pages/Pvp101Page.vue'
import LinkRaid from '../pages/LinkRaid.vue'
import GachaRatePage from '../pages/GachaRatePage.vue'
import TierLists from '../pages/TierLists.vue'

const routes = [
    { path: '/team-setup', name: 'Kioku Setup', component: TeamSetupPage },
    { path: '/sa-simulator-multiple', name: 'Best SA Team Calculator', component: BestTeamPage },
    { path: '/sa-simulator-single', name: 'Single Battle Calculator', component: SingleTeamPage },
    { path: '/pvp-simulator', name: 'PvP Calculator', component: PvpTeamPage },
    { path: '/pvp-how-to', name: 'PvP 101', component: Pvp101Page },
    { path: '/link-raid', name: 'Link Raid Tool', component: LinkRaid },
    { path: '/tier-lists', name: 'Tier Lists', component: TierLists },
    { path: '/about', name: 'About', component: About },
    { path: '/my-kioku', name: 'My Kioku Viewer', component: AccountHasPage },
    { path: '/gacha-rate', name: 'Gacha Rate+Sim', component: GachaRatePage },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
