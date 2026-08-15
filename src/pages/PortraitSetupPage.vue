<template>
  <div class="setup-page">
    <h1 class="page-title">Portraits</h1>

    <section class="toolbar card">
      <label class="chip" :class="{ active: showE5ForAll }">
        <input type="checkbox" v-model="showE5ForAll" /> Show E5 effect for all portraits
      </label>
      <label class="chip" :class="{ active: showPerPortraitResourceCosts }">
        <input type="checkbox" v-model="showPerPortraitResourceCosts" /> Per portrait resource costs
      </label>
      <label class="chip" :class="{ active: showResourceCosts }">
        <input type="checkbox" v-model="showResourceCosts" /> Total resource costs
      </label>
    </section>

    <section v-if="showResourceCosts" class="resource-summary card">
      <span class="filters-heading">Resource Totals ({{ e5Count }} marked E5)</span>

      <div v-for="r in ascendableRarities" :key="r" class="resource-summary-row" @click="toggleMissingAndWhole">
        <span class="resource-summary-label">{{ r }}★ ({{ countByRarity[r] ?? 0 }})</span>

        <div class="resource-summary-details">
          <span v-for="item in rarityTotals[r].items" :key="item.idx" class="resource-chip" :title="formatTitle()">
            <img :src="itemIdxToImg(item.idx)" :alt="`Item idx ${item.idx}`" />
            {{ formatAmount(item.current, item.max) }}
          </span>
          <span class="resource-chip" :title="formatTitle()">
            <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
            {{ formatAmount(rarityTotals[r].gold.current, rarityTotals[r].gold.max) }}
          </span>
        </div>
      </div>
    </section>

    <section class="filters card">
      <span class="filters-heading">Sort</span>
      <div class="filter-group">
        <select class="selector" v-model="sortBy">
          <option value="name">Name</option>
          <option value="rarity">Rarity</option>
          <option value="atk">ATK</option>
          <option value="def">DEF</option>
          <option value="hp">HP</option>
        </select>
      </div>

      <div class="group-by-options">
        <span class="filter-group-label">Group by</span>

        <label class="chip" :class="{ active: groupBy === 'none' }">
          <input type="radio" name="group-by" value="none" v-model="groupBy" />
          None
        </label>

        <label class="chip" :class="{ active: groupBy === 'effect' }">
          <input type="radio" name="group-by" value="effect" v-model="groupBy" />
          Effect
        </label>
      </div>
    </section>

    <div class="list-header">
      <span>Image</span>
      <span>Portrait</span>
      <span>Stats · Cost</span>
      <span>Description</span>
    </div>

    <div v-for="(list, groupKey) in groupedPortraits" :key="groupKey" class="role-section">
      <button class="role-header" @click="groupBy === 'none' ? undefined : toggleGroup(groupKey)"
        :aria-expanded="!collapsedGroups[groupKey]">
        <span v-if="groupBy !== 'none'" class="role-chevron" :class="{ rotated: collapsedGroups[groupKey] }">▾</span>
        <span v-if="groupBy === 'effect'" class="role-effect-label">{{ groupKey }}</span>
        <span class="role-count">{{ list.length }}</span>
      </button>

      <div v-show="!collapsedGroups[groupKey]" class="role-body">
        <PortraitCard v-for="portrait in list" :key="portrait.cardMstId" :portrait="portrait"
          :level="effectiveLevel(portrait)" :is-e5="isE5(portrait)" :on-toggle-e5="() => toggleE5(portrait)"
          :show-resource-costs="showPerPortraitResourceCosts" :format-amount="formatAmount"
          :toggle-missing-and-whole="toggleMissingAndWhole" :format-title="formatTitle" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import PortraitCard from '../components/PortraitCard.vue'
import { portraits as portraitData, portraitEnchantmentCosts } from '../utils/helpers'
import { Portrait, portraitMaxLimitBreak, getPortraitEffectType } from '../types/KiokuTypes'
import { useSetting } from '../store/settingsStore.js'
import { otherBuffsAndDebuffs, scoreAttackRelevantBuffsAndDebuffs } from '../types/enums.js'

