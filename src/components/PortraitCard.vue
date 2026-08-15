<template>
  <div class="portrait-row">
    <div class="col col-identity">
      <img :src="imgSrc" :alt="portrait.name" class="portrait-thumb" />
      <div class="portrait-names">
        <span class="portrait-name">{{ portrait.name }}</span>
        <span class="rarity-stars">{{ '★'.repeat(portrait.rarity) }}</span>
        <label class="e5-toggle" :class="{ active: isE5 }" @click.stop>
          <input type="checkbox" :checked="isE5" @change="onToggleE5" />
          Is E5
        </label>
      </div>
    </div>

    <div class="col col-stats">
      <span class="col-heading">Stats</span>
      <div class="stats-section">
        <div class="derived-grid">
          <div v-for="stat in derivedStats" :key="stat.short" class="derived-cell">
            <span class="cell-label">{{ stat.short }}</span>
            <span class="derived-value">{{ stat.value ?? '…' }}</span>
          </div>
        </div>
        <template v-if="showResourceCosts">
          <span v-for="item in itemCosts" :key="item.idx" class="resource-chip" :title="formatTitle()"
            @click="toggleMissingAndWhole">
            <img :src="itemIdxToImg(item.idx, elementName)" :alt="`Item idx ${item.idx}`" />
            {{ formatAmount(item.current, item.max) }}
          </span>
          <span class="resource-chip" :title="formatTitle()" @click="toggleMissingAndWhole">
            <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
            {{ formatAmount(ascensionCost.gold.current, ascensionCost.gold.max) }}
          </span>
        </template>
      </div>
    </div>

    <div class="col col-description">
      <span class="col-heading">Description</span>
      <p class="description-text">{{ description }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { KiokuConstants, Portrait, getPortraitDescription } from '../types/KiokuTypes'
import { KiokuElement, elementMap } from '../types/enums'
import { portraitEnchantmentCosts } from '../utils/helpers'

export default defineComponent({
  name: 'PortraitCard',
  props: {
    portrait: {
      type: Object as () => Portrait,
      required: true,
    },
    level: {
      type: Number,
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
    formatTitle: {
      type: Function as PropType<() => string | undefined>,
      default: () => undefined,
    },
    isE5: {
      type: Boolean,
      default: false,
    },
    onToggleE5: {
      type: Function as PropType<() => void>,
      default: () => { },
    },
    showResourceCosts: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const derivedStats = computed(() => [
      { short: 'ATK', value: props.portrait.stats?.[props.level]?.atk },
      { short: 'DEF', value: props.portrait.stats?.[props.level]?.def },
      { short: 'HP', value: props.portrait.stats?.[props.level]?.hp },
    ])

    const description = computed(() => getPortraitDescription(props.portrait, props.level))

    const ascensionCost = computed(() => {
      const table = portraitEnchantmentCosts[props.portrait.rarity]
      if (!table) {
        return {
          item1: { current: 0, max: 0 },
          item2: { current: 0, max: 0 },
          item3: { current: 0, max: 0 },
          gold: { current: 0, max: 0 },
        }
      }

      const currLvl = Math.min(Math.max(props.level ?? 0, 0), KiokuConstants.maxAscension)
      const current = table[currLvl] ?? table[0]
      const max = table[KiokuConstants.maxAscension] ?? current

      return {
        item1: { current: current.item1, max: max.item1 },
        item2: { current: current.item2, max: max.item2 },
        item3: { current: current.item3, max: max.item3 },
        gold: { current: current.gold, max: max.gold },
      }
    })

    const itemCosts = computed(() => [
      { idx: 1, ...ascensionCost.value.item1 },
      { idx: 2, ...ascensionCost.value.item2 },
      { idx: 3, ...ascensionCost.value.item3 },
    ])

    const elementName = computed(() => elementMap[String(props.portrait.element)])

    function itemIdxToImg(idx: number, element?: KiokuElement | string) {
      let key = "light"
      if (Object.values(KiokuElement).includes(element as KiokuElement)) {
        key = (element as string).toLowerCase()
      }
      return `/exedra-dmg-calc/items/${key}/${idx}.png`
    }

    const imgSrc = computed(
      () => `/exedra-dmg-calc/portrait_images/${props.portrait.resourceName}_thumbnail.png`
    )

    return {
      derivedStats,
      description,
      ascensionCost,
      itemCosts,
      elementName,
      itemIdxToImg,
      imgSrc,
    }
  },
})
</script>

<style scoped>
/* ── Row ── */
.portrait-row {
  display: grid;
  grid-template-columns: 380px 240px calc(100% - 620px) 1fr;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}

.portrait-row:hover {
  background: var(--bg-soft);
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
}

.portrait-thumb {
  height: 74px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.portrait-names {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  text-align: center;
  flex: 1;
  min-width: 0;
}

.portrait-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.rarity-stars {
  font-size: 0.6rem;
  color: var(--accent);
  letter-spacing: -1px;
  margin-top: 1px;
}

.e5-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 4px;
  padding: 0.1rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.e5-toggle input {
  display: none;
}

.e5-toggle.active {
  background: var(--accent-glow);
  border-color: var(--border-strong);
  color: var(--accent);
}

/* ── Col 2: Stats ── */
.col-stats {
  align-items: center;
  margin: auto 1rem;
}

.stats-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.derived-grid {
  display: grid;
  grid-template-columns: repeat(3, 45px);
  gap: 0.5rem;
}

.derived-cell {
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

.resource-block {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
  max-width: 210px;
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

.no-ascension {
  font-size: 0.7rem;
  color: var(--muted);
  font-style: italic;
  margin-top: 2px;
}

/* ── Col 3: Description ── */
.col-description {
  min-width: 0;
}

.description-text {
  font-size: 0.8rem;
  color: var(--text);
  line-height: 1.35;
  margin: 0;
  white-space: pre-line;
}
</style>
