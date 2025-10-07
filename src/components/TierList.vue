<script setup>
import { ref, computed } from 'vue'
import kiokuDataJson from '../assets/base_data/kioku_data.json'

const props = defineProps({
  folder: String
})

const expanded = ref(null)

const folderMap = {
  Raid: import.meta.glob('../content/tierlists/raid/*.md', { eager: true }),
  PvP: import.meta.glob('../content/tierlists/pvp/*.md', { eager: true }),
}

const files = folderMap[props.folder] || {}

const entries = Object.entries(files).map(([path, mod]) => ({
  name: path.split('/').pop().replace('.md', '').replace('´', "'"),
  meta: mod.frontmatter || {},
  Component: mod.default
}))

const ranks = ['0', '0.5', '1', '2', '3', 'For Fun', 'Unranked', 'Unplayable']

const allRoles = [...new Set(entries.map(e => kiokuDataJson[e.name].role))]

const entriesByRank = computed(() => {
  const map = {}
  ranks.forEach(rank => (map[rank] = []))
  entries.forEach(entry => {
    const r = entry.meta.rank ?? 'Unranked'
    if (!map[r]) map[r] = []
    map[r].push(entry)
  })
  return map
})

function entriesByRole(entries) {
  const map = {}
  allRoles.forEach(r => (map[r] = []))
  entries.forEach(e => {
    const role = kiokuDataJson[e.name].role
    map[role].push(e)
  })
  return map
}

function toggleExpanded(name) {
  expanded.value = expanded.value === name ? null : name
  console.log(expanded.value)
}
</script>

<template>
  <div class="tier-list">
    <h2>{{ folder }} Tier List</h2>

    <table class="tier-table">
      <thead>
        <tr>
          <th>Rank / Role</th>
          <th v-for="role in allRoles" :key="role">{{ role }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="rank in ranks" :key="rank">
          <tr>
            <td class="rank-cell">{{ rank }}</td>
            <td v-for="role in allRoles" :key="role">
              <div class="characters-cell">
                <div v-for="char in entriesByRole(entriesByRank[rank])[role]" :key="char.name" class="character-card">
                  <img :src="`/exedra-dmg-calc/kioku_images/${kiokuDataJson[char.name].id}_thumbnail.png`"
                    :alt="char.name" class="character-img" @click="toggleExpanded(char.name)" />
                  <div class="tags" @click="toggleExpanded(char.name)">
                    <span v-for="tag in char.meta.tags || []" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="entriesByRank[rank].some(c => expanded === c.name)">
            <td colspan="100%" class="expanded-row">
              <div v-for="char in entriesByRank[rank]">
                <component :key="char.name" v-if="expanded === char.name" :is="char.Component" />
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tier-list {
  max-width: 1000px;
  margin: 0 auto;
  font-family: sans-serif;
  color: #ddd;
}

.tier-table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #444;
  padding: 0.5rem;
  vertical-align: top;
}

th {
  background-color: #222;
  text-align: left;
}

.rank-cell {
  font-weight: bold;
  background-color: #333;
}

.characters-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.character-card {
  cursor: pointer;
  text-align: center;
}

.character-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
  border: 1px solid #666;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.25rem;
  gap: 0.25rem;
}

.tag {
  font-size: 0.65rem;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  background-color: #555;
}

.expanded-row {
  background-color: #1a1a1a;
  padding: 0.5rem;
}
</style>
