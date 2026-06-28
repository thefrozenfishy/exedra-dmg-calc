<template>
  <div class="setup-page">
    <h1 class="page-title">Kioku Setup</h1>
    <p class="page-subtitle">
      Defaults used in Single Battle Simulator and Best Team calculator.
    </p>

    <section class="toolbar card">
      <div class="toolbar-left">
        <button class="btn" @click="exportCharacters()">Export</button>
        <label class="btn">
          Import
          <input type="file" accept="application/json" @change="handleFileChange" />
        </label>
      </div>
      <div class="toolbar-right rarity-toggles">
        <label class="chip" :class="{ active: show4stars }">
          <input type="checkbox" v-model="show4stars" /> ★★★★
        </label>
        <label class="chip" :class="{ active: show3stars }">
          <input type="checkbox" v-model="show3stars" /> ★★★
        </label>
      </div>
    </section>

    <section class="filters card">
      <span class="filters-heading">Filters</span>

      <label class="chip" :class="{ active: filters.hideUnowned }">
        <input type="checkbox" v-model="filters.hideUnowned" /> Hide unowned
      </label>

      <div class="filter-group">
        <span class="filter-group-label">Heartphial</span>
        <label class="chip" :class="{ active: filters.heartphialMax === false }">
          <input type="radio" name="hp-filter" :value="false" v-model="filters.heartphialMax" /> Not max
        </label>
        <label class="chip" :class="{ active: filters.heartphialMax === true }">
          <input type="radio" name="hp-filter" :value="true" v-model="filters.heartphialMax" /> Max
        </label>
        <button class="chip clear-chip" v-if="filters.heartphialMax !== null"
          @click="filters.heartphialMax = null">✕</button>
      </div>

      <div class="filter-group">
        <span class="filter-group-label">SP</span>
        <label class="chip" :class="{ active: filters.spMax === false }">
          <input type="radio" name="sp-filter" :value="false" v-model="filters.spMax" /> Not max
        </label>
        <label class="chip" :class="{ active: filters.spMax === true }">
          <input type="radio" name="sp-filter" :value="true" v-model="filters.spMax" /> Max
        </label>
        <button class="chip clear-chip" v-if="filters.spMax !== null" @click="filters.spMax = null">✕</button>
      </div>

      <div class="filter-group">
        <span class="filter-group-label">Magic</span>
        <label class="chip" :class="{ active: filters.magicMax === false }">
          <input type="radio" name="magic-filter" :value="false" v-model="filters.magicMax" /> Not max
        </label>
        <label class="chip" :class="{ active: filters.magicMax === true }">
          <input type="radio" name="magic-filter" :value="true" v-model="filters.magicMax" /> Max
        </label>
        <button class="chip clear-chip" v-if="filters.magicMax !== null" @click="filters.magicMax = null">✕</button>
      </div>

      <button class="btn btn-sm clear-all-btn" v-if="anyFilterActive" @click="clearFilters">Clear all</button>
    </section>

    <section class="bulk-set card">
      <span class="filters-heading">Set for all visible Kioku</span>
      <div class="bulk-fields">
        <label v-for="stat in stats" :key="stat.key" class="bulk-field">
          <span class="bulk-label">{{ stat.label }}</span>
          <input type="number" :min="stat.min" :max="stat.max" :placeholder="`—`"
            @input="e => pendingBulk[stat.key] = (e.target as HTMLInputElement).valueAsNumber" />
        </label>
        <button class="btn btn-apply" @click="applyBulk">Apply</button>
      </div>
    </section>

    <div class="list-header">
      <span>Character</span>
      <span>Asc · Kioku · Magic · HP · SP</span>
      <span>Crystalis</span>
      <span>Portrait</span>
    </div>

    <div v-for="(chars, role) in groupedCharacters" :key="role" class="role-section">
      <button class="role-header" @click="toggleRole(role)" :aria-expanded="!collapsedRoles[role]">
        <span class="role-chevron" :class="{ rotated: collapsedRoles[role] }">▾</span>
        <span class="role-name">{{ role }}</span>
        <span class="role-count">{{ visibleCountFor(chars) }} / {{ chars.length }}</span>
      </button>

      <div v-show="!collapsedRoles[role]" class="role-body">
        <CharacterCard v-for="char in chars" :key="char.id" :character="char" :show3stars="show3stars"
          :show4stars="show4stars" :filters="filters" />
        <div v-if="visibleCountFor(chars) === 0" class="empty-role">
          No Kioku match the current filters in this group.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue'
