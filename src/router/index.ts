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
import CharacterCrysPage from '../pages/CharacterCrysPage.vue'
import GachaRatePage from '../pages/GachaRatePage.vue'
import TierLists from '../pages/TierLists.vue'
import KiokuGridPage from '../pages/KiokuGridPage.vue'
import HeartphialPage from '../pages/HeartphialPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import AccountComparisonPage from '../pages/AccountComparisonPage.vue'
import BetaStuff from '../pages/BetaStuff.vue'
import AnalyticsDashboard from '../pages/AnalyticsDashboard.vue'
import logEvent from '../utils/analytics'

const base = import.meta.env.BASE_URL

const routes = [
    { path: '/profile', name: 'Profile + Friends', component: ProfilePage, meta: { version: 0 } },
    { path: '/team-setup', name: 'Kioku Setup', component: TeamSetupPage, meta: { version: 2 } },
    { path: '/account-compare', name: 'Account Comparison', component: AccountComparisonPage, meta: { version: 0 } },
    { path: '/sa-simulator-multiple', name: 'Best SA Team Calculator', component: BestTeamPage, meta: { version: 0 } },
    { path: '/sa-simulator-single', name: 'Single Battle Calculator', component: SingleTeamPage, meta: { version: 0 } },
    { path: '/pvp-simulator', name: 'PvP Calculator', component: PvpTeamPage, meta: { version: 0 } },
    { path: '/pvp-how-to', name: 'PvP 101', component: Pvp101Page, meta: { version: 0 } },
    { path: '/kioku-grid', name: 'Kioku Grid', component: KiokuGridPage, meta: { version: 0 } },
    { path: '/heartphial', name: 'Heartphial', component: HeartphialPage, meta: { version: 1 } },
    { path: '/link-raid', name: 'Link Raid Tool', component: LinkRaid, meta: { version: 0 } },
    { path: '/crys-reroll', name: 'Crystalis Reroller', component: CrysReroll, meta: { version: 0 } },
    { path: '/character-crys', name: 'Character Crystalis', component: CharacterCrysPage, meta: { version: 1 } },
    { path: '/tier-lists', name: 'Tier Lists', component: TierLists, meta: { version: 0 } },
    { path: '/about', name: 'About', component: About, meta: { version: 0 } },
    { path: '/my-kioku', name: 'My Kioku Viewer', component: AccountHasPage, meta: { version: 0 } },
    { path: '/gacha-rate', name: 'Gacha Rate+Sim', component: GachaRatePage, meta: { version: 0 } },
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
