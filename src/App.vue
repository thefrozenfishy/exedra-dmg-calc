<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<template>
  <div id="app">
    <header>
      <h1>TFF's mess of a toolbox</h1>
      <nav>
        <router-link to="/team-setup">Team Setup</router-link>
        <router-link to="/my-kioku">My Kioku</router-link>
        <router-link to="/sa-simulator-multiple">Calculate Best Team</router-link>
        <router-link to="/sa-simulator-single">Simulate Single Battle</router-link>
        <router-link to="/pvp-simulator">PvP Simulator</router-link>
        <router-link to="/link-raid">Link Raid</router-link>
        <!--router-link to="/tier-lists">Tier Lists</router-link-->
        <router-link to="/about">About</router-link>
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
</style>