import CharacterCard from '../components/CharacterCard.vue/index.js'
import { useCharacterStore } from '../store/characterStore.js'
import { Character, KiokuConstants } from '../types/KiokuTypes.js'
import { useSetting } from '../store/settingsStore.js'

export default defineComponent({
  components: { CharacterCard },
  setup() {
    const store = useCharacterStore()
    const show4stars = useSetting('show4stars', false)
    const show3stars = useSetting('show3stars', false)

    const filters = reactive<{
      hideUnowned: boolean
      heartphialMax: boolean | null
      spMax: boolean | null
      magicMax: boolean | null
    }>({
      hideUnowned: false,
      heartphialMax: null,
      spMax: null,
      magicMax: null,
    })

    const anyFilterActive = computed(() =>
      filters.hideUnowned ||
      filters.heartphialMax !== null ||
      filters.spMax !== null ||
      filters.magicMax !== null
    )

    function clearFilters() {
      filters.hideUnowned = false
      filters.heartphialMax = null
      filters.spMax = null
      filters.magicMax = null
    }

    const collapsedRoles = useSetting<Record<string, boolean>>("collapsedRoles", {})
    function toggleRole(role: string) {
      collapsedRoles.value[role] = !collapsedRoles.value[role]
    }

    const groupedCharacters = computed(() => {
      const groups: Record<string, typeof store.characters> = {}
      store.characters.forEach(char => {
        if (!groups[char.role]) groups[char.role] = []
        groups[char.role].push(char)
      })
      for (const role in groups) {
        groups[role] = groups[role].slice().sort((a, b) => a.id - b.id)
      }
      return groups
    })

    function isCharVisible(char: Character): boolean {
      if (char.rarity === 3 && !show3stars.value) return false
      if ((char.rarity === 4 || char.name === 'Lux☆Magica') && !show4stars.value) return false
      if (filters.hideUnowned && !char.enabled) return false
      if (char.enabled) {
        if (filters.heartphialMax === true && char.heartphialLvl < KiokuConstants.maxHeartphialLvl) return false
        if (filters.heartphialMax === false && char.heartphialLvl >= KiokuConstants.maxHeartphialLvl) return false
        if (filters.spMax === true && char.specialLvl < KiokuConstants.maxSpecialLvl) return false
        if (filters.spMax === false && char.specialLvl >= KiokuConstants.maxSpecialLvl) return false
        if (filters.magicMax === true && char.magicLvl < KiokuConstants.maxMagicLvl) return false
        if (filters.magicMax === false && char.magicLvl >= KiokuConstants.maxMagicLvl) return false
      }
      return true
    }

    function visibleCountFor(chars: typeof store.characters) {
      return chars.filter(isCharVisible).length
    }

    const stats = [
      { key: 'ascension', label: 'Ascension', min: 0, max: KiokuConstants.maxAscension },
      { key: 'kiokuLvl', label: 'Kioku Lvl', min: 1, max: KiokuConstants.maxKiokuLvl },
      { key: 'magicLvl', label: 'Magic Lvl', min: 0, max: KiokuConstants.maxMagicLvl },
      { key: 'heartphialLvl', label: 'HP Lvl', min: 1, max: KiokuConstants.maxHeartphialLvl },
      { key: 'specialLvl', label: 'SP Lvl', min: 1, max: KiokuConstants.maxSpecialLvl },
    ]

    const pendingBulk = reactive<Record<string, number>>({})

    function applyBulk() {
      const visibleChars = store.characters.filter(isCharVisible)
      store.setCharacters(
        store.characters.map(char => {
          if (!visibleChars.includes(char)) return char
          const updated = { ...char }
          for (const [key, val] of Object.entries(pendingBulk)) {
            if (!isNaN(val)) updated[key] = val
          }
          return updated
        })
      )
    }

    function handleFileChange(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        store.importCharacters(file).catch(err => alert('Import failed: ' + err.message))
      }
    }

    return {
      show4stars,
      show3stars,
      filters,
      anyFilterActive,
      clearFilters,
      collapsedRoles,
      toggleRole,
      groupedCharacters,
      visibleCountFor,
      stats,
      pendingBulk,
      applyBulk,
      handleFileChange,
      exportCharacters: store.exportCharacters,
    }
  },
})
</script>

