<template>
  <div v-if="isVisible" class="character-row" :class="{ 'character-row--disabled': !character.enabled }">
    <div class="col col-identity" @click="toggleCharacter" title="Toggle owned">
      <img :src="imgSrc" :alt="character.name" class="char-thumb" :class="{ faded: !character.enabled }" />
      <div class="char-names">
        <span class="char-name">{{ character.name }}</span>
        <span class="char-name-en">{{ character.character_en }}</span>
        <span class="rarity-stars">{{ '★'.repeat(character.rarity) }}</span>
      </div>
    </div>

    <template v-if="character.enabled">
      <div class="col col-stats">
        <span class="col-heading">Stats</span>
        <div class="stats-section">
          <div class="stats-grid">
            <label class="stat-cell">
              <span class="cell-label">Asc</span>
              <input type="number" :min="0" :max="maxAscension" :value="character.ascension"
                :class="{ 'at-max': character.ascension >= maxAscension }"
                @input="updateStat('ascension', 0, maxAscension, $event?.target?.valueAsNumber)" />
            </label>

            <label v-for="s in levelStats" :key="s.key" class="stat-cell">
              <span class="cell-label">{{ s.short }}</span>
              <input type="number" :min="s.min" :max="s.max" :value="character[s.key]"
                :class="{ 'at-max': character[s.key] >= s.max }"
                @input="updateStat(s.key, s.min, s.max, $event?.target?.valueAsNumber)" />
            </label>
          </div>

          <div class="derived-grid">
            <div v-for="stat in derivedStats" :key="stat.short" class="derived-cell">
              <span class="cell-label">{{ stat.short }}</span>
              <span class="derived-value">{{ stat.value ?? '…' }}</span>
            </div>
          </div>

          <div v-if="showResourceCosts" class="resource-block">
            <div class="resource-row">
              <span class="resource-chip" @click="toggleMissingAndWhole">
                <img :src="`/exedra-dmg-calc/items/exp.png`" alt="Kioku Exp" />
                {{ formatAmount(kiokuLevelCost.exp.current, kiokuLevelCost.exp.max) }}
              </span>
              <span class="resource-chip" @click="toggleMissingAndWhole">
                <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
                {{ formatAmount(kiokuLevelCost.gold.current, kiokuLevelCost.gold.max) }}
              </span>
            </div>
            <div class="resource-row">
              <span v-for="i in [1, 2, 3, 4, 5, 6, 7, 8]" :key="i" class="resource-chip" @click="toggleMissingAndWhole">
                <img :src="itemIdxToImg(i)" :alt="`Item idx ${i}`" />
                {{ formatAmount(magicLevelCost.items.current[i] ?? 0, magicLevelCost.items.max[i] ?? 0) }}
              </span>
              <span class="resource-chip" @click="toggleMissingAndWhole">
                <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
                {{ formatAmount(magicLevelCost.gold.current, magicLevelCost.gold.max) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col col-crystalis">
        <span class="col-heading">Crystalis</span>
        <div class="crys-slots">
          <CrysSelector v-for="slot in 3" :key="slot" :character-id="character.id" :model-value="getSelectedCrys(slot)"
            placeholder="—" @update:model-value="id => setCrys(slot, id)" :include-low-rarity="false"
            :character-element="character.element" />
        </div>
      </div>

      <div class="col col-portrait">
        <span class="col-heading">Portrait</span>
        <PortraitSelector class="edit-port-btn" v-model="character.portrait" :element="character.element" />
        <router-link class="edit-crys-btn" :to="{ path: '/character-crys', query: { character_id: character.id } }">
          Edit SubCrys
        </router-link>
      </div>
    </template>

    <template v-else>
      <div class="col col-disabled-msg">
        <span>Not owned — click to enable</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { useCharacterStore } from '../store/characterStore'
import PortraitSelector from './PortraitSelector.vue'
import CrysSelector from './CrysSelector.vue'
import { Character, KiokuConstants } from '../types/KiokuTypes'
import { crystalises, kiokuLevelCosts, magicLevelCosts } from '../utils/helpers'
import { LuxMagica } from '../types/enums'
import { getCachedStats, scheduleBackfill } from '../utils/statsBackfill'

export default defineComponent({
  name: 'CharacterCard',
  components: { PortraitSelector, CrysSelector },
  props: {
    character: {
      type: Object as () => Character,
      required: true,
    },
    show3stars: {
      type: Boolean,
      required: true,
    },
    show4stars: {
      type: Boolean,
      required: true,
    },
    filters: {
      type: Object as () => {
        heartphialMax: boolean | null
        spMax: boolean | null
        magicMax: boolean | null
        hideUnowned: boolean
      },
      required: true,
    },
    showResourceCosts: {
      type: Boolean,
      required: true,
    },
    formatAmount: {
      type: Function as PropType<(current: number, max: number) => string>,
      required: true,
    },
    toggleMissingAndWhole: {
      type: Function as PropType<() => void>,
      default: () => { },
    },
    usePlayerLevelAsKiokuMaxLevel: {
      type: Boolean,
      required: true,
    },
    playerLevel: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const store = useCharacterStore()

    const maxAscension = KiokuConstants.maxAscension

    const levelStats = [
      { key: 'kiokuLvl', short: 'Kioku', min: 1, max: KiokuConstants.maxKiokuLvl },
      { key: 'magicLvl', short: 'Magic', min: 0, max: KiokuConstants.maxMagicLvl },
      { key: 'heartphialLvl', short: 'HP', min: 1, max: KiokuConstants.maxHeartphialLvl },
      { key: 'specialLvl', short: 'SP', min: 1, max: KiokuConstants.maxSpecialLvl },
    ]

    const derivedStats = computed(() => {
      const cached = getCachedStats(props.character)
      if (!cached) scheduleBackfill([props.character], { priority: true })
      return [
        { short: 'HP', value: cached?.hp },
        { short: 'ATK', value: cached?.atk },
        { short: 'DEF', value: cached?.def },
        { short: 'PWR', value: cached?.pwr },
      ]
    })

    const kiokuLevelCost = computed(() => {
      const kiokuMaxLvl = props.usePlayerLevelAsKiokuMaxLevel
        ? props.playerLevel
        : KiokuConstants.maxKiokuLvl

      const currLvl = Math.min(Math.max(props.character.kiokuLvl ?? 0, 1), kiokuMaxLvl)
      const current = kiokuLevelCosts[currLvl] ?? kiokuLevelCosts[0]
      const max = kiokuLevelCosts[kiokuMaxLvl] ?? current

      return {
        exp: { current: current.exp, max: max.exp },
        gold: { current: current.gold, max: max.gold },
      }

    })

    const magicLevelCost = computed(() => {
      const currLvl = Math.min(Math.max(props.character.magicLvl ?? 0, 0), KiokuConstants.maxMagicLvl)
      const current = magicLevelCosts[props.character.id]?.[currLvl] ?? magicLevelCosts[10010101]?.[currLvl]
      const max = magicLevelCosts[props.character.id]?.[KiokuConstants.maxMagicLvl] ?? current
      return {
        gold: { current: current.gold, max: max.gold },
        items: { current: current.items, max: max.items },
      }
    })

    function itemIdxToImg(idx: number) {
      return `/exedra-dmg-calc/items/${props.character.element?.toLowerCase()}/${idx}.png`
    }

    const imgSrc = computed(
      () => `/exedra-dmg-calc/kioku_images/${props.character.id}_thumbnail.png`
    )

    const isVisible = computed(() => {
      const c = props.character
      if (c.rarity === 3 && !props.show3stars) return false
      if ((c.rarity === 4 || c.name === LuxMagica) && !props.show4stars) return false
      if (props.filters.hideUnowned && !c.enabled) return false
      if (c.enabled) {
        const f = props.filters
        if (f.heartphialMax === true && c.heartphialLvl < KiokuConstants.maxHeartphialLvl) return false
        if (f.heartphialMax === false && c.heartphialLvl >= KiokuConstants.maxHeartphialLvl) return false
        if (f.spMax === true && c.specialLvl < KiokuConstants.maxSpecialLvl) return false
        if (f.spMax === false && c.specialLvl >= KiokuConstants.maxSpecialLvl) return false
        if (f.magicMax === true && c.magicLvl < KiokuConstants.maxMagicLvl) return false
        if (f.magicMax === false && c.magicLvl >= KiokuConstants.maxMagicLvl) return false
      }
      return true
    })

    const toggleCharacter = () => store.toggleCharacter(props.character.id)

    const updateStat = (key: string, min: number, max: number, value?: number) => {
      if (value !== undefined && !isNaN(value)) {
        if (value < min) value = min
        else if (value > max) value = max
      }
      store.updateChar({ ...props.character, [key]: value })
    }

    const getSelectedCrys = (slot: number) => {
      const entry = Object.entries(props.character.crysOptions)
        .find(([, c]) => c.useIndex === slot)
      return entry ? Number(entry[0]) : 0
    }

    const crysOptions = (slot: number) => {
      return Object.entries(props.character.crysOptions)
        .filter(([, crys]) => crys.useIndex === 0 || crys.useIndex === slot)
        .map(([id]) => crystalises[Number(id)])
        .map((crys) => ({ ...crys, name: crys.styleMstId ? 'EX' : crys.name }))
        .sort((a, b) => {
          const sDiff = b.styleMstId - a.styleMstId
          if (sDiff) return sDiff
          return b.sortOrder - a.sortOrder
        })
    }

    const setCrys = (slot: number, newId: number) => {
      const updated = { ...props.character, crysOptions: { ...props.character.crysOptions } }
      Object.entries(updated.crysOptions).forEach(([id, c]) => {
        if (c.useIndex === slot) updated.crysOptions[id] = { ...c, useIndex: 0 }
      })
      if (newId !== 0 && updated.crysOptions[newId]) {
        updated.crysOptions[newId] = { ...updated.crysOptions[newId], useIndex: slot }
      }
      store.updateChar(updated)
    }

    return {
      maxAscension,
      levelStats,
      derivedStats,
      kiokuLevelCost,
      magicLevelCost,
      itemIdxToImg,
      imgSrc,
      isVisible,
      toggleCharacter,
      updateStat,
      getSelectedCrys,
      crysOptions,
      setCrys,
    }
  },
})
</script>

<style scoped>
/* ── Row ── */
.character-row {
  display: grid;
  grid-template-columns: 240px 400px 160px 1fr;
  align-items: center;
  gap: 0 0.75rem;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}

.character-row:hover {
  background: var(--bg-soft);
}

.character-row--disabled {
  opacity: 0.45;
}

/* ── Column base ── */
.col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-heading {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  margin-bottom: 1px;
}

/* ── Col 1: Identity ── */
.col-identity {
  flex-direction: row;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  user-select: none;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stats-grid,
.derived-grid {
  display: grid;
  grid-template-columns: repeat(5, 45px);
  gap: 2rem;
}

.stat-cell,
.derived-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.char-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.char-thumb.faded {
  opacity: 0.25;
  filter: grayscale(0.5);
}

.char-names {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  text-align: center;
  flex: 1;
  min-width: 0;
}

.char-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.char-name-en {
  font-size: 0.72rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rarity-stars {
  font-size: 0.6rem;
  color: var(--accent);
  letter-spacing: -1px;
  margin-top: 1px;
}

.col-stats {
  align-items: center;
  margin: auto 1rem;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.cell-label {
  font-size: 0.6rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.stat-cell input {
  width: 42px;
  text-align: center;
  padding: 0.25rem 0.2rem;
  font-size: 0.82rem;
}

.resource-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 353px;
  /* matches the width of the stats-grid / derived-grid above it */
  margin-top: 2px;
}

.resource-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.resource-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 0.12s;
}

.resource-chip:hover {
  background: rgba(255, 255, 255, 0.12);
}

.resource-chip img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* ── Col 3: Crystalis (narrow) ── */
.crys-slots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
}

.col-crystalis {
  min-width: 0;
}

/* ── Col 4: Portrait ── */
.col-portrait {
  align-items: flex-start;
}

.edit-port-btn {
  width: 100%;
}

.edit-port-btn :deep(input) {
  width: calc(100% - 2.8rem);
  margin: 0 auto;
}

.edit-crys-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 0.3rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--accent-soft);
  font-size: 0.78rem;
  text-decoration: none;
  box-sizing: border-box;
  transition: background 0.15s, border-color 0.15s;
}

.edit-crys-btn:hover {
  background: var(--bg-soft);
  border-color: var(--border-strong);
  color: var(--accent);
}

/* ── Disabled placeholder ── */
.col-disabled-msg {
  grid-column: 2 / -1;
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  color: var(--muted);
  font-style: italic;
  padding: 0.2rem 0;
  opacity: 0.6;
}

/* ── at-max highlight ── */
input.at-max {
  color: var(--accent);
  border-color: var(--border-strong);
}
</style>
