import { createRouter, createWebHashHistory } from 'vue-router'
import TeamSetupPage from '../pages/TeamSetupPage.vue'
import BestTeamPage from '../pages/BestTeamPage.vue'
import SingleTeamPage from '../pages/SingleTeamPage.vue'
import About from '../pages/About.vue'
import AccountHasPage from '../pages/AccountHasPage.vue'
import PvpTeamPage from '../pages/PvpTeamPage.vue'
import Pvp101Page from '../pages/Pvp101Page.vue'
import LinkRaid from '../pages/LinkRaid.vue'
import CrysReroll from '../pages/CrysReroll.vue'
import GachaRatePage from '../pages/GachaRatePage.vue'
import TierLists from '../pages/TierLists.vue'
import KiokuGridPage from '../pages/KiokuGridPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import AccountComparisonPage from '../pages/AccountComparisonPage.vue'
import BetaStuff from '../pages/BetaStuff.vue'
import AnalyticsDashboard from '../pages/AnalyticsDashboard.vue'
import logEvent from '../utils/analytics'

const base = import.meta.env.BASE_URL

const routes = [
    { path: '/profile', name: 'Profile + Friends', component: ProfilePage },
    { path: '/team-setup', name: 'Kioku Setup', component: TeamSetupPage },
    { path: '/account-compare', name: 'Account Comparison', component: AccountComparisonPage },
    { path: '/sa-simulator-multiple', name: 'Best SA Team Calculator', component: BestTeamPage },
    { path: '/sa-simulator-single', name: 'Single Battle Calculator', component: SingleTeamPage },
    { path: '/pvp-simulator', name: 'PvP Calculator', component: PvpTeamPage },
    { path: '/pvp-how-to', name: 'PvP 101', component: Pvp101Page },
    { path: '/kioku-grid', name: 'Kioku Grid', component: KiokuGridPage },
    { path: '/link-raid', name: 'Link Raid Tool', component: LinkRaid },
    { path: '/crys-reroll', name: 'Crystalis Reroller', component: CrysReroll },
    { path: '/tier-lists', name: 'Tier Lists', component: TierLists },
    { path: '/about', name: 'About', component: About },
    { path: '/my-kioku', name: 'My Kioku Viewer', component: AccountHasPage },
    { path: '/gacha-rate', name: 'Gacha Rate+Sim', component: GachaRatePage },
    { path: '/analytics', name: 'Analytics Dashboard', component: AnalyticsDashboard },
    { path: '/beta', name: 'Beta Settings', component: BetaStuff, meta: { reloadOnLeave: true } },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from) => {
    if (from.meta?.reloadOnLeave) {
        const target = window.location.origin + base + '#' + to.fullPath
        window.location.href = target
        setTimeout(() => window.location.reload(), 50)
        return false
    }
})

router.afterEach((to) => {
    try {
        logEvent('page_view', { path: to.fullPath, name: to.name })
    } catch (err) {
        console.error('Failed to log page view', err)
    }
})
export default router