<style scoped>
/* ── Page ── */
.setup-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 4rem;
}

.page-title {
  font-size: 2rem;
  margin: 0 0 0.25rem;
  color: var(--text);
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0 0 1.25rem;
}

/* ── Cards ── */
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.65rem 1rem;
  margin-bottom: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

/* ── Toolbar ── */
.toolbar {
  justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Buttons ── */
.btn {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.4em 0.9em;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: var(--border-strong);
}

.btn input[type="file"] {
  display: none;
}

.btn-sm {
  padding: 0.28rem 0.65rem;
  font-size: 0.78rem;
}

.btn-apply {
  background: rgba(246, 212, 133, 0.1);
  border-color: var(--border-strong);
  color: var(--accent);
  align-self: flex-end;
}

.btn-apply:hover {
  background: rgba(246, 212, 133, 0.18);
  border-color: var(--accent-strong);
}

/* ── Chips ── */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--muted);
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  user-select: none;
}

.chip input {
  display: none;
}

.chip.active {
  background: rgba(246, 212, 133, 0.1);
  border-color: var(--border-strong);
  color: var(--accent);
}

.clear-chip {
  background: none;
  border-color: transparent;
  color: var(--muted);
  padding: 0.1rem 0.4rem;
  opacity: 0.7;
}

.clear-chip:hover {
  opacity: 1;
  color: var(--danger);
  border-color: transparent;
  background: none;
}

.clear-all-btn {
  margin-left: auto;
}

/* ── Filter bar ── */
.filters-heading {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-right: 0.25rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.filter-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-left: 1px solid var(--border);
  padding-left: 0.65rem;
}

.filter-group-label {
  font-size: 0.74rem;
  color: var(--muted);
  margin-right: 2px;
}

/* ── Bulk set ── */
.bulk-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.5rem;
  width: 100%;
}

.bulk-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bulk-label {
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  opacity: 0.75;
}

.bulk-field input {
  width: 60px;
  text-align: center;
}

/* ── Column header (sticky) ── */
.list-header {
  display: grid;
  grid-template-columns: 180px auto 140px 1fr;
  gap: 0 0.75rem;
  padding: 0.3rem 0.75rem;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  border-bottom: 1px solid var(--border-strong);
  margin-bottom: 0.2rem;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  opacity: 0.8;
}

/* ── Role sections ── */
.role-section {
  margin-bottom: 0.4rem;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  text-align: left;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s;
}

.role-header:hover {
  background: var(--bg-soft);
  border-color: var(--border-strong);
}

.role-chevron {
  font-size: 1rem;
  line-height: 1;
  transition: transform 0.2s;
  color: var(--muted);
}

.role-chevron.rotated {
  transform: rotate(-90deg);
}

.role-name {
  flex: 1;
  color: var(--accent-soft);
}

.role-count {
  font-size: 0.74rem;
  color: var(--muted);
  font-weight: 400;
}

.role-body {
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  overflow: hidden;
}

.empty-role {
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
  opacity: 0.6;
}
</style>
