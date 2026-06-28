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
      </div>

      <div class="col col-crystalis">
        <span class="col-heading">Crystalis</span>
        <div class="crys-slots">
          <select v-for="slot in 3" :key="slot" :value="getSelectedCrys(slot)"
            @change="setCrys(slot, Number(($event.target as HTMLSelectElement).value))">
            <option :value="0">—</option>
            <option v-for="crys in crysOptions(slot)" :key="crys.selectionAbilityMstId"
              :value="crys.selectionAbilityMstId">
              {{ crys.name }}
            </option>
          </select>
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
import { defineComponent, computed } from 'vue'
import { useCharacterStore } from '../store/characterStore'
import PortraitSelector from './PortraitSelector.vue'
import { Character, KiokuConstants } from '../types/KiokuTypes'
import { crystalises } from '../utils/helpers'

export default defineComponent({
  name: 'CharacterCard',
  components: { PortraitSelector },
  props: {
    character: {
      type: Object as () => Character,
      required: true,
    },
    show3stars: {
      type: Object as () => boolean,
      required: true,
    },
    show4stars: {
      type: Object as () => boolean,
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

    const imgSrc = computed(
      () => `/exedra-dmg-calc/kioku_images/${props.character.id}_thumbnail.png`
    )

    const isVisible = computed(() => {
      const c = props.character
      if (c.rarity === 3 && !props.show3stars) return false
      if ((c.rarity === 4 || c.name === 'Lux☆Magica') && !props.show4stars) return false
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
      console.log(props.character, props.character.crysOptions)
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
      Object.values(props.character.crysOptions).forEach(c => {
        if (c.useIndex === slot) c.useIndex = 0
      })
      if (newId === 0) return
      Object.values(props.character.crysOptions).forEach(c => {
        if (c.useIndex !== slot && c.useIndex !== 0) {
          const id = Object.entries(props.character.crysOptions).find(([, v]) => v === c)?.[0]
          if (Number(id) === newId) c.useIndex = 0
        }
      })
      props.character.crysOptions[newId].useIndex = slot
    }

    return {
      maxAscension,
      levelStats,
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
  grid-template-columns:
    180px
    /* identity: thumb + stacked names */
    auto
    /* stats: asc + 4 levels in one row */
    140px
    /* crystalis: narrow */
    1fr;
  /* portrait: wider */
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

/* ── Col 2: Stats (Asc + 4 levels in one horizontal row) ── */
.col-stats {
  flex-shrink: 0;
}

.stats-grid {
  display: flex;
  flex-direction: row;
  gap: 6px;
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
  padding: 0.25rem 0.3rem;
  font-size: 0.82rem;
}

/* ── Col 3: Crystalis (narrow) ── */
.crys-slots {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.crys-slots select {
  width: 100%;
  min-width: 0;
  font-size: 0.78rem;
  padding: 0.22rem 0.35rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
}

.crys-slots select:focus {
  outline: none;
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(246, 212, 133, 0.1);
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
