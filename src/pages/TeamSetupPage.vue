<template>
  <div class="setup-page">
    <h1 class="page-title">Kioku Setup</h1>

    <section class="toolbar card">
      <div class="toolbar-left">
        <button class="btn" @click="exportCharacters()">Export</button>
        <label class="btn">
          Import
          <input type="file" accept="application/json" @change="handleFileChange" />
        </label>

        <button class="btn" :class="{ 'btn-active': showHighestTeam }" @click="showHighestTeam = !showHighestTeam">
          {{ showHighestTeam ? 'Hide Highest PWR Team' : 'Show Highest PWR Team' }}
        </button>
        <label class="chip" :class="{ active: simulateMaxAccountLevels }"
          title="Simulate using max possible kioku level and magic level based on player level. Kioku level is capped at your Player Level, and Magic level is capped at whatever your simulated Kioku level allows.">
          <input type="checkbox" v-model="simulateMaxAccountLevels" /> Simulate using max possible levels
        </label>
        <div v-if="calculating" class="calc-progress">
          <span class="calc-indicator">Calculating max pwr team {{ currentBestPwr }}...</span>
          <div class="progress-wrapper">
            <progress :value="completedRuns" :max="expectedRuns" class="progress-bar"></progress>
            <span class="progress-text">{{ completedRuns }} / {{ expectedRuns }}</span>
          </div>
          <TeamRow v-if="currentBestTeam" class="live-team-row" :team="currentBestTeam" />
        </div>
      </div>
      <div class="toolbar-right rarity-toggles">
        <label class="chip" :class="{ active: showPerKiokuResourceCosts }">
          <input type="checkbox" v-model="showPerKiokuResourceCosts" /> Per kioku resource costs
        </label>
        <label class="chip" :class="{ active: showResourceCosts }">
          <input type="checkbox" v-model="showResourceCosts" /> Total resource costs
        </label>
        <label class="chip" :class="{ active: show4stars }">
          <input type="checkbox" v-model="show4stars" /> ★★★★
        </label>
        <label class="chip" :class="{ active: show3stars }">
          <input type="checkbox" v-model="show3stars" /> ★★★
        </label>
      </div>
    </section>

    <section v-if="showHighestTeam && highestTeam" class="best-team-panel card">
      <div class="best-team-header">
        <span class="filters-heading highlight">
          Highest Possible Team PWR
          <span v-if="simulateMaxAccountLevels" class="simulated-badge"
            title="Kioku and Magic levels are simulated at the max your account could reach, not your current levels">(Simulated)</span>
        </span>
        <span class="pwr-display"> <strong>{{ highestPwr?.toLocaleString() }}</strong></span>
      </div>
      <div class="team-rows">
        <TeamRow :team="highestTeam" />
      </div>
    </section>

    <section v-if="showResourceCosts" class="resource-summary card">
      <span class="filters-heading">Resource Totals</span>
      <template v-for="r in [5, 4, 3]">
        <div v-if="r === 5 || (r === 4 && show4stars) || (r === 3 && show3stars)" :key="r" class="resource-summary-row"
          @click="toggleMissingAndWhole">
          <span class="resource-summary-label">{{ r }}★</span>

          <div class="resource-summary-details">
            <!-- Kioku Level -->
            <div class="resource-summary-section">
              <span class="resource-summary-section-label">Kioku level</span>

              <span class="resource-chip" :title="formatTitle()">
                <img :src="`/exedra-dmg-calc/items/exp.png`" alt="Kioku Exp" />
                {{
                  formatAmount(
                    rarityKiokuLevelSums[r].exp.current,
                    rarityKiokuLevelSums[r].exp.max
                  )
                }}
              </span>

              <span class="resource-chip" :title="formatTitle()">
                <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
                {{
                  formatAmount(
                    rarityKiokuLevelSums[r].gold.current,
                    rarityKiokuLevelSums[r].gold.max
                  )
                }}
              </span>
            </div>

            <div class="resource-summary-section magic-summary-section">
              <span class="resource-summary-section-label">Magic level</span>

              <div class="magic-resource-groups">
                <div class="magic-resource-group">
                  <span v-for="i in [1, 2, 3, 7]" :key="i" class="resource-chip" :title="formatTitle()">
                    <img :src="itemIdxToImg(i)" :alt="`Item idx ${i}`" />
                    {{
                      formatAmount(
                        rarityMagicLevelSums[r].items.current[i] ?? 0,
                        rarityMagicLevelSums[r].items.max[i] ?? 0
                      )
                    }}
                  </span>
                </div>

                <div class="magic-resource-group">
                  <span v-for="i in [4, 5, 6, 8]" :key="i" class="resource-chip" :title="formatTitle()">
                    <img :src="itemIdxToImg(i)" :alt="`Item idx ${i}`" />
                    {{
                      formatAmount(
                        rarityMagicLevelSums[r].items.current[i] ?? 0,
                        rarityMagicLevelSums[r].items.max[i] ?? 0
                      )
                    }}
                  </span>
                </div>

                <div class="magic-resource-group magic-gold">
                  <span class="resource-chip" :title="formatTitle()">
                    <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
                    {{
                      formatAmount(
                        rarityMagicLevelSums[r].gold.current,
                        rarityMagicLevelSums[r].gold.max
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="r !== 3" class="resource-summary-section">
              <span class="resource-summary-section-label">Special level</span>

              <span v-for="i in [1, 2, 3]" :key="i" class="resource-chip" :title="formatTitle()">
                <img :src="specialItemIdxToImg(i)" :alt="`Special item idx ${i}`" />
                {{
                  formatAmount(
                    raritySpecialLevelSums[r].items.current[i] ?? 0,
                    raritySpecialLevelSums[r].items.max[i] ?? 0
                  )
                }}
              </span>

              <span class="resource-chip" :title="formatTitle()">
                <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" />
                {{
                  formatAmount(
                    raritySpecialLevelSums[r].gold.current,
                    raritySpecialLevelSums[r].gold.max
                  )
                }}
              </span>
            </div>
          </div>
        </div>
      </template>
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

    <section class="filters card">
      <span class="filters-heading">Sort</span>
      <div class="filter-group">
        <select class="selector" v-model="sortBy">
          <option value="id">Default</option>
          <option value="name">Kioku Name</option>
          <option value="atk">ATK</option>
          <option value="def">DEF</option>
          <option value="hp">HP</option>
          <option value="pwr">PWR</option>
          <option value="ch_name">Character</option>
          <option value="releaseDate">Release Date</option>
          <option value="kiokuLvl">Kioku Level</option>
          <option value="magicLvl">Magic Level</option>
        </select>
      </div>

      <div class="group-by-options">
        <span class="filter-group-label">Group by</span>

        <label class="chip" :class="{ active: groupBy === 'none' }">
          <input type="radio" name="group-by" value="none" v-model="groupBy" />
          None
        </label>

        <label class="chip" :class="{ active: groupBy === 'role' }">
          <input type="radio" name="group-by" value="role" v-model="groupBy" />
          Role
        </label>

        <label class="chip" :class="{ active: groupBy === 'element' }">
          <input type="radio" name="group-by" value="element" v-model="groupBy" />
          Element
        </label>
      </div>
    </section>

    <section class="card">
      <span class="filters-heading">Import</span>
      <router-link v-slot="{ href }" :to="{
        path: '/character-crys',
      }" custom>
        <a :href="href" target="_blank" rel="noopener noreferrer" class="external-link">
          Use the crys reader to read your crys, kioku, and magic levels automatically
          <svg class="external-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </router-link>
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

        <div class="right-leaning resource-chip player-exp-chip" @click="toggleMissingAndWhole" :title="formatTitle()">
          <img :src="`/exedra-dmg-calc/items/player.png`" alt="Player Exp" /> {{ formatAmount(playerExpUsage.current,
            playerExpUsage.max) }}
        </div>
        <label class="bulk-field">
          <span class="bulk-label">Player Level</span>
          <input type="number" min="1" :max="maxPlayerLevel" v-model.number="playerLevel" />
        </label>
        <label class="chip" :class="{ active: usePlayerLevelAsKiokuMaxLevel }">
          <input type="checkbox" v-model="usePlayerLevelAsKiokuMaxLevel" /> Use Player Level as max Kioku Level
        </label>
      </div>
    </section>

    <div class="list-header">
      <span>Character</span>
      <span>Asc · Kioku · Magic · HP · SP</span>
      <span>Crystalis</span>
      <span>Portrait</span>
    </div>

    <div v-for="(chars, roleElementAll) in groupedCharacters" :key="roleElementAll" class="role-section">
      <button class="role-header" @click="groupBy === 'none' ? undefined : toggleRole(roleElementAll)"
        :aria-expanded="!collapsedRoles[roleElementAll]">
        <span v-if="groupBy !== 'none'" class="role-chevron"
          :class="{ rotated: collapsedRoles[roleElementAll] }">▾</span>
        <img v-if="groupBy === 'element'" class="role-icon" :src="`/exedra-dmg-calc/elements/${roleElementAll}.png`"
          :alt="`${roleElementAll}`">
        <img v-if="groupBy === 'role'" class="role-icon" :src="`/exedra-dmg-calc/roles/${roleElementAll}.png`"
          :alt="`${roleElementAll}`">
        <div v-if="showResourceCosts">
          <span class="role-resources" @click.stop="toggleMissingAndWhole">
            <span class="role-resource-label">Kioku level</span>
            <span class="resource-chip">
              <img :src="`/exedra-dmg-calc/items/exp.png`" alt="Kioku Exp" :title="formatTitle()" /> {{
                formatAmount(tabKiokuLevelResourceSums[roleElementAll].exp.current,
                  tabKiokuLevelResourceSums[roleElementAll].exp.max) }}
            </span>
            <span class="resource-chip">
              <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" :title="formatTitle()" /> {{
                formatAmount(tabKiokuLevelResourceSums[roleElementAll].gold.current,
                  tabKiokuLevelResourceSums[roleElementAll].gold.max)
              }}
            </span>
          </span>
          <span class="role-resources" @click.stop="toggleMissingAndWhole">
            <span class="role-resource-label">Magic level</span>

            <div class="magic-resource-groups">
              <div class="magic-resource-group">
                <span v-for="i in [1, 2, 3, 7]" :key="i" class="resource-chip" :title="formatTitle()">
                  <img :src="itemIdxToImg(i, roleElementAll)" :alt="`Item idx ${i}`" /> {{
                    formatAmount(
                      tabMagicLevelResourceSums[roleElementAll].items.current[i],
                      tabMagicLevelResourceSums[roleElementAll].items.max[i]
                    )
                  }}
                </span>
              </div>

              <div class="magic-resource-group">
                <span v-for="i in [4, 5, 6, 8]" :key="i" class="resource-chip" :title="formatTitle()">
                  <img :src="itemIdxToImg(i, roleElementAll)" :alt="`Item idx ${i}`" /> {{
                    formatAmount(
                      tabMagicLevelResourceSums[roleElementAll].items.current[i],
                      tabMagicLevelResourceSums[roleElementAll].items.max[i]
                    )
                  }}
                </span>
              </div>

              <div class="magic-resource-group magic-gold">
                <span class="resource-chip" :title="formatTitle()">
                  <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" /> {{
                    formatAmount(
                      tabMagicLevelResourceSums[roleElementAll].gold.current,
                      tabMagicLevelResourceSums[roleElementAll].gold.max
                    )
                  }}
                </span>
              </div>
            </div>
          </span>
          <span class="role-resources" @click.stop="toggleMissingAndWhole">
            <span class="role-resource-label">Special level</span>
            <span v-for="i in [1, 2, 3]" :key="i" class="resource-chip" :title="formatTitle()">
              <img :src="specialItemIdxToImg(i)" :alt="`Special item idx ${i}`" /> {{
                formatAmount(
                  tabSpecialLevelResourceSums[roleElementAll].items.current[i],
                  tabSpecialLevelResourceSums[roleElementAll].items.max[i]
                )
              }}
            </span>
            <span class="resource-chip" :title="formatTitle()">
              <img :src="`/exedra-dmg-calc/items/gold.png`" alt="AQ Coins" /> {{
                formatAmount(
                  tabSpecialLevelResourceSums[roleElementAll].gold.current,
                  tabSpecialLevelResourceSums[roleElementAll].gold.max
                )
              }}
            </span>
          </span>
        </div>
        <span class="role-count">{{ visibleCountFor(chars) }} / {{ chars.length }}</span>
      </button>

      <div v-show="!collapsedRoles[roleElementAll]" class="role-body">
        <CharacterCard v-for="char in chars" :key="char.id" :character="char" :show3stars="show3stars"
          :show4stars="show4stars" :filters="filters" :show-resource-costs="showPerKiokuResourceCosts"
          :format-amount="formatAmount" :toggle-missing-and-whole="toggleMissingAndWhole" :player-level="playerLevel"
          :use-player-level-as-kioku-max-level="usePlayerLevelAsKiokuMaxLevel" />
        <div v-if="visibleCountFor(chars) === 0" class="empty-role">
          No Kioku match the current filters in this group.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import CharacterCard from '../components/CharacterCard.vue'