export default defineComponent({
  components: { PortraitCard },
  setup() {
    // Master portrait data only — no per-portrait saved state, everyone has the same set.
    const allPortraits = computed<Portrait[]>(() =>
      Object.values(portraitData).filter((p): p is Portrait => !!p?.name)
    )

    const portraitE5 = useSetting<Record<number, boolean>>('portraitE5States', {})
    const showE5ForAll = useSetting<boolean>('showE5ForAllPortraits', false)

    function isE5(p: Portrait) {
      return !!portraitE5.value[p.cardMstId]
    }
    function toggleE5(p: Portrait) {
      portraitE5.value[p.cardMstId] = !portraitE5.value[p.cardMstId]
    }
    function effectiveLevel(p: Portrait) {
      return showE5ForAll.value || isE5(p) ? portraitMaxLimitBreak : 0
    }

    const e5Count = computed(() => allPortraits.value.filter(isE5).length)

    const showResourceCosts = useSetting('portraitShowResourceCosts', true)
    const showPerPortraitResourceCosts = useSetting('portraitShowPerPortraitResourceCosts', true)

    const sortBy = useSetting<'name' | 'rarity' | 'atk' | 'def' | 'hp'>(
      'portraitSortBy',
      'name'
    )
    const groupBy = useSetting<'none' | 'effect'>('groupPortraitsBy', 'effect')

    const bigNumberDisplayMode = useSetting<'shortHas' | 'shortMiss' | 'longHas' | 'longMiss' | 'percentage'>(
      "portraitBigNumberDisplayMode",
      "shortHas"
    )
    function toggleMissingAndWhole() {
      switch (bigNumberDisplayMode.value) {
        case 'shortHas':
          bigNumberDisplayMode.value = 'longHas'
          break
        case 'longHas':
          bigNumberDisplayMode.value = 'shortMiss'
          break
        case 'shortMiss':
          bigNumberDisplayMode.value = 'longMiss'
          break
        case 'longMiss':
          bigNumberDisplayMode.value = 'percentage'
          break
        case 'percentage':
          bigNumberDisplayMode.value = 'shortHas'
          break
      }
    }
    function formatValue(nr: number) {
      if (bigNumberDisplayMode.value === "longHas" || bigNumberDisplayMode.value === "longMiss") return (nr ?? 0).toLocaleString()
      return (nr ?? 0).toLocaleString(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      })
    }
    function formatAmount(current: number, max: number) {
      let value = current
      if (bigNumberDisplayMode.value === "percentage") return `${(100 * current / max).toFixed(2)}%`
      if (bigNumberDisplayMode.value === "shortMiss" || bigNumberDisplayMode.value === "longMiss") value = -Math.max(max - current, 0)
      return `${formatValue(value)} / ${formatValue(max)}`
    }
    function formatTitle() {
      switch (bigNumberDisplayMode.value) {
        case 'shortHas':
        case 'longHas':
        case 'percentage':
          return "Spent resources"
        case 'shortMiss':
        case 'longMiss':
          return "Required resources to max"
      }
    }

    function itemIdxToImg(idx: number) {
      return `/exedra-dmg-calc/items/light/${idx}.png`
    }

    const collapsedGroups = useSetting<Record<string, boolean>>("collapsedPortraitGroups", {})
    function toggleGroup(group: string) {
      collapsedGroups.value[group] = !collapsedGroups.value[group]
    }

    function comparePortraits(a: Portrait, b: Portrait) {
      if (sortBy.value === "name") return a.name.localeCompare(b.name)
      if (sortBy.value === "rarity") return b.rarity - a.rarity
      return (b.stats?.[sortBy.value] ?? 0) - (a.stats?.[sortBy.value] ?? 0)
    }

    function sortPortraits(list: Portrait[]) {
      return list.slice().sort(comparePortraits)
    }

    const groupedPortraits = computed(() => {
      if (groupBy.value === 'effect') {
        const groups: Record<string, { portrait: Portrait, value: number }[]> = {}

        allPortraits.value.forEach(p => {
          const effects = getPortraitEffectType(p, effectiveLevel(p))
          Object.entries(effects).forEach(([effectType, value]) => {
            (groups[
              scoreAttackRelevantBuffsAndDebuffs[effectType]
              ?? otherBuffsAndDebuffs[effectType]
              ?? effectType
            ] ??= []).push({ portrait: p, value })
          })
        })

        const sortedGroups: Record<string, Portrait[]> = {}
        Object.keys(groups).sort((a, b) => a.localeCompare(b)).forEach(effectType => {
          sortedGroups[effectType] = groups[effectType]
            .sort((a, b) => b.value - a.value || comparePortraits(a.portrait, b.portrait))
            .map(entry => entry.portrait)
        })

        return sortedGroups
      }
      return { All: sortPortraits(allPortraits.value) }
    })

    // Only rarities present as keys in portraitEnchantmentCosts actually ascend.
    const ascendableRarities = computed(() =>
      Object.keys(portraitEnchantmentCosts).map(Number).sort((a, b) => b - a)
    )

    const countByRarity = computed(() => {
      const counts: Record<number, number> = {}
      allPortraits.value.forEach(p => {
        counts[p.rarity] = (counts[p.rarity] ?? 0) + 1
      })
      return counts
    })

    function getRarityEnchantmentCost(rarity: number, level: number) {
      const table = portraitEnchantmentCosts[rarity]
      const currLvl = Math.min(Math.max(level ?? 0, 0), portraitMaxLimitBreak)
      const current = table[currLvl] ?? table[0]
      const max = table[portraitMaxLimitBreak] ?? current

      return {
        item1: { current: current.item1, max: max.item1 },
        item2: { current: current.item2, max: max.item2 },
        item3: { current: current.item3, max: max.item3 },
        gold: { current: current.gold, max: max.gold },
      }
    }

    const rarityTotals = computed(() => {
      const totals: Record<number, {
        items: { idx: number, current: number, max: number }[]
        gold: { current: number, max: number }
      }> = {}

      ascendableRarities.value.forEach(r => {
        totals[r] = {
          items: [1, 2, 3].map(idx => ({ idx, current: 0, max: 0 })),
          gold: { current: 0, max: 0 },
        }
      })

      allPortraits.value.forEach(p => {
        const bucket = totals[p.rarity]
        if (!bucket) return

        const cost = getRarityEnchantmentCost(p.rarity, effectiveLevel(p))
        bucket.items[0].current += cost.item1.current
        bucket.items[0].max += cost.item1.max
        bucket.items[1].current += cost.item2.current
        bucket.items[1].max += cost.item2.max
        bucket.items[2].current += cost.item3.current
        bucket.items[2].max += cost.item3.max
        bucket.gold.current += cost.gold.current
        bucket.gold.max += cost.gold.max
      })

      return totals
    })

    return {
      allPortraits,
      showE5ForAll,
      isE5,
      toggleE5,
      effectiveLevel,
      e5Count,
      showResourceCosts,
      showPerPortraitResourceCosts,
      collapsedGroups,
      toggleGroup,
      groupedPortraits,
      sortBy,
      groupBy,
      ascendableRarities,
      countByRarity,
      rarityTotals,
      itemIdxToImg,
      toggleMissingAndWhole,
      formatAmount,
      formatTitle,
    }
  },
})
</script>

