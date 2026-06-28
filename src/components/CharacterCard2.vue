<template>
  <div
    v-if="isVisible"
    class="character-row"
    :class="{ 'character-row--disabled': !character.enabled }"
  >
    <!-- Col 1: Portrait + name + toggle -->
    <div class="col col-identity" @click="toggleCharacter" title="Toggle owned">
      <img :src="imgSrc" :alt="character.name" class="char-thumb" :class="{ faded: !character.enabled }" />
      <span class="char-name">{{ character.name }}</span>
      <span class="rarity-stars">{{ '★'.repeat(character.rarity) }}</span>
    </div>

    <!-- Rest only shown when enabled -->
    <template v-if="character.enabled">
      <!-- Col 2: Ascension (single stat, special prominence) -->
      <div class="col col-ascension">
        <span class="col-heading">Ascension</span>
        <input
          type="number"
          :min="0"
          :max="maxAscension"
          :value="character.ascension"
          :class="{ 'at-max': character.ascension >= maxAscension }"
          @input="updateStat('ascension', 0, maxAscension, $event?.target?.valueAsNumber)"
        />
      </div>

      <!-- Col 3: The four levels -->
      <div class="col col-levels">
        <span class="col-heading">Levels</span>
        <div class="levels-grid">
          <label v-for="s in levelStats" :key="s.key" class="level-cell">
            <span class="cell-label">{{ s.short }}</span>
            <input
              type="number"
              :min="s.min"
              :max="s.max"
              :value="character[s.key]"
              :class="{ 'at-max': character[s.key] >= s.max }"
              @input="updateStat(s.key, s.min, s.max, $event?.target?.valueAsNumber)"
            />
          </label>
        </div>
      </div>

      <!-- Col 4: Crystalis -->
      <div class="col col-crystalis">
        <span class="col-heading">Crystalis</span>
        <div class="crys-slots">
          <select
            v-for="slot in 3"
            :key="slot"
            :value="getSelectedCrys(slot)"
            @change="setCrys(slot, Number(($event.target as HTMLSelectElement).value))"
          >
            <option :value="0">—</option>
            <option
              v-for="crys in crysOptions(slot)"
              :key="crys.selectionAbilityMstId"
              :value="crys.selectionAbilityMstId"
            >
              {{ crys.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Col 5: Portrait selector + edit link -->
      <div class="col col-portrait">
        <span class="col-heading">Portrait</span>
        <PortraitSelector v-model="character.portrait" :element="character.element" />
        <router-link
          class="edit-crys-btn"
          :to="{ path: '/character-crys', query: { character_id: character.id } }"
        >
          Edit SubCrys
        </router-link>
      </div>
    </template>

    <!-- Disabled placeholder columns -->
    <template v-else>
      <div class="col col-disabled-msg">
        <span>Not owned — click portrait to enable</span>
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
      { key: 'kiokuLvl',      short: 'Kioku', min: 1, max: KiokuConstants.maxKiokuLvl },
      { key: 'magicLvl',      short: 'Magic', min: 0, max: KiokuConstants.maxMagicLvl },
      { key: 'heartphialLvl', short: 'HP',    min: 1, max: KiokuConstants.maxHeartphialLvl },
      { key: 'specialLvl',    short: 'SP',    min: 1, max: KiokuConstants.maxSpecialLvl },
    ]

    const imgSrc = computed(
      () => `/exedra-dmg-calc/kioku_images/${props.character.id}_thumbnail.png`
    )

    const isVisible = computed(() => {
      const c = props.character
      // rarity filters
      if (c.rarity === 3 && !props.show3stars) return false
      if ((c.rarity === 4 || c.name === 'Lux☆Magica') && !props.show4stars) return false

      // hide unowned
      if (props.filters.hideUnowned && !c.enabled) return false

      // level filters (only apply to owned characters)
      if (c.enabled) {
        const f = props.filters
        if (f.heartphialMax === true  && c.heartphialLvl < KiokuConstants.maxHeartphialLvl) return false
        if (f.heartphialMax === false && c.heartphialLvl >= KiokuConstants.maxHeartphialLvl) return false
        if (f.spMax === true  && c.specialLvl < KiokuConstants.maxSpecialLvl) return false
        if (f.spMax === false && c.specialLvl >= KiokuConstants.maxSpecialLvl) return false
        if (f.magicMax === true  && c.magicLvl < KiokuConstants.maxMagicLvl) return false
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
/* ── Row container ── */
.character-row {
  display: grid;
  grid-template-columns:
    160px          /* identity */
    64px           /* ascension */
    1fr            /* levels */
    1fr            /* crystalis */
    140px;         /* portrait + link */
  align-items: start;
  gap: 0 0.75rem;
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.15s;
}

.character-row:hover {
  background: rgba(255,255,255,0.03);
}

.character-row--disabled {
  opacity: 0.5;
}

/* ── Column base ── */
.col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-heading {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.38);
  margin-bottom: 2px;
}

/* ── Col 1: Identity ── */
.col-identity {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.char-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.char-thumb.faded {
  opacity: 0.28;
}

.char-name {
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rarity-stars {
  font-size: 0.6rem;
  color: #d4af37;
  letter-spacing: -1px;
  flex-shrink: 0;
}

/* ── Col 2: Ascension ── */
.col-ascension {
  align-items: center;
}

.col-ascension input {
  width: 46px;
  text-align: center;
}

/* ── Col 3: Levels grid ── */
.levels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
}

.level-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.cell-label {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.42);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.level-cell input {
  width: 46px;
  text-align: center;
}

/* ── Col 4: Crystalis ── */
.crys-slots {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.crys-slots select {
  width: 100%;
  min-width: 0;
  font-size: 0.8rem;
}

/* ── Col 5: Portrait + link ── */
.col-portrait {
  align-items: flex-start;
}

.edit-crys-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 0.3rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 5px;
  color: var(--text, rgba(255,255,255,0.87));
  font-size: 0.78rem;
  text-decoration: none;
  box-sizing: border-box;
}

.edit-crys-btn:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.18);
}

/* ── Disabled placeholder ── */
.col-disabled-msg {
  grid-column: 2 / -1;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.28);
  font-style: italic;
  padding: 0.2rem 0;
}

/* ── at-max highlight ── */
input.at-max {
  color: #7dd3b0;
  border-color: rgba(125, 211, 176, 0.4);
}
</style>
