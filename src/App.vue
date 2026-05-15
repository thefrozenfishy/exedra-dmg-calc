<script setup lang="ts">
import CloudSyncWidget from './components/CloudSyncWidget.vue'
const icon = document.getElementById('app-icon').href
const beta = localStorage.getItem('beta') === 'true'
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
          <router-link to="/team-setup">Kioku Setup</router-link>
          <router-link to="/profile">Profile + Friends</router-link>
          <router-link to="/my-kioku">My Kioku Viewer</router-link>
          <router-link to="/kioku-grid">Kioku Grid</router-link>
          <router-link to="/account-compare">Account Comparison</router-link>
        </div>
        <div>
          <router-link to="/sa-simulator-multiple">Best SA Team Calculator</router-link>
          <router-link to="/sa-simulator-single">Single Battle Calculator</router-link>
          <router-link to="/pvp-simulator">PvP Calculator</router-link>
          <router-link to="/pvp-how-to">PvP 101</router-link>
          <router-link to="/gacha-rate">Gacha Rate+Sim</router-link>
          <router-link to="/link-raid">Link Raid Tool</router-link>
          <router-link to="/crys-reroll">Crystalis Reroller</router-link>
          <!--router-link to="/tier-lists">Tier Lists</router-link-->
          <router-link to="/about">About</router-link>
        </div>
        <div v-if="beta">
          <router-link to="/beta">Beta Settings</router-link>
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>


<style>
html,
body,
#app {
  height: 100%;
}

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
  color: #e4afd4;
}

nav a.router-link-active {
  font-weight: bold;
  color: #860a67;
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

.app-icon {
  transform: translateY(2px);
}
</style>