<style scoped>
.setup-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 4rem;
}

.page-title {
  font-size: 2rem;
  margin: 0 0 1.25rem;
  color: var(--text);
}

.calc-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  margin-left: 1rem;
}

.live-best-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--border);
}

.live-team-row {
  scale: 65%;
  margin: 0;
  width: initial;
}

.calc-indicator {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: normal;
  white-space: nowrap;
  animation: pulse 2s infinite;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 140px;
  height: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.progress-text {
  font-size: 0.78rem;
  color: var(--muted);
  white-space: nowrap;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.5;
  }
}

.team-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scale: 170%;
}

.best-team-panel {
  flex-direction: column;
  align-items: stretch;
  border-color: var(--border-strong);
  background: linear-gradient(180deg, var(--accent-glow) 0%, transparent 100%), var(--panel);
}

.best-team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.filters-heading.highlight {
  color: var(--accent);
  opacity: 1;
  font-weight: 700;
}

.pwr-display {
  font-size: 0.85rem;
  color: var(--text);
}

.pwr-display strong {
  font-size: 1rem;
  color: var(--accent);
}

.btn-active {
  background: var(--panel);
  border-color: var(--accent) !important;
  color: var(--accent) !important;
}

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

.toolbar {
  justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
  background: var(--accent-glow);
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

.filters-heading {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-right: 0.25rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.group-by-options {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-left: 1px solid var(--border);
  padding-left: 0.65rem;
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

.list-header {
  display: grid;
  grid-template-columns: 120px 250px 230px calc(100% - 600px) 1fr;
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
  text-align: center;
}

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

.role-icon {
  width: 30px;
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
}

.empty-role {
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
  opacity: 0.6;
}

.selector {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.3rem 1rem;
  gap: 0.5rem;
}

/* ── Resource tracking ── */
.resource-chip {
  display: inline-block;
  font-size: 0.74rem;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.resource-chip img {
  width: 20px;
  margin: -10px 0 -5px -5px;
}

.resource-summary {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.35rem;
}

.resource-summary>.filters-heading {
  margin-bottom: 0.1rem;
}

.resource-summary-row {
  display: grid;
  grid-template-columns: 55px minmax(0, 1fr);
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
  transition: background 0.12s, border-color 0.12s;
}

.resource-summary-row:hover {
  background: var(--bg-soft);
  border-color: var(--border-strong);
}

.resource-summary-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-soft);
  text-align: center;
}

.resource-summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.resource-summary-section {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.resource-summary-section-label {
  width: 78px;
  flex: 0 0 78px;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  opacity: 0.75;
}

.magic-summary-section {
  min-width: 0;
}

.magic-resource-groups {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.magic-resource-group {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
}

.magic-gold {
  margin-left: 0;
}

.resource-summary-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-soft);
  margin-right: 0.15rem;
}

.player-level-input {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.player-level-input input {
  width: 90px;
  text-align: center;
}

.player-exp-chip {
  cursor: pointer;
  height: 29px;
  box-sizing: border-box;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  font-size: 0.74rem;
  user-select: none;
  white-space: nowrap;
}

.player-exp-chip img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin: 0;
  flex-shrink: 0;
}

.player-exp-chip:hover {
  background: rgba(255, 255, 255, 0.12);
}

.role-resources {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.role-resources:hover .resource-chip {
  background: rgba(255, 255, 255, 0.12);
}

.role-resource-label {
  width: 85px;
  flex: 0 0 85px;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  opacity: 0.75;
  padding-top: 0.2rem;
}

.right-leaning {
  margin-left: auto;
}

.magic-resource-groups {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.magic-resource-group {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
}

.magic-gold {
  margin-left: 0;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.74rem;
  color: var(--accent-soft);
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-right: 2px;
  transition: color 0.15s ease;
}

.external-link:hover {
  color: var(--accent);
}

.external-link-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.role-effect-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.resource-summary-row--muted {
  opacity: 0.6;
  cursor: default;
}

.no-enchantment {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--muted);
}
</style>