import TeamRow from '../components/TeamRow.vue'
import { useCharacterStore } from '../store/characterStore.js'
import { Character, KiokuConstants, withMaxLevelsForPlayerLevel } from '../types/KiokuTypes.js'
import { useSetting } from '../store/settingsStore.js'
import { FinalTeam } from '../types/BestTeamTypes.js'
import { KiokuElement, LuxMagica, maxPlayerLevel } from '../types/enums.js'
import { getCachedStats, scheduleBackfill } from '../utils/statsBackfill'
import { kiokuLevelCosts, magicLevelCosts, playerLevelCosts, specialUpgradeCosts } from '../utils/helpers'

export default defineComponent({
  components: { CharacterCard, TeamRow },
  setup() {
    const store = useCharacterStore()
    const show4stars = useSetting('show4stars', false)
    const show3stars = useSetting('show3stars', false)
    const showHighestTeam = useSetting('showHighestPwrTeam', true)

    const highestPwr = ref<number | null>(null)
    const highestTeam = ref<FinalTeam>()
    const calculating = ref(showHighestTeam.value)
    const completedRuns = ref(0)
    const expectedRuns = ref(0)
    const currentBestTeam = ref<FinalTeam>()
    const currentBestPwr = ref<number | null>(null)
    const sortBy = useSetting<'name' | 'atk' | 'def' | 'hp' | 'pwr' | 'id' | 'ch_name' | 'releaseDate' | 'kiokuLvl' | 'magicLvl'>(
      'characterSortBy',
      'id'
    )
    const groupBy = useSetting<'none' | 'role' | 'element'>(
      'groupCharactersBy',
      'role'
    )
    const playerLevel = useSetting('playerLevel', KiokuConstants.maxKiokuLvl)
    const usePlayerLevelAsKiokuMaxLevel = useSetting('usePlayerLevelAsKiokuMaxLevel', false)
    const simulateMaxAccountLevels = useSetting('simulateMaxAccountLevels', false)
    const showResourceCosts = useSetting('showResourceCosts', true)
    const showPerKiokuResourceCosts = useSetting('showPerKiokuResourceCosts', true)

    const bigNumberDisplayMode = useSetting<'shortHas' | 'shortMiss' | 'longHas' | 'longMiss' | 'percentage'>("bigNumberDisplayMode", "shortHas")
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

    let worker: Worker | null = null
    const needsRecalc = ref(true)

    const runHighestPowerCalc = () => {
      const chars = store.characters.filter(c => c.rarity === 5 && c.enabled)
        .concat(store.characters.filter(c => c.rarity != 5))
        .concat(store.characters.filter(c => c.name === LuxMagica))
        .map(c => simulateMaxAccountLevels.value ? withMaxLevelsForPlayerLevel(c, playerLevel.value) : c)
      needsRecalc.value = false
      calculating.value = true
      completedRuns.value = 0
      expectedRuns.value = 0
      currentBestTeam.value = undefined
      worker?.terminate()
      worker = new Worker(new URL('../workers/highestPowerWorker.ts', import.meta.url), { type: 'module' })
      worker.postMessage(JSON.parse(JSON.stringify(chars)))
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.type === 'progress') {
          completedRuns.value = e.data.completedRuns
          expectedRuns.value = e.data.expectedTotalRuns
          if (e.data.currentBestTeam) {
            currentBestTeam.value = e.data.currentBestTeam
            currentBestPwr.value = e.data.currentBestPwr
          }
        } else if (e.data.type === 'done') {
          highestTeam.value = e.data.bestTeam
          highestPwr.value = e.data.maxTeamPower
          calculating.value = false
        } else if (e.data.type === 'error') {
          console.error("Failed to calculate highest PWR team:", e.data.error)
          calculating.value = false
        }
      }
    }

    function triggerRecalc() {
      needsRecalc.value = true
      if (showHighestTeam.value) {
        runHighestPowerCalc()
      }
    }

    watch(showHighestTeam, (isOn) => {
      if (isOn) {
        if (needsRecalc.value) {
          runHighestPowerCalc()
        }
      } else {
        worker?.terminate()
        worker = null
        calculating.value = false
      }
    })

    watch(simulateMaxAccountLevels, () => {
      triggerRecalc()
    })

    watch(playerLevel, () => {
      if (simulateMaxAccountLevels.value) {
        triggerRecalc()
      }
    })

    onMounted(() => {
      if (showHighestTeam.value) {
        runHighestPowerCalc()
      }
    })

    onBeforeUnmount(() => {
      worker?.terminate()
    })

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

    onMounted(() => {
      scheduleBackfill(store.characters)
    })

    function sortCharacters(chars: Character[]) {
      return chars.slice().sort((a, b) => {
        if (sortBy.value === "id") return a.id - b.id
        if (sortBy.value === "name") return a.name.localeCompare(b.name)
        if (sortBy.value === "ch_name") return a.character_en.localeCompare(b.character_en)
        if (sortBy.value === "releaseDate") return new Date(a.releaseDate) > new Date(b.releaseDate)
        if (sortBy.value === "kiokuLvl") return b.kiokuLvl - a.kiokuLvl
        if (sortBy.value === "magicLvl") return b.magicLvl - a.magicLvl
        const statA = getCachedStats(a)?.[sortBy.value] ?? -Infinity
        const statB = getCachedStats(b)?.[sortBy.value] ?? -Infinity
        return statB - statA
      })
    }

    const groupedCharacters = computed(() => {
      if (groupBy.value === 'none') {
        return {
          All: sortCharacters(store.characters),
        }
      }

      const groups: Record<string, Character[]> = {}

      store.characters.forEach(char => {
        const group = groupBy.value === 'role'
          ? char.role
          : char.element

        if (!groups[group]) groups[group] = []
        groups[group].push(char)
      })

      Object.keys(groups).forEach(group => {
        groups[group] = sortCharacters(groups[group])
      })

      return groups
    })

    function isRarityToggleVisible(char: Character): boolean {
      if (char.rarity === 3 && !show3stars.value) return false
      if ((char.rarity === 4 || char.name === LuxMagica) && !show4stars.value) return false
      return true
    }

    function matchesFilters(char: Character): boolean {
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

    function isCharVisible(char: Character): boolean {
      return char.enabled && isRarityToggleVisible(char) && matchesFilters(char)
    }

    function visibleCountFor(chars: typeof store.characters) {
      return chars.filter(isCharVisible).length
    }

    const playerExpUsage = computed(() => {
      const lvl = Math.min(Math.max(playerLevel.value ?? 0, 1), maxPlayerLevel)
      const current = playerLevelCosts[lvl]?.exp ?? 1
      const max = playerLevelCosts[maxPlayerLevel]?.exp ?? 1
      return { current, max }
    })

    function getKiokuLevelCost(char: Character) {
      const kiokuMaxLvl = usePlayerLevelAsKiokuMaxLevel.value
        ? playerLevel.value
        : KiokuConstants.maxKiokuLvl

      const currLvl = Math.min(Math.max(char.kiokuLvl ?? 0, 1), kiokuMaxLvl)
      const current = kiokuLevelCosts[currLvl] ?? kiokuLevelCosts[0]
      const max = kiokuLevelCosts[kiokuMaxLvl] ?? current

      return {
        exp: { current: current.exp, max: max.exp },
        gold: { current: current.gold, max: max.gold },
      }
    }

    function sumKiokuLevelResources(chars: Character[]) {
      return chars.reduce((sum, c) => {
        const cost = getKiokuLevelCost(c)
        sum.exp.current += cost.exp.current
        sum.exp.max += cost.exp.max
        sum.gold.current += cost.gold.current
        sum.gold.max += cost.gold.max
        return sum
      }, { exp: { current: 0, max: 0 }, gold: { current: 0, max: 0 } })
    }

    const tabKiokuLevelResourceSums = computed(() => {
      const sums: Record<string, ReturnType<typeof sumKiokuLevelResources>> = {}
      for (const [role, chars] of Object.entries(groupedCharacters.value)) {
        sums[role] = sumKiokuLevelResources(chars.filter(isCharVisible))
      }
      return sums
    })

    const rarityKiokuLevelSums = computed(() => ({
      5: sumKiokuLevelResources(store.characters.filter(c => c.rarity === 5 && isCharVisible(c))),
      4: sumKiokuLevelResources(store.characters.filter(c => c.rarity === 4 && isCharVisible(c))),
      3: sumKiokuLevelResources(store.characters.filter(c => c.rarity === 3 && isCharVisible(c))),
    }))

    function getMagicLevelCost(char: Character) {
      const currLvl = Math.min(Math.max(char.magicLvl ?? 0, 0), KiokuConstants.maxMagicLvl)
      const current = magicLevelCosts[char.id]?.[currLvl] ?? magicLevelCosts[10010101]?.[currLvl]
      const max = magicLevelCosts[char.id]?.[KiokuConstants.maxMagicLvl] ?? current
      return {
        gold: { current: current.gold, max: max.gold },
        items: { current: current.items, max: max.items },
      }
    }

    function addRecords(
      a: Record<number, number>,
      b: Record<number, number>
    ): Record<number, number> {
      const result: Record<number, number> = { ...a }

      for (const [key, value] of Object.entries(b)) {
        result[Number(key)] = (result[Number(key)] ?? 0) + value
      }

      return result
    }

    function sumMagicLevelResources(chars: Character[]) {
      return chars.reduce((sum, c) => {
        const cost = getMagicLevelCost(c)
        sum.items.current = addRecords(sum.items.current, cost.items.current)
        sum.items.max = addRecords(sum.items.max, cost.items.max)
        sum.gold.current += cost.gold.current
        sum.gold.max += cost.gold.max
        return sum
      }, { items: { current: {} as Record<number, number>, max: {} as Record<number, number> }, gold: { current: 0, max: 0 } })
    }

    const tabMagicLevelResourceSums = computed(() => {
      const sums: Record<string, ReturnType<typeof sumMagicLevelResources>> = {}
      for (const [role, chars] of Object.entries(groupedCharacters.value)) {
        sums[role] = sumMagicLevelResources(chars.filter(isCharVisible))
      }
      return sums
    })

    const rarityMagicLevelSums = computed(() => ({
      5: sumMagicLevelResources(store.characters.filter(c => c.rarity === 5 && isCharVisible(c))),
      4: sumMagicLevelResources(store.characters.filter(c => c.rarity === 4 && isCharVisible(c))),
      3: sumMagicLevelResources(store.characters.filter(c => c.rarity === 3 && isCharVisible(c))),
    }))

    function getSpecialLevelCost(char: Character) {
      const currLvl = Math.min(Math.max(char.specialLvl ?? 1, 1), KiokuConstants.maxSpecialLvl - 1)
      const rarityCosts = specialUpgradeCosts[char.rarity] ?? specialUpgradeCosts[4]
      const current = rarityCosts[currLvl] ?? rarityCosts[4]
      const max = rarityCosts[KiokuConstants.maxSpecialLvl - 1] ?? current

      return {
        gold: { current: current.gold, max: max.gold },
        items: {
          current: { 1: current.item1, 2: current.item2, 3: current.item3 },
          max: { 1: max.item1, 2: max.item2, 3: max.item3 },
        },
      }
    }

    function sumSpecialLevelResources(chars: Character[]) {
      return chars.reduce((sum, c) => {
        const cost = getSpecialLevelCost(c)
        sum.items.current = addRecords(sum.items.current, cost.items.current)
        sum.items.max = addRecords(sum.items.max, cost.items.max)
        sum.gold.current += cost.gold.current
        sum.gold.max += cost.gold.max
        return sum
      }, { items: { current: {} as Record<number, number>, max: {} as Record<number, number> }, gold: { current: 0, max: 0 } })
    }

    const tabSpecialLevelResourceSums = computed(() => {
      const sums: Record<string, ReturnType<typeof sumSpecialLevelResources>> = {}
      for (const [role, chars] of Object.entries(groupedCharacters.value)) {
        sums[role] = sumSpecialLevelResources(chars.filter(isCharVisible))
      }
      return sums
    })

    const raritySpecialLevelSums = computed(() => ({
      5: sumSpecialLevelResources(store.characters.filter(c => c.rarity === 5 && isCharVisible(c))),
      4: sumSpecialLevelResources(store.characters.filter(c => c.rarity === 4 && isCharVisible(c))),
      3: sumSpecialLevelResources(store.characters.filter(c => c.rarity === 3 && isCharVisible(c))),
    }))

    function specialItemIdxToImg(idx: number) {
      return `/exedra-dmg-calc/items/specials/${idx}.png`
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
      triggerRecalc()
    }

    function handleFileChange(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        store.importCharacters(file).then(() => {
          triggerRecalc()
        }).catch(err => alert('Import failed: ' + err.message))
      }
    }

    function itemIdxToImg(idx: number, maybeElement?: KiokuElement | string) {
      let key = "light"
      if (Object.values(KiokuElement).includes(maybeElement)) {
        key = maybeElement!.toLowerCase()
      }
      return `/exedra-dmg-calc/items/${key}/${idx}.png`
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
      isCharVisible,
      stats,
      pendingBulk,
      applyBulk,
      handleFileChange,
      exportCharacters: store.exportCharacters,
      highestPwr,
      highestTeam,
      showHighestTeam,
      calculating,
      completedRuns,
      expectedRuns,
      currentBestTeam,
      currentBestPwr,
      sortBy,
      groupBy,
      playerLevel,
      usePlayerLevelAsKiokuMaxLevel,
      simulateMaxAccountLevels,
      maxPlayerLevel,
      showResourceCosts,
      showPerKiokuResourceCosts,
      playerExpUsage,
      toggleMissingAndWhole,
      formatAmount,
      formatTitle,
      tabKiokuLevelResourceSums,
      tabMagicLevelResourceSums,
      tabSpecialLevelResourceSums,
      rarityKiokuLevelSums,
      rarityMagicLevelSums,
      raritySpecialLevelSums,
      itemIdxToImg,
      specialItemIdxToImg,
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

.simulated-badge {
  margin-left: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted);
  opacity: 0.85;
  cursor: help;
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
  grid-template-columns: 240px 400px 160px 1fr;
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


/* ── Mobile overflow fixes ── */
@media (max-width: 600px) {
  .setup-page {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .list-header {
    display: none;
  }

  .role-header {
    min-width: 0;
    box-sizing: border-box;
    flex-wrap: wrap;
  }

  .role-header>* {
    min-width: 0;
  }

  .role-header>div {
    flex: 1 1 100%;
    min-width: 0;
    width: 100%;
  }

  .role-resources {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .role-resource-label {
    width: auto;
    min-width: 78px;
    flex: 0 0 78px;
  }

  .role-resources .magic-resource-groups {
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
  }

  .magic-resource-group {
    flex-wrap: wrap;
    min-width: 0;
    max-width: 100%;
  }

  .resource-chip {
    max-width: 100%;
    box-sizing: border-box;
  }

  .resource-summary {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .resource-summary-row {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    grid-template-columns: 35px minmax(0, 1fr);
    gap: 0.4rem;
    padding: 0.4rem;
  }

  .resource-summary-details {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .resource-summary-section {
    width: 100%;
    min-width: 0;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .resource-summary-section-label {
    width: 68px;
    flex: 0 0 68px;
  }

  .resource-summary-section>.resource-chip {
    flex: 0 0 auto;
  }

  .magic-resource-groups {
    flex: 1 1 0;
    width: auto;
    max-width: 100%;
    min-width: 0;
  }

  .magic-resource-group {
    flex-wrap: wrap;
    max-width: 100%;
  }
}
</style>
