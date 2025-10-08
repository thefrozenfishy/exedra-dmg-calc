<script setup>
import { ref, computed } from 'vue'
import kiokuDataJson from '../assets/base_data/kioku_data.json'
import yaml from 'js-yaml'
import sharedConfigRaw from '../content/tierlists/master.yaml?raw'

const sharedConfig = yaml.load(sharedConfigRaw)
const sharedRoles = sharedConfig.roles || [] // TODO: Use the roles? How, where?
const sharedTags = sharedConfig.tags || []

const props = defineProps({
  info: Object
})

const tagInfo = Object.fromEntries([
  ...sharedTags.map(t => [t.name, { ...t }]),
  ...props.info.meta.tags.map(t => [t.name, { ...t }]),
])
const roleInfo = Object.fromEntries([
  ...sharedRoles.map(t => [t.name, { ...t }]),
  ...props.info.meta.roles.filter(r => r.name).map(t => [t.name, { ...t }]),
])

const files = Object.fromEntries(
  Object.entries(import.meta.glob('../content/tierlists/kioku/*/*.md', { eager: true }))
    .filter(f =>
      f[0].includes(props.info.name)
    ))

const entries = Object.entries(files).map(([path, mod]) => ({
  name: path.split('/').at(-2).replace('.md', '').replace('´', "'"),
  meta: mod.frontmatter || {},
  Component: mod.default
}))

const ranks = props.info.meta.ranks
const allRoles = props.info.meta.roles.map(r => r.name ? r.name : r)

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

const charKey = char => `${char.name}${char.meta.ascension ?? 0}`

const expanded = ref(null)
function toggleExpanded(char) {
  expanded.value = expanded.value === charKey(char) ? null : charKey(char)
}

function normalizeColor(value) {
  // Add '#' if it's a hex without one
  if (/^[0-9A-Fa-f]{3,6}$/.test(value)) return `#${value}`
  return value
}
</script>

<template>
  <div class="tier-list">
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
                <div v-for="char in entriesByRole(entriesByRank[rank])[role]" :key="char.name"
                  class="character-card relative" @click="toggleExpanded(char)">
                  <div class="character-img-wrapper">
                    <img :src="`/exedra-dmg-calc/kioku_images/${kiokuDataJson[char.name].id}_thumbnail.png`"
                      :alt="char.name" class="character-img" />

                    <div v-if="char.meta.ascension" class="ascension-overlay">
                      <img :src="`/exedra-dmg-calc/ascension_background.png`" class="ascension-icon" />
                      <span class="ascension-number">{{ char.meta.ascension }}</span>
                    </div>
                  </div>

                  <div class="tags" @click="toggleExpanded(char)">
                    <div v-for="tag in char.meta.tags || []" :key="tag" class="tag-wrapper">
                      <span class="tag" :style="`background-color: ${normalizeColor(tagInfo[tag]?.color)}`">
                        {{ tag }}
                      </span>
                      <div v-if="tagInfo[tag]?.description" class="tooltip">
                        {{ tagInfo[tag]?.description }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="entriesByRank[rank].some(c => expanded === charKey(c))">
            <td colspan="100%" class="expanded-row">
              <div v-for="char in entriesByRank[rank]">
                <component :key="char.name" v-if="expanded === charKey(char)" :is="char.Component" />
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
  position: relative;
  text-align: center;
}

.character-img-wrapper {
  position: relative;
  display: inline-block;
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

.ascension-overlay {
  position: absolute;
  bottom: -3px;
  left: -3px;
  width: 30px;
  height: 30px;
}

.ascension-icon {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.ascension-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: black;
  font-size: 15px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.25rem;
  gap: 0.25rem;
}

.tag-wrapper {
  position: relative;
  display: inline-block;
}

.tag {
  color: #fff;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  background-color: #555;
  cursor: pointer;
  user-select: none;
  transition: filter 0.2s;
}

.tag:hover {
  filter: brightness(1.2);
}

.tooltip {
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e1e1e;
  color: #eee;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  white-space: normal;
  width: max-content;
  max-width: 180px;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 100;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1e1e1e transparent transparent transparent;
}

.tag-wrapper:hover .tooltip {
  opacity: 1;
  transform: translateX(-50%);
}


.expanded-row {
  background-color: #1a1a1a;
  padding: 0.5rem;
}
</style>
