<script setup lang="ts">
import CloudSyncWidget from './components/CloudSyncWidget.vue'
import { isBeta } from './utils/betaSettings';
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useSetting } from './store/settingsStore'

const icon = (document.getElementById('app-icon') as HTMLLinkElement | null)?.href ?? ''
const beta = isBeta()
const router = useRouter()

const navRoutes = computed(() =>
  router.getRoutes().filter(r => r.meta?.version != null)
)

const seenVersions = computed(() => {
  const map = new Map<string, ReturnType<typeof useSetting<number>>>()
  for (const route of navRoutes.value) {
    const key = `page_version:${route.path}`
    map.set(route.path, useSetting<number>(key, 0))
  }
  return map
})

function isNew(path: string): boolean {
  const route = router.resolve(path)
  const currentVersion = (route.meta?.version as number | undefined) ?? 0
  const seen = seenVersions.value.get(path)
  return currentVersion > (seen?.value ?? 0)
}

router.afterEach((to) => {
  const version = to.meta?.version as number | undefined
  if (version == null) return
  const seen = seenVersions.value.get(to.path)
  if (seen && seen.value < version) {
    seen.value = version
  }
})

const group1Paths = [
  '/profile',
  '/team-setup',
  '/character-crys',
  '/my-kioku',
  '/kioku-grid',
  '/account-compare',
]
const group2Paths = [
  '/sa-simulator-multiple',
  '/sa-simulator-single',
  '/pvp-simulator',
  '/pvp-how-to',
  '/gacha-rate',
  '/link-raid',
  '/crys-reroll',
  '/about',
]

function routeForPath(path: string) {
  return router.getRoutes().find(r => r.path === path)
}
</script>

<template>
  <div id="app">
    <header>
      <CloudSyncWidget />
      <div class="title-row">
        <img :src="icon" alt="App Icon" class="app-icon" />
        <h1>TFF's Exedra Toolbox</h1>
      </div>
      <nav>
        <div>
          <template v-for="path in group1Paths" :key="path">
            <router-link :to="path" :class="{ 'nav-new': isNew(path) }">
              {{ routeForPath(path)?.name }}
              <span v-if="isNew(path)" class="new-sparkle" aria-label="Updated">✨</span>
            </router-link>
          </template>
        </div>
        <div>
          <template v-for="path in group2Paths" :key="path">
            <router-link :to="path" :class="{ 'nav-new': isNew(path) }">
              {{ routeForPath(path)?.name }}
              <span v-if="isNew(path)" class="new-sparkle" aria-label="Updated">✨</span>
            </router-link>
          </template>
        </div>
        <div v-if="beta">
          <router-link to="/beta">Beta Settings</router-link>
          <router-link to="/analytics">Analytics</router-link>
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 0 auto auto auto;
  padding: 0;
  text-align: center;
  min-width: 850px;
}

header {
  padding: 1rem;
  align-items: center;
}

main {
  margin: 0 auto;
  padding: 2rem;
}

nav a {
  margin: 0 1rem;
  text-decoration: none;
  color: var(--accent-soft);
}

nav a.router-link-active {
  font-weight: bold;
  color: var(--accent-strong);
}

nav a.nav-new {
  position: relative;
  background: linear-gradient(90deg,
      var(--accent-soft) 0%,
      #ffe066 40%,
      #ffb347 60%,
      var(--accent-soft) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
  font-weight: 600;
}

nav a.nav-new.router-link-active {
  -webkit-text-fill-color: transparent;
}

.new-sparkle {
  display: inline-block;
  animation: sparkle-pop 1.4s ease-in-out infinite;
  -webkit-text-fill-color: initial;
  background: none;
  -webkit-background-clip: initial;
  background-clip: initial;
  font-style: normal;
  margin-left: 1px;
}

@keyframes shimmer {
  0% {
    background-position: 200% center;
  }

  100% {
    background-position: -200% center;
  }
}

@keyframes sparkle-pop {

  0%,
  100% {
    transform: scale(1) rotate(-5deg);
  }

  50% {
    transform: scale(1.25) rotate(8deg);
  }
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-icon {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.title-row h1 {
  margin: 0;
  line-height: 1;
}

@media (max-width: 768px) {
  #app {
    min-width: 100%;
  }

  main {
    padding: 1rem;
  }

  .title-row h1 {
    font-size: 1.5em;
  }

  .title-row {
    margin-top: 40px;
  }

  nav a {
    margin: 0 0.25rem;
    font-size: 0.8em;
  }
}

@media (max-width: 480px) {
  main {
    padding: 0.75rem;
  }

  header {
    padding: 0.75rem;
  }

  .title-row h1 {
    font-size: 1.2em;
  }

  .app-icon {
    width: 36px;
    height: 36px;
  }

  nav a {
    margin: 0 0.15rem;
    font-size: 0.65em;
  }
}
</style>
