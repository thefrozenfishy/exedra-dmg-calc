<template>
    <div class="setup-page">
        <h1 class="page-title">Kioku Grid</h1>

        <section class="toolbar card">
            <div class="toolbar-left">
                <ImageActionsToolbar target=".grid-scroll" filename="grid.png" :export-options="exportOpts"
                    :share-options="shareOptionsForGrid" />
            </div>
        </section>

        <section class="filters card">
            <span class="filters-heading">Roster</span>
            <label class="filter-chip" :class="{ active: show5stars }">
                <input type="checkbox" v-model="show5stars" /> ★★★★★
            </label>
            <label class="filter-chip" :class="{ active: show4stars }">
                <input type="checkbox" v-model="show4stars" /> ★★★★
            </label>
            <label class="filter-chip" :class="{ active: show3stars }">
                <input type="checkbox" v-model="show3stars" /> ★★★
            </label>
            <label class="filter-chip" :class="{ active: showUnowned }">
                <input type="checkbox" v-model="showUnowned" /> Unowned
            </label>
            <label class="filter-chip" :class="{ active: showLimiteds }">
                <input type="checkbox" v-model="showLimiteds" /> Limiteds
            </label>
            <label class="filter-chip" :class="{ active: showStandards }">
                <input type="checkbox" v-model="showStandards" /> Standards
            </label>
        </section>

        <section class="filters card">
            <span class="filters-heading">Display</span>
            <label class="filter-chip" :class="{ active: splitAttackerRange }">
                <input type="checkbox" v-model="splitAttackerRange" /> Split Attacker ranges
            </label>
            <label class="filter-chip" :class="{ active: splitBreakerRange }">
                <input type="checkbox" v-model="splitBreakerRange" /> Split Breaker ranges
            </label>
            <label class="filter-chip" :class="{ active: splitDebufferRange }">
                <input type="checkbox" v-model="splitDebufferRange" /> Split Debuffer ranges
            </label>
            <label class="filter-chip" :class="{ active: displayArchetypes }">
                <input type="checkbox" v-model="displayArchetypes" /> Display Archetypes
            </label>
        </section>

        <section class="card axis-row">
            <span class="filters-heading">Axes</span>
            <label class="field">
                <span class="field-label">Rows</span>
                <select :value="yAxisKey" class="axis-select" @change="onYChange">
                    <option v-for="opt in axisOptions" :key="opt.key" :value="opt.key">
                        {{ opt.label }} {{ opt.key === xAxisKey ? "🗘" : "" }}
                    </option>
                </select>
            </label>
            <label class="field">
                <span class="field-label">Columns</span>
                <select :value="xAxisKey" class="axis-select" @change="onXChange">
                    <option v-for="opt in axisOptions" :key="opt.key" :value="opt.key">
                        {{ opt.label }} {{ opt.key === yAxisKey ? "🗘" : "" }}
                    </option>
                </select>
            </label>
        </section>

        <div class="options-bar">
            <div class="options-row">
                <button v-for="el in allElementValues" :key="el" class="chip"
                    :class="hiddenElements.includes(el) ? 'chip--hidden' : 'chip--visible'"
                    @click="toggleElement(el as KiokuElement)"
                    :title="hiddenElements.includes(el) ? `Show ${el}` : `Hide ${el}`">
                    <img :src="`/exedra-dmg-calc/elements/${el}.png`" :alt="el" />
                </button>
            </div>
            <div class="options-row">
                <button v-for="vRole in allVirtualRoleValues" :key="vRole" class="chip"
                    :class="hiddenVirtualRoles.includes(vRole) ? 'chip--hidden' : 'chip--visible'"
                    @click="toggleVirtualRole(vRole)"
                    :title="hiddenVirtualRoles.includes(vRole) ? `Show ${virtualRoleLabel(vRole)}` : `Hide ${virtualRoleLabel(vRole)}`">
                    <div class="role-chip-inner">
                        <img :src="`/exedra-dmg-calc/roles/${virtualRoleBase(vRole)}.png`" :alt="vRole" />
                        <span v-if="isVirtualSplitRole(vRole)" class="role-chip-label">{{ virtualRoleRangeTag(vRole)
                        }}</span>
                    </div>
                </button>
                <button class="chip chip-all" :class="allVirtualRolesVisible ? 'chip--visible' : 'chip--hidden'"
                    @click="toggleAllVirtualRoles" title="Enable/Disable all roles">
                    <span class="chip-all-label">All</span>
                </button>
            </div>
            <div class="options-row" v-if="displayArchetypes && archetypeRules.length">
                <button v-for="rule in archetypeRules" :key="rule.id" class="chip"
                    :class="activeArchetypes.includes(rule.id) ? 'chip--visible' : 'chip--hidden'"
                    @click="toggleArchetype(rule.id)"
                    :title="activeArchetypes.includes(rule.id) ? `Hide ${rule.label}` : `Show ${rule.label}`">
                    <img :src="`/exedra-dmg-calc/archetypes/${rule.id}.png`" :alt="rule.label" />
                </button>
                <button class="chip archetype-none-chip"
                    :class="activeArchetypes.includes(NONE_ARCHETYPE_ID) ? 'chip--visible' : 'chip--hidden'"
                    @click="toggleArchetype(NONE_ARCHETYPE_ID)"
                    :title="activeArchetypes.includes(NONE_ARCHETYPE_ID) ? 'Hide characters with no archetype' : 'Show characters with no archetype'">
                    <img :src="`/exedra-dmg-calc/archetypes/none.png`" alt="None" />
                </button>
                <button class="chip chip-all" :class="allArchetypesVisible ? 'chip--visible' : 'chip--hidden'"
                    @click="toggleAllArchetypes" title="Enable/Disable all archetypes">
                    <span class="chip-all-label">All</span>
                </button>
            </div>
        </div>
        <div class="grid-scroll">
            <table class="er-grid">
                <thead>
                    <tr>
                        <th class="corner-cell"></th>
                        <th v-for="xVal in visibleXValues" :key="xVal" class="header-cell element-header">
                            <img v-if="xAxisKey === 'element'" :src="`/exedra-dmg-calc/elements/${xVal}.png`"
                                :alt="xVal" :title="`Hide ${xVal}`" class="header-icon header-icon-btn"
                                @click="toggleElement(xVal as KiokuElement)" />
                            <template v-else-if="xAxisKey === 'role'">
                                <div class="role-header-inner" @click="toggleVirtualRole(xVal)"
                                    :title="`Hide ${virtualRoleLabel(xVal)}`">
                                    <img :src="`/exedra-dmg-calc/roles/${virtualRoleBase(xVal)}.png`" :alt="xVal"
                                        class="header-icon header-icon-btn" />
                                    <span v-if="isVirtualSplitRole(xVal)" class="role-header-label">{{
                                        virtualRoleRangeTag(xVal) }}</span>
                                </div>
                            </template>
                            <span v-else class="ascension-header-label">{{ xVal === "-1" ? "Not Owned" : `A${xVal}`
                                }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="yVal in visibleYValues" :key="yVal">
                        <td class="header-cell role-header">
                            <img v-if="yAxisKey === 'element'" :src="`/exedra-dmg-calc/elements/${yVal}.png`"
                                :alt="yVal" :title="`Hide ${yVal}`" class="header-icon header-icon-btn"
                                @click="toggleElement(yVal as KiokuElement)" />
                            <template v-else-if="yAxisKey === 'role'">
                                <div class="role-header-inner" @click="toggleVirtualRole(yVal)"
                                    :title="`Hide ${virtualRoleLabel(yVal)}`">
                                    <img :src="`/exedra-dmg-calc/roles/${virtualRoleBase(yVal)}.png`" :alt="yVal"
                                        class="header-icon header-icon-btn" />
                                    <span v-if="isVirtualSplitRole(yVal)" class="role-header-label">{{
                                        virtualRoleRangeTag(yVal) }}</span>
                                </div>
                            </template>
                            <span v-else class="ascension-header-label">{{ yVal === "-1" ? "Not Owned" : `A${yVal}`
                                }}</span>
                        </td>
                        <td v-for="xVal in visibleXValues" :key="xVal" class="grid-cell">
                            <template v-for="r in [5, 4, 3]" :key="r">
                                <div v-if="shouldShow(r)" class="rarity-band" :class="`rarity-${r}`"
                                    :style="{ '--band-rows': bandRows(yVal, r), '--band-cols': bandCols(xVal) }">
                                    <div v-for="ch in getChars(xVal, yVal, r)" :key="ch.id" class="char-thumb">
                                        <div class="character-img-wrapper">
                                            <div class="avatar-slot">
                                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                                    <img :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`"
                                                        :alt="ch.name" :title="ch._title" class="char-img"
                                                        :class="ch._borderClass" />
                                                </a>
                                                <div class="axis-info-badge level-badge"
                                                    :class="{ low: ch.ascension < 2, mid: 2 <= ch.ascension && ch.ascension < 5, high: ch.ascension === 5 }"
                                                    v-if="infoAxisKey === 'ascension'">
                                                    {{ ch.ascension === -1 ? "X" : `A${ch.ascension}` }}
                                                </div>
                                                <div class="axis-info-badge level-badge info-badge-img"
                                                    v-else-if="infoAxisKey === 'element'">
                                                    <img :src="`/exedra-dmg-calc/elements/${ch.element}.png`"
                                                        :alt="ch.element" class="info-badge-icon" />
                                                </div>
                                                <div class="axis-info-badge level-badge"
                                                    v-else-if="infoAxisKey === 'role' && shouldShowRangeBadge(ch)">
                                                    <div class="role-badge-inner">
                                                        <img :src="`/exedra-dmg-calc/roles/${ch.role}.png`"
                                                            :alt="ch.role" class="info-badge-icon" />
                                                        <span class="role-badge-tag">{{ rangeTag(ch.range, ch.role)[0]
                                                            }}</span>
                                                    </div>
                                                </div>
                                                <div class="axis-info-badge level-badge info-badge-img"
                                                    v-else-if="infoAxisKey === 'role'">
                                                    <img :src="`/exedra-dmg-calc/roles/${ch.role}.png`" :alt="ch.role"
                                                        class="info-badge-icon" />
                                                </div>
                                            </div>
                                            <div v-if="displayArchetypes && ch._archetypes.length"
                                                class="archetype-icons">
                                                <img v-for="arche in ch._archetypes" :key="arche.id"
                                                    :src="`/exedra-dmg-calc/archetypes/${arche.id}.png`"
                                                    :alt="arche.label" :title="arche.label" class="archetype-icon" />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <section class="card bench-toggle-section">
            <label class="filter-chip" :class="{ active: showBenchCharts }"
                title="Runs a battle simulation for every Kioku in the background. Heavy on phones and low-memory devices.">
                <input type="checkbox" v-model="showBenchCharts" /> Show damage simulation charts
            </label>
            <p v-if="!showBenchCharts" class="gain-desc">The Lux support and damage dealer charts load precalculated
                results and simulate whatever is missing in your browser, which can use a lot of memory (may crash the tab
                on some phones).</p>
        </section>

        <section v-for="bc in (showBenchCharts ? benchCharts : [])" :key="bc.sectionClass" class="card gain-section" :class="bc.sectionClass">
            <div class="chart-export-toolbar">
                <ImageActionsToolbar :target="`.${bc.sectionClass}`" :filename="bc.filename"
                    :export-options="() => chartExportOpts(`.${bc.sectionClass}`)"
                    :share-options="shareOptionsForBenchChart(bc.title)" :disabled="!bc.chart.bars.length" />
            </div>
            <div class="gain-header filters-heading">{{ bc.title }} <span class="beta-badge">New engine</span></div>
            <p v-for="line in bc.desc" :key="line" class="gain-desc">{{ line }}</p>

            <div class="gain-bar-options">
                <div class="fight-mode-row">
                    <span class="fight-mode-label">Display</span>
                    <div class="fight-mode-toggle" :style="{ '--count': bc.metrics.length }" role="radiogroup" aria-label="Damage metric">
                        <div class="fight-mode-highlight"
                            :style="{ transform: `translateX(${bc.metricIndex * 100}%)` }">
                        </div>
                        <button v-for="(opt, i) in bc.metrics" :key="opt.label" type="button"
                            class="fight-mode-option" :class="{ active: bc.metricIndex === i }"
                            :title="opt.title" @click="opt.select()">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <div v-if="bc.battleLength" class="fight-mode-row">
                    <span class="fight-mode-label">Simulation depth</span>
                    <div class="fight-mode-toggle" style="--count: 3" role="radiogroup" aria-label="Battle length">
                        <div class="fight-mode-highlight"
                            :style="{ transform: `translateX(${benchSpeedIndex * 100}%)` }"></div>
                        <button v-for="opt in benchSpeedOptions" :key="opt.value" type="button"
                            class="fight-mode-option" :class="{ active: benchSpeed === opt.value }" :title="opt.title"
                            @click="benchSpeed = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <div v-if="bc.kind === 'break'" class="fight-mode-row">
                    <span class="fight-mode-label">Break per</span>
                    <div class="fight-mode-toggle" style="--count: 2" role="radiogroup" aria-label="Break per">
                        <div class="fight-mode-highlight"
                            :style="{ transform: `translateX(${benchBreakPerSp ? 100 : 0}%)` }"></div>
                        <button v-for="opt in breakPerOptions" :key="opt.label" type="button" class="fight-mode-option"
                            :class="{ active: benchBreakPerSp === opt.value }" :title="opt.title"
                            @click="benchBreakPerSp = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <div v-if="bc.fightType" class="fight-mode-row">
                    <span class="fight-mode-label">Fight type</span>
                    <div class="fight-mode-toggle" role="radiogroup" aria-label="Fight type">
                        <div class="fight-mode-highlight"
                            :style="{ transform: `translateX(${fightModeIndex * 100}%)` }"></div>
                        <button v-for="opt in fightModeOptions" :key="opt.value" type="button" class="fight-mode-option"
                            :class="{ active: fightMode === opt.value }" :title="opt.title"
                            @click="fightMode = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
                <div class="fight-mode-row">
                    <span class="fight-mode-label">Simulate using</span>
                    <div class="fight-mode-toggle" style="--count: 3" role="radiogroup" aria-label="Simulate using">
                        <div class="fight-mode-highlight"
                            :style="{ transform: `translateX(${levelsModeIndex * 100}%)` }"></div>
                        <button v-for="opt in levelsModeOptions" :key="opt.label" type="button"
                            class="fight-mode-option" :class="{ active: levelsMode === opt.value }"
                            :title="opt.title" @click="levelsMode = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
                <div v-if="levelsMode === 'multi'" class="fight-mode-row" role="group" aria-label="Ascensions">
                    <span class="fight-mode-label">Ascensions</span>
                    <button v-for="a in ALL_ASCENSIONS" :key="a" type="button" class="filter-chip"
                        :class="{ active: multiAscensions.includes(a) }" :aria-pressed="multiAscensions.includes(a)"
                        :title="multiAscensions.includes(a) && multiAscensions.length === 1 ? 'At least one ascension stays selected' : `Show A${a}`"
                        @click="toggleMultiAscension(a)">A{{ a }}</button>
                </div>
                <button type="button" class="filter-chip" :disabled="bc.running"
                    title="Most results come precalculated with the site; anything missing is simulated here and saved in this browser. Recalculate simulates this whole chart again in your browser."
                    @click="runBench(bc.kind, { fresh: true })">Recalculate</button>
            </div>
            <p v-if="bc.chart.error" class="gain-empty">{{ bc.chart.error }}</p>
            <p v-else-if="!bc.chart.bars.length" class="gain-empty">
                {{ bc.status || "No characters to show with the current filters." }}</p>
            <template v-else>
                <p v-if="bc.status" class="gain-desc">{{ bc.status }}</p>
                <div class="gain-legend">
                    <span v-for="role in bc.chart.roles" :key="role" class="gain-legend-item">
                        <span class="gain-legend-swatch" :style="{ background: roleColor(role) }"></span>{{
                            virtualRoleLabel(role) }}
                    </span>
                </div>
                <div class="gain-scroll">
                    <div class="gain-chart">
                        <div v-for="bar in bc.chart.bars" :key="bar.id" class="gain-col bench-col"
                            :class="{ variant: bar.variant, active: activeBarTip?.id === bar.id, negative: bar.gain < 0 }"
                            :title="activeBarTip?.id === bar.id ? undefined : bar.title"
                            @click.stop="toggleBarTip(bar, $event)">
                            <div class="gain-track">
                                <div class="gain-zero" :style="{ bottom: `${bc.chart.zeroPct}%` }"></div>
                                <div class="gain-bar-wrap" :style="bar.style">
                                    <div class="gain-bar" :style="{ backgroundColor: roleColor(bar.vRole) }">
                                    </div>
                                    <span class="gain-value">{{ bar.label }}</span>
                                </div>
                            </div>
                            <div class="gain-name" :title="bar.name">
                                <span class="gain-char-icon-wrap">
                                    <img class="gain-char-icon" :class="bar._borderClass"
                                        :src="`/exedra-dmg-calc/kioku_images/${bar.charId}_thumbnail.png`"
                                        :alt="bar.name" />
                                    <span v-if="bar.ascension !== undefined" class="gain-asc-badge"
                                        :class="ascBadgeClass(bar.ascension)"
                                        :title="`Calculated at A${bar.ascension}`">{{ bar.ascension }}</span>
                                </span>
                                <span v-if="bar.spLabel" class="gain-sp" title="SP the rotation costs per 100 AV">{{ bar.spLabel }}</span>

                                <div v-if="bar.tags.length" class="gain-tag-icons">
                                    <template v-for="tag in bar.tags" :key="`${tag.kind}:${tag.value}`">
                                        <span v-if="tag.icons && tag.icons.length > 1" class="gain-tag-icon gain-tag-split"
                                            :title="tag.value" role="img" :aria-label="tag.value">
                                            <img v-for="(icon, i) in tag.icons" :key="icon" :src="icon" alt=""
                                                :style="{ clipPath: slantSlice(i, tag.icons.length) }" />
                                            <svg class="gain-tag-split-lines" viewBox="0 0 100 100" preserveAspectRatio="none"
                                                aria-hidden="true">
                                                <line v-for="k in tag.icons.length - 1" :key="k"
                                                    :x1="(k / tag.icons.length) * 100 + SLANT" y1="0"
                                                    :x2="(k / tag.icons.length) * 100 - SLANT" y2="100" />
                                            </svg>
                                        </span>
                                        <img v-else class="gain-tag-icon" :src="tag.icon" :alt="tag.value" :title="tag.value" />
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-for="note in bc.chart.notes" :key="note" class="gain-desc">{{ note }}</p>
            </template>
        </section>

        <div v-if="activeBarTip" class="gain-tip" :class="{ below: activeBarTip.below }"
            :style="{ left: `${activeBarTip.x}px`, top: `${activeBarTip.y}px` }" @click.stop="closeBarTip">
            {{ activeBarTip.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, type ShallowRef } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character, KiokuConstants, withMaxLevelsForPlayerLevel } from "../types/KiokuTypes"
import { Ailment, KiokuElement, KiokuObtain, KiokuRole, LuxMagica, obtainBorderClass } from '../types/enums'
import { useSetting } from "../store/settingsStore"
import { ScoreAttackKioku } from "../models/ScoreAttackKioku"
import { skillDetails } from "../utils/helpers"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
import type { ImageExportOptions } from "../utils/image"
import { useFriendStore } from "../store/friendStore"
import { archetypeRules, archetypesForKit } from "../models/KiokuArchetypes"
import type { LuxBenchJob, LuxBenchMessage } from "../workers/luxBenchWorker"
import type { BenchRow } from "../models/LuxBench"
import { BENCH_INFINITE_SP, BENCH_SEEDS, benchCharKey, clearBenchCache, loadBenchCache, loadBenchPrecalc, precalcEntry, saveBenchCache, type BenchCacheEntry, type BenchSetup } from "../utils/luxBenchCache"

const store = useCharacterStore()

type AxisKey = "element" | "role" | "ascension"

const axisOptions: { key: AxisKey; label: string }[] = [
    { key: "element", label: "Element" },
    { key: "role", label: "Role" },
    { key: "ascension", label: "Ascension" },
]

const xAxisKey = useSetting<AxisKey>("gridXAxis", "role")
const yAxisKey = useSetting<AxisKey>("gridYAxis", "ascension")

const infoAxisKey = computed<AxisKey>(() =>
    axisOptions.find(o => o.key !== xAxisKey.value && o.key !== yAxisKey.value)!.key
)

const onXChange = (e: Event) => {
    const newVal = (e.target as HTMLSelectElement).value as AxisKey
    if (newVal === yAxisKey.value) yAxisKey.value = xAxisKey.value
    xAxisKey.value = newVal
}

const onYChange = (e: Event) => {
    const newVal = (e.target as HTMLSelectElement).value as AxisKey
    if (newVal === xAxisKey.value) xAxisKey.value = yAxisKey.value
    yAxisKey.value = newVal
}

const shouldShow = (r: number) => {
    if (r === 5) return show5stars.value
    if (r === 4) return show4stars.value
    if (r === 3) return show3stars.value
    return false
}

const show5stars = useSetting("showGrid5stars", true)
const show4stars = useSetting("showGrid4stars", false)
const show3stars = useSetting("showGrid3stars", false)
const showUnowned = useSetting("showGridUnowned", true)
const showLimiteds = useSetting("showGridLimiteds", true)
const showStandards = useSetting("showGridStandards", true)
const splitAttackerRange = useSetting("splitAttackerRange", true)
const splitBreakerRange = useSetting("splitBreakerRange", true)
const splitDebufferRange = useSetting("splitDebufferRange", true)
const displayArchetypes = useSetting("displayArchetypes", true)
type LevelsMode = "max" | "mine" | "multi"
// gridLevelsMode replaced the boolean gridSimulateMaxLevels (its value is the default, so the old choice is kept)
const legacySimulateMaxLevels = useSetting("gridSimulateMaxLevels", true)
const levelsMode = useSetting<LevelsMode>("gridLevelsMode", legacySimulateMaxLevels.value ? "max" : "mine")
const simulateMaxLevels = computed(() => levelsMode.value === "max")
const levelsModeOptions = [
    { value: "max", label: "All A5", title: "Every Kioku is simulated at A5 with max Kioku, Magic, Heartphial and Special level" },
    { value: "mine", label: "My Kioku", title: "Your own Kioku's ascension is used with max Kioku, Magic, Heartphial and Special level, and unowned Kioku are left out" },
    { value: "multi", label: "Multiple ascensions", title: "Every Kioku is simulated at each selected ascension with max levels: one bar per ascension (equal bars are merged, e.g. A0-2)" },
] as const satisfies readonly { value: LevelsMode, label: string, title: string }[]
const levelsModeIndex = computed(() => Math.max(0, levelsModeOptions.findIndex(o => o.value === levelsMode.value)))
const ALL_ASCENSIONS = [0, 1, 2, 3, 4, 5] as const
const multiAscensions = useSetting<number[]>("gridMultiAscensions", [...ALL_ASCENSIONS])
// at least one stays selected; always a new, sorted array (the setting is replaced, not mutated)
const toggleMultiAscension = (a: number) => {
    const cur = multiAscensions.value
    if (cur.includes(a)) { if (cur.length > 1) multiAscensions.value = cur.filter(x => x !== a) }
    else multiAscensions.value = [...cur, a].sort((x, y) => x - y)
}

const fightModeOptions = [
    { value: "st", label: "ST", title: "One enemy" },
    { value: "prox", label: "Prox", title: "Three enemies: proximity and AoE skills hit all three" },
    { value: "aoe", label: "AoE", title: "Five enemies: proximity skills hit the middle three, AoE skills all five" },
] as const
type FightMode = typeof fightModeOptions[number]["value"]
const fightMode = useSetting<FightMode>("fightMode", "aoe")
const fightModeIndex = computed(() => fightModeOptions.findIndex(opt => opt.value === fightMode.value))

// Beta charts (battle engine): opt-in, because they spin up several workers per chart that each load the game data,
// which crashes the tab on low-memory phones ("Aw, Snap!" on Android Chrome).
const showBenchCharts = useSetting("gridShowBenchCharts", false)
// Beta charts (battle engine): their own metric toggle, since "average" means something else there.
const benchAverageDmg = useSetting("gridBenchAverageDmg", false)
const benchMetricOptions = [
    { value: false, label: "Max Burst", title: "The damage dealer's Ultimate, every hit a crit, with every buff and debuff at full stacks" },
    { value: true, label: "Average Damage", title: "The damage dealer's total damage over 5, 15 or 100 turns of simulated battle with SP refilled every turn (average crit damage per hit; crits rolled over 10 battles when a kit reacts to crits)" },
] as const
const benchMetricIndex = computed(() => benchMetricOptions.findIndex(opt => opt.value === benchAverageDmg.value))
// The damage dealer chart's third display: break gauge removed per 100 AV (its own bench job, "break").
const benchAttackerBreak = useSetting("gridBenchAttackerBreak", false)
// Break shown per 100 AV, or per SP the rotation costs (sorted from least to most SP efficient)
const benchBreakPerSp = useSetting("gridBenchBreakPerSp", false)
const breakPerOptions = [
    { value: false, label: "100 AV", title: "Break gauge removed per 100 AV (one turn)" },
    { value: true, label: "SP", title: "Break gauge removed per SP the rotation costs, least to most SP efficient" },
] as const

// Average Damage battle length. Each length is its own setup in the bench cache (the AV is part of its key), so
// switching back and forth reuses the results of every length already calculated.
const benchSpeedOptions = [
    { value: "fast", label: "Fast (5 turns)", turns: 5, title: "5 turns (500 AV) per battle. Less accurate" },
    { value: "medium", label: "Medium (15 turns)", turns: 15, title: "15 turns (1500 AV) per battle" },
    { value: "slow", label: "Slow (100 turns)", turns: 100, title: "100 turns (10000 AV) per battle. Very accurate" },
] as const
type BenchSpeed = typeof benchSpeedOptions[number]["value"]
const benchSpeed = useSetting<BenchSpeed>("gridBenchSpeed", "fast")
const benchSpeedIndex = computed(() => Math.max(0, benchSpeedOptions.findIndex(opt => opt.value === benchSpeed.value)))
const benchTurns = computed(() => benchSpeedOptions[benchSpeedIndex.value].turns)

type VirtualRole = string

const SPLITTABLE_ROLES: string[] = [KiokuRole.Attacker, KiokuRole.Debuffer, KiokuRole.Breaker]

const splitSettingForRole = (role: string) => {
    if (role === KiokuRole.Attacker) return splitAttackerRange
    if (role === KiokuRole.Breaker) return splitBreakerRange
    if (role === KiokuRole.Debuffer) return splitDebufferRange
    return null
}

const rangeTag = (range: number, role: KiokuRole): string => {
    if (range === 1) return "ST"
    if (range === 3) return "AOE"
    if (role === KiokuRole.Breaker) return "AOE"
    return "Prox"
}

const virtualRoleForChar = (ch: { role: KiokuRole; range: number }): VirtualRole => {
    const setting = splitSettingForRole(ch.role)
    if (setting && setting.value) {
        return `${ch.role}-${rangeTag(ch.range, ch.role)}`
    }
    return ch.role
}

const isVirtualSplitRole = (vRole: VirtualRole): boolean =>
    SPLITTABLE_ROLES.some(role => vRole === `${role}-ST` || vRole === `${role}-Prox` || vRole === `${role}-AOE`)

const virtualRoleBase = (vRole: VirtualRole): string => {
    const role = SPLITTABLE_ROLES.find(r => vRole === `${r}-ST` || vRole === `${r}-Prox` || vRole === `${r}-AOE`)
    return role ?? vRole
}

const virtualRoleRangeTag = (vRole: VirtualRole): string =>
    isVirtualSplitRole(vRole) ? vRole.slice(vRole.lastIndexOf("-") + 1) : ""

const virtualRoleLabel = (vRole: VirtualRole): string =>
    isVirtualSplitRole(vRole) ? `${virtualRoleBase(vRole)} (${virtualRoleRangeTag(vRole)})` : vRole

const shouldShowRangeBadge = (ch: { role: string }): boolean => {
    const setting = splitSettingForRole(ch.role)
    return !!setting && setting.value
}

const hiddenElements = useSetting<KiokuElement[]>("hiddenGridElements", [])
const hiddenVirtualRoles = useSetting<VirtualRole[]>("hiddenGridRoles", [])
const NONE_ARCHETYPE_ID = "__no_archetype__"
const activeArchetypes = useSetting<string[]>(
    "activeGridArchetypes",
    [...archetypeRules.map(r => r.id), NONE_ARCHETYPE_ID]
)

const toggleElement = (el: KiokuElement) => {
    hiddenElements.value = hiddenElements.value.includes(el)
        ? hiddenElements.value.filter(e => e !== el)
        : [...hiddenElements.value, el]
}

const toggleVirtualRole = (vRole: VirtualRole) => {
    hiddenVirtualRoles.value = hiddenVirtualRoles.value.includes(vRole)
        ? hiddenVirtualRoles.value.filter(r => r !== vRole)
        : [...hiddenVirtualRoles.value, vRole]
}

const toggleArchetype = (id: string) => {
    activeArchetypes.value = activeArchetypes.value.includes(id)
        ? activeArchetypes.value.filter(a => a !== id)
        : [...activeArchetypes.value, id]
}

const toggleAllVirtualRoles = () => {
    hiddenVirtualRoles.value = hiddenVirtualRoles.value.length === 0
        ? [...allVirtualRoleValues.value]
        : []
}

const allVirtualRolesVisible = computed(() => hiddenVirtualRoles.value.length === 0)

const toggleAllArchetypes = () => {
    const allArchetypeIds = [...archetypeRules.map(r => r.id), NONE_ARCHETYPE_ID]
    activeArchetypes.value = activeArchetypes.value.length === allArchetypeIds.length
        ? []
        : allArchetypeIds
}

const allArchetypesVisible = computed(() =>
    activeArchetypes.value.length === archetypeRules.length + 1
)

const skillDetailsBySkillMstId = (() => {
    const map = new Map<number, (typeof skillDetails[keyof typeof skillDetails])[]>()
    for (const v of Object.values(skillDetails)) {
        const arr = map.get(v.skillMstId) ?? []
        arr.push(v)
        map.set(v.skillMstId, arr)
    }
    return map
})()

const computeSkillRange = (k: ScoreAttackKioku): number => {
    const effects = skillDetailsBySkillMstId.get(k.data.special_id * 100 + 10) ?? []
    const relevant = effects.filter(e => e.abilityEffectType.startsWith("DMG_"))
    const highest = relevant.reduce((max, e) => (e.value1 > max ? e.value1 : max), 1)
    let range = 1
    for (const e of relevant) {
        if (e.value1 >= highest * 0.6) range = Math.max(range, e.range)
    }
    return range
}

const markedCharacters = computed(() => store.characters.map(c => {
    let range = 1
    if (c.name === LuxMagica) c.rarity = 4
    if (!c.enabled) c.ascension = -1
    const k = new ScoreAttackKioku({ ...c, ascension: 2 })
    range = computeSkillRange(k)
    return {
        ...c,
        range,
        _borderClass: borderClass(c),
        _title: makeTitle(c),
        _archetypes: archetypesForKit(k.data),
    }
}))

const baseRoleOrder = computed(() =>
    Object.values(KiokuRole).sort((a, b) => {
        if (a === KiokuRole.Defender) return 1
        if (b === KiokuRole.Defender) return -1
        if (a === KiokuRole.Healer) return 1
        if (b === KiokuRole.Healer) return -1
        return 0
    })
)

const allVirtualRoleValues = computed<VirtualRole[]>(() => {
    const result: VirtualRole[] = []
    for (const role of baseRoleOrder.value) {
        const setting = splitSettingForRole(role)
        if (setting && setting.value) {
            if (role === KiokuRole.Breaker) {
                result.push(`${role}-ST`, `${role}-AOE`)
            } else {
                result.push(`${role}-ST`, `${role}-Prox`, `${role}-AOE`)
            }
        } else {
            result.push(role)
        }
    }
    return result
})

const displayedVirtualRoles = computed(() =>
    allVirtualRoleValues.value.filter(vr => !hiddenVirtualRoles.value.includes(vr))
)

const allChars = computed(() =>
    markedCharacters.value
        .filter(c => showUnowned.value ? true : c.enabled)
        .filter(c => showLimiteds.value ? true : !c.isLimitedChar)
        .filter(c => showStandards.value ? true : c.isLimitedChar)
        .filter(c => !hiddenElements.value.includes(c.element as KiokuElement))
        .filter(c => !hiddenVirtualRoles.value.includes(virtualRoleForChar(c)))
        .filter(c => shouldShow(c.rarity))
        .filter(c => {
            if (activeArchetypes.value.length === 0) return false
            if (c._archetypes.length === 0) return activeArchetypes.value.includes(NONE_ARCHETYPE_ID)
            return c._archetypes.some(a => activeArchetypes.value.includes(a.id))
        })
)

const ROLE_COLORS: Record<string, string> = {
    [KiokuRole.Attacker]: "#926262",
    [KiokuRole.Breaker]: "#9d955d",
    [KiokuRole.Buffer]: "#8f6f55",
    [KiokuRole.Debuffer]: "#7a6986",
    [KiokuRole.Healer]: "#658169",
    [KiokuRole.Defender]: "#5e638c",
}

// Colours used by the bar charts when a role's range split is enabled (same split as the grid).
// Keys match the virtual roles, e.g. "Attacker-ST". Placeholder colours, change as you like.
const SPLIT_ROLE_COLORS: Record<string, string> = {
    [`${KiokuRole.Attacker}-ST`]: "#a83a3a",
    [`${KiokuRole.Attacker}-Prox`]: "#d97a4e",
    [`${KiokuRole.Attacker}-AOE`]: "#e8a9a9",
    [`${KiokuRole.Breaker}-ST`]: "#a8902a",
    [`${KiokuRole.Breaker}-AOE`]: "#dfd26f",
    [`${KiokuRole.Debuffer}-ST`]: "#5b4a85",
    [`${KiokuRole.Debuffer}-Prox`]: "#8b6fc0",
    [`${KiokuRole.Debuffer}-AOE`]: "#bfa8e3",
}
// Accepts either a plain role ("Buffer") or a virtual split role ("Attacker-Prox")
const roleColor = (vRole: string) =>
    SPLIT_ROLE_COLORS[vRole] ?? ROLE_COLORS[vRole] ?? "#9ca3af"

const maxLevelsForChart = (c: Character): Character =>
    withMaxLevelsForPlayerLevel({ ...c, ascension: KiokuConstants.maxAscension }, KiokuConstants.maxKiokuLvl)

// Lux is the fixed yardstick (dealer, filler and reference), so she always uses max levels.
// "My Kioku" keeps the account's ascension but uses max levels.
const prepareForChart = (c: Character): Character =>
    simulateMaxLevels.value ? maxLevelsForChart(c) : withMaxLevelsForPlayerLevel({ ...c }, KiokuConstants.maxKiokuLvl)

// Only "My Kioku" is limited to owned characters.
const chartCharacters = () =>
    markedCharacters.value.filter(c => c.name !== LuxMagica && (levelsMode.value !== "mine" || c.enabled))

// One bench unit to simulate: a character at the chart's levels. `benchKey` identifies it in the results and the worker
// messages: the character id, or in "Multiple ascensions" one per ascension (id * 10 + ascension).
type BenchUnitChar = Character & { benchKey: number }
// The break chart only has Breakers (a subset of the other charts' characters).
const benchUnits = (kind?: BenchChartKind): BenchUnitChar[] => chartCharacters().filter(c => kind !== "break" || c.role === KiokuRole.Breaker).flatMap(c => levelsMode.value === "multi"
    ? multiAscensions.value.map(a => ({
        ...withMaxLevelsForPlayerLevel({ ...c, ascension: a }, KiokuConstants.maxKiokuLvl), benchKey: c.id * 10 + a,
    }))
    : [{ ...prepareForChart(c), benchKey: c.id }])

// The levels part alone (the break chart has its own gear text).
const levelsOnlyDescription = computed(() => levelsMode.value === "max"
    ? `All characters are A5 and max level. ${LuxMagica} is A0 (no follow-ups).`
    : levelsMode.value === "multi"
        ? `Every character is simulated at max level at each selected ascension (${multiAscensions.value.map(a => `A${a}`).join(", ")}), one bar per ascension; ascensions with the same result share one bar (e.g. A0-2). The number on the icon is the ascension. ${LuxMagica} is always max level, A0.`
        : `All characters use your current ascension with max levels, unowned characters are left out. ${LuxMagica} is always max level, A0.`)
const levelsDescription = computed(() => levelsOnlyDescription.value + ` Every character measured and the ${LuxMagica} damage dealer wear the same gear instead of your own: their EX crystalis, Towering Offense++ (Towering Bulwark++ for DEF-based damage), the crystalis of their element, Dominant Blow++, the portrait Farewell to a Future Unseen (crit rate +15%) and The Universe's Edge (A5, max level) as support, which only works on Attackers. The ${LuxMagica} damage dealer also gets the average self buffs of the 5 star Attackers (ATK, DMG, crit, SPD, MP recovery, ...; Ultimate- and Battle Skill-only ones only for those). The other ${LuxMagica} in the team have no gear.`)

type ChartTargetContext = {
    role?: KiokuRole
    element?: KiokuElement
}

const toKioku = (c: Character, targetContext?: ChartTargetContext): ScoreAttackKioku => {
    return new ScoreAttackKioku(
        { ...c, portrait: undefined, supportKey: undefined, crysIDs: [], subCrysIDs: [], },
        0,
        0,
        targetContext,
    )
}

type ContextKind = "element" | "role" | "ailment" | "noConsume"

interface DealerTag {
    kind: ContextKind
    value: string
    icon: string
    icons?: string[] // a merged tag ("Dark/Light"): one icon per value, drawn as one split icon
}

interface DealerContext {
    element?: KiokuElement
    role?: KiokuRole
    ailment?: Ailment
    noConsume?: boolean
    tags: DealerTag[]
}

interface DmgResult {
    max: number
    avg: number
    critRate: string
}


const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1).toLowerCase()

const makeTag = (kind: ContextKind, value: string): DealerTag => ({
    kind,
    value,
    icon:
        kind === "element"
            ? `/exedra-dmg-calc/elements/${value}.png`
            : kind === "role"
                ? `/exedra-dmg-calc/roles/${value}.png`
                : kind === "ailment"
                    ? `/exedra-dmg-calc/aliments/${capitalize(value)}.png`
                    : `/exedra-dmg-calc/no-consume.png`,
})

const makeContext = (
    element?: KiokuElement,
    role?: KiokuRole,
    ailment?: Ailment,
    noConsume = false,
): DealerContext => ({
    element,
    role,
    ailment,
    noConsume,
    tags: [
        element !== undefined ? makeTag("element", element) : null,
        role !== undefined ? makeTag("role", role) : null,
        ailment !== undefined ? makeTag("ailment", ailment) : null,
        noConsume ? makeTag("noConsume", "No 1 time buffs") : null,
    ].filter((tag): tag is DealerTag => tag !== null),
})

const contextKey = (context: DealerContext): string =>
    JSON.stringify([
        context.element ?? null,
        context.role ?? null,
        context.ailment ?? null,
        context.noConsume ?? false,
    ])

type Metric = "max" | "avg"
type MarkedChar = (typeof markedCharacters.value)[number]

interface GainRow {
    ch: MarkedChar
    tags: DealerTag[]
    gain: number
    maxGain: number
    avgGain: number
    critRate: string
    sp?: number // break chart: SP the rotation costs per 100 AV
    ascension?: string // the ascension(s) the bar was calculated at, shown on the icon ("3", or "0-2" for merged bars)
}

interface CharGainResult {
    main: GainRow
    variants: GainRow[]
}

// One entry per support character. Both metrics are computed in the same pass, so
// flipping the "average dmg" toggle is instant and never re-runs the simulation.
interface SupportGainEntry {
    ch: MarkedChar
    max: CharGainResult
    avg: CharGainResult
}

const fmt = (g: number) =>
    `${g > 0 ? "+" : ""}${g.toFixed(1)}%`

const makeBarTitle = (
    row: Pick<GainRow, "avgGain" | "maxGain" | "critRate">,
    label = "dmg increase",
) => [
    `Avg ${label}: ${fmt(row.avgGain)}`,
    `Max ${label}: ${fmt(row.maxGain)}`,
    `Crit rate: ${row.critRate}%`,
].join("\n")


const NONE_CONTEXT_KEY = contextKey(makeContext())

// What buildCharGainResult reads of a DealerGain (the beta charts build these without a ScoreAttackKioku).
interface GainLike {
    dealer: { context: DealerContext; tags: DealerTag[] }
    result: { critRate: string }
    maxGain: number
    avgGain: number
    sp?: number
}

const buildCharGainResult = (
    ch: MarkedChar,
    gains: GainLike[],
    metric: Metric,
): CharGainResult | null => {
    const gainOf = (g: GainLike) => metric === "avg" ? g.avgGain : g.maxGain

    const toRow = (g: GainLike, tags: DealerTag[]): GainRow => ({
        ch,
        tags,
        gain: gainOf(g),
        maxGain: g.maxGain,
        avgGain: g.avgGain,
        critRate: g.result.critRate,
        sp: g.sp,
    })

    const gainByContext = new Map<string, GainLike>()
    for (const g of gains) {
        gainByContext.set(contextKey(g.dealer.context), g)
    }

    const noneGain = gainByContext.get(NONE_CONTEXT_KEY)
    if (!noneGain) return null

    const meaningfulTagsFor = (g: GainLike): DealerTag[] =>
        g.dealer.tags.filter(tag => {
            const reducedContext: DealerContext = {
                ...g.dealer.context,
                [tag.kind]: undefined,
            }

            const reducedGain = gainByContext.get(contextKey(reducedContext))

            if (!reducedGain) return true

            return Math.abs(gainOf(g) - gainOf(reducedGain)) >= 1
        })

    const variantMap = new Map<string, GainRow>()

    for (const g of gains) {
        if (g.dealer.tags.length === 0) continue
        if (Math.abs(gainOf(g) - gainOf(noneGain)) < 1) continue

        const meaningfulTags = meaningfulTagsFor(g)
        if (!meaningfulTags.length) continue

        const tagKey = meaningfulTags
            .map(tag => `${tag.kind}:${tag.value}`)
            .join("|")

        const existing = variantMap.get(tagKey)

        if (!existing || gainOf(g) > existing.gain) {
            variantMap.set(tagKey, toRow(g, meaningfulTags))
        }
    }

    return { main: toRow(noneGain, []), variants: [...variantMap.values()] }
}

// Turns rows of { character, tags, gain } into everything the bar chart template needs.
// Negative gains are drawn below the zero line.
const buildBarChart = (
    rows: GainRow[],
    { idPrefix = "", titleLabel = "dmg increase", title = makeBarTitle, format = fmt }: {
        idPrefix?: string
        titleLabel?: string
        title?: (row: Pick<GainRow, "avgGain" | "maxGain" | "critRate" | "sp">, label: string) => string
        format?: (gain: number) => string // the bar's label (default: a signed %)
    } = {},
) => {
    const sorted = [...rows].sort((a, b) => a.gain - b.gain)

    // An infinite value (break per SP of a rotation that costs no SP) is drawn a bit above the highest finite one.
    const finite = sorted.map(r => r.gain).filter(Number.isFinite)
    const top = Math.max(0, ...finite) * 1.15 || 1
    const gains = sorted.map(r => Number.isFinite(r.gain) ? r.gain : top)

    const max = Math.max(0, ...gains)
    const min = Math.min(0, ...gains)
    const span = max - min || 1

    const bars = sorted.map(({ ch, tags, gain: value, maxGain, avgGain, critRate, sp, ascension }) => {
        const gain = Number.isFinite(value) ? value : top
        return {
        id: `${idPrefix}${ch.id}:${tags.map(t => `${t.kind}-${t.value}`).join("|") || "none"}${ascension !== undefined ? `:A${ascension}` : ""}`,

        name: (tags.length
            ? `${ch.name} (${tags.map(t => t.value).join("/")})`
            : ch.name) + (ascension !== undefined ? ` A${ascension}` : ""),

        charId: ch.id,
        tags,

        role: ch.role as string,
        vRole: virtualRoleForChar(ch) as string,
        isStandardChar: ch.isStandardChar,
        isLimitedChar: ch.isLimitedChar,
        _borderClass: borderClass(ch),

        gain,
        ascension,
        // break chart: the SP cost per 100 AV under the icon
        spLabel: sp !== undefined ? sp.toFixed(2) : "",
        variant: tags.length > 0,
        label: format(value),
        title: title({ avgGain, maxGain, critRate, sp }, titleLabel),

        style: gain < 0
            ? {
                top: `${(max / span) * 100}%`,
                height: `${(-gain / span) * 100}%`,
            }
            : {
                bottom: `${(-min / span) * 100}%`,
                height: `${(gain / span) * 100}%`,
            },
        }
    })

    const presentRoles = new Set(bars.map(b => b.vRole))

    return {
        bars,
        roles: allVirtualRoleValues.value.filter(r => presentRoles.has(r)) as string[],
        zeroPct: (-min / span) * 100,
        hasVariants: bars.some(b => b.variant),
    }
}

const emptyBarChart = () => ({
    bars: [] as ReturnType<typeof buildBarChart>["bars"],
    roles: [] as string[],
    zeroPct: 0,
    hasVariants: false,
})

const CRIT_TEXT = "Crits: every hit deals its average crit damage (a shortcut, not how the game works), except in teams where a kit reacts to crits (e.g. Absolute Rain's \"on critical hit\"): those roll crits as in the game and average 10 battles, as do teams with other random effects (proc chances, random targets)."
// Average Damage / Break are rates, not a hard cut (LuxBench SimOptions.perAv).
const RATE_TEXT = (av: number) => `It is a rate: what the dealer does in its actions within the battle, divided by the time of its next own turn and scaled to ${av} AV, so a faster unit counts even when it doesn't fit one more action in.`
const benchAv = () => benchTurns.value * 100 // 100 AV = 1 turn (the Length toggle)
// Results shipped with the site (scripts/sim/benchPrecalc.ts): the charts wait for the file, then only simulate what
// it doesn't have.
const benchPrecalcReady = ref(false)
loadBenchPrecalc().finally(() => { benchPrecalcReady.value = true })

type BenchChartKind = LuxBenchJob["chart"]

// One dealer identity (no element/role, or one the character's kit is limited to) of one character.
interface BenchCell {
    context: DealerContext
    maxGain: number
    avgGain?: number
    critRate?: number
    sp?: number // break chart: SP cost per 100 AV
    charId: number
    ascension: number // the character's ascension this was calculated at
}

interface BenchProgress {
    running: boolean
    total: number
    maxDone: number
    avgDone: number
    failed: number
    error: string
}

const idleBench = (): BenchProgress => ({ running: false, total: 0, maxDone: 0, avgDone: 0, failed: 0, error: "" })

// "break": the damage dealer chart's Break display; its cells hold the break gauge per 100 AV in maxGain and avgGain.
const benchResults: Record<BenchChartKind, ShallowRef<Map<number, BenchCell[]>>> = {
    support: shallowRef(new Map()),
    attacker: shallowRef(new Map()),
    break: shallowRef(new Map()),
}
const benchProgress: Record<BenchChartKind, ShallowRef<BenchProgress>> = {
    support: shallowRef(idleBench()),
    attacker: shallowRef(idleBench()),
    break: shallowRef(idleBench()),
}
// Several workers per chart: the characters are dealt out round-robin (each worker computes Lux's baselines itself).
const benchWorkers: Partial<Record<BenchChartKind, Worker[]>> = {}
const BENCH_WORKERS = Math.max(1, Math.min(8, (typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2) - 1))

const stopBench = (kind: BenchChartKind) => {
    for (const w of benchWorkers[kind] ?? []) w.terminate()
    delete benchWorkers[kind]
}

const fightModeEnemies = () => fightMode.value === "st" ? 1 : fightMode.value === "prox" ? 3 : 5

const benchSetup = (kind: BenchChartKind, lux: Character): BenchSetup => ({
    chart: kind,
    enemies: fightModeEnemies(),
    seeds: BENCH_SEEDS,
    av: benchAv(),
    infiniteSp: BENCH_INFINITE_SP,
    lux: maxLevelsForChart(lux),
})

const runBench = (kind: BenchChartKind, { fresh = false } = {}) => {
    stopBench(kind)
    const results = new Map<number, BenchCell[]>()
    benchResults[kind].value = results

    const lux = store.characters.find(c => c.name === LuxMagica)
    if (!lux) {
        benchProgress[kind].value = { ...idleBench(), error: `${LuxMagica} was not found in your roster.` }
        return
    }

    const identityKey = (r: BenchRow) => contextKey(makeContext(r.element, r.role, r.ailment))
    const setMax = (id: number, rows: BenchRow[]) => results.set(id, rows.map(r => ({
        context: makeContext(r.element, r.role, r.ailment),
        maxGain: r.gain,
        critRate: r.critRate,
        sp: r.sp,
        charId: unitOf.get(id)!.id,
        ascension: unitOf.get(id)!.ascension,
    })))
    const setAvg = (id: number, rows: BenchRow[]) => {
        const cells = results.get(id)
        if (!cells) return
        const avg = new Map(rows.map(r => [identityKey(r), r.gain]))
        results.set(id, cells.map(c => ({ ...c, avgGain: avg.get(contextKey(c.context)) })))
    }
    const setBreak = (id: number, rows: BenchRow[]) => { setMax(id, rows); setAvg(id, rows) }
    // a cache / precalc entry with everything this chart shows
    const complete = (e?: BenchCacheEntry) => kind === "break" ? !!e?.brk?.every(r => r.sp !== undefined) : !!(e?.max && e.avg)

    // Cached characters are shown right away; only new or changed ones are simulated.
    const setup = benchSetup(kind, lux)
    if (fresh) clearBenchCache(setup)
    const cache = loadBenchCache(setup)
    const chars = benchUnits(kind)
    // The cache key includes the ascension (benchCharKey), so a character whose ascension changed in the roster is
    // simulated again; its bar shows the ascension it was calculated at. Results are keyed by benchKey.
    const keyOf = new Map(chars.map(c => [c.benchKey, benchCharKey(c)]))
    const unitOf = new Map(chars.map(c => [c.benchKey, c]))
    const todo: BenchUnitChar[] = []
    const progress: BenchProgress = { ...idleBench(), total: chars.length }
    for (const c of chars) {
        // this browser's results first, then the shipped ones ("Recalculate" simulates everything again)
        const key = keyOf.get(c.benchKey)!
        const hit = cache[key] ?? (fresh ? undefined : precalcEntry(setup, key)) // only complete entries (both metrics)
        if (hit && complete(hit)) {
            if (hit.brk) setBreak(c.benchKey, hit.brk)
            else {
                setMax(c.benchKey, hit.max!)
                setAvg(c.benchKey, hit.avg!)
            }
            progress.maxDone++
            progress.avgDone++
        } else todo.push(c)
    }
    progress.running = todo.length > 0
    benchResults[kind].value = new Map(results)
    benchProgress[kind].value = { ...progress }
    if (!todo.length) return

    // The cache keeps only characters still on the chart (every ascension / level set of them, so switching between
    // "All A5", "My Kioku" and "Multiple ascensions" reuses results). benchCharKey starts with the character id.
    const kept: Record<string, BenchCacheEntry> = {}
    const chartIds = new Set(chars.map(c => String(c.id)))
    for (const [k, entry] of Object.entries(cache)) if (complete(entry) && chartIds.has(k.split(":")[0])) kept[k] = entry
    let saveTimer: ReturnType<typeof setTimeout> | undefined
    const save = (now = false) => {
        clearTimeout(saveTimer)
        if (now) saveBenchCache(setup, kept)
        else saveTimer = setTimeout(() => saveBenchCache(setup, kept), 1000)
    }

    const plain = <T,>(value: T): T => JSON.parse(JSON.stringify(value))
    const job: LuxBenchJob = {
        chart: kind,
        lux: plain(setup.lux as Character),
        chars: todo.map(c => plain(c)),
        enemies: setup.enemies,
        seeds: setup.seeds,
        av: setup.av,
        infiniteSp: BENCH_INFINITE_SP,
    }

    const count = Math.min(BENCH_WORKERS, todo.length)
    const workers = Array.from({ length: count }, () => new Worker(new URL("../workers/luxBenchWorker.ts", import.meta.url), { type: "module" }))
    benchWorkers[kind] = workers
    let running = count

    // One message per character: re-render at most once per frame.
    let scheduled = false
    const publish = () => {
        if (scheduled) return
        scheduled = true
        requestAnimationFrame(() => {
            scheduled = false
            if (benchWorkers[kind] !== workers && progress.running) return // superseded
            benchResults[kind].value = new Map(results)
            benchProgress[kind].value = { ...progress }
        })
    }

    const pendingMax = new Map<number, BenchRow[]>()

    const onMessage = (e: MessageEvent<LuxBenchMessage>) => {
        const msg = e.data
        if (msg.type === "max") {
            setMax(msg.id, msg.rows)
            pendingMax.set(msg.id, msg.rows)
            progress.maxDone++
        } else if (msg.type === "avg") {
            setAvg(msg.id, msg.rows)
            const max = pendingMax.get(msg.id)
            if (max) kept[keyOf.get(msg.id)!] = { max, avg: msg.rows }
            save()
            progress.avgDone++
        } else if (msg.type === "break") {
            setBreak(msg.id, msg.rows)
            kept[keyOf.get(msg.id)!] = { brk: msg.rows }
            save()
            progress.maxDone++
            progress.avgDone++
        } else if (msg.type === "error") {
            progress.failed++
        } else if (--running === 0) { // every worker is done
            progress.running = false
            save(true)
            stopBench(kind)
        }
        publish()
    }

    workers.forEach((worker, i) => {
        worker.onmessage = onMessage
        worker.onerror = (e) => {
            console.error(`Lux bench (${kind}) worker failed:`, e)
            progress.running = false
            progress.error = "The battle simulation failed (see console)."
            stopBench(kind)
            publish()
        }
        worker.postMessage({ ...job, chars: job.chars.filter((_, k) => k % count === i) })
    })
}

onBeforeUnmount(() => {
    stopBench("support")
    stopBench("attacker")
    stopBench("break")
})

const benchBarTitle = (row: Pick<GainRow, "avgGain" | "maxGain" | "critRate">, label: string) => [
    `Max Burst ${label}: ${fmt(row.maxGain)}`,
    `Average Damage ${label}: ${Number.isNaN(row.avgGain) ? "calculating…" : fmt(row.avgGain)}`,
    `Ultimate crit rate: ${row.critRate}%`,
].join("\n")
const fmtBreak = (v: number) => Number.isFinite(v) ? v.toFixed(1) : "no SP"
const benchBreakTitle = (row: Pick<GainRow, "avgGain" | "maxGain" | "critRate" | "sp">) => [
    `Break gauge removed per 100 AV: ${row.maxGain.toFixed(1)}`,
    `SP cost per 100 AV: ${row.sp?.toFixed(2) ?? "?"}`,
    `Break per SP: ${Number.isFinite(row.avgGain) ? row.avgGain.toFixed(1) : "the rotation costs no SP"}`,
].join("\n")

// Merged tag icons (mergeEqualVariants): slices cut on a slant, top edge SLANT% further right than the bottom ("/").
const SLANT = 18
const slantSlice = (i: number, n: number): string => {
    const edge = (k: number, top: boolean) => k <= 0 ? -100 : k >= n ? 200 : (k / n) * 100 + (top ? SLANT : -SLANT)
    return `polygon(${edge(i, true)}% 0, ${edge(i + 1, true)}% 0, ${edge(i + 1, false)}% 100%, ${edge(i, false)}% 100%)`
}

// Left-to-right order of a merged tag's values (and its split icon): elements Dark, Forest, Light, Void, Flame, Aqua.
const TAG_ORDER: Record<string, readonly string[]> = {
    element: [KiokuElement.Dark, KiokuElement.Forest, KiokuElement.Light, KiokuElement.Void, KiokuElement.Flame, KiokuElement.Aqua],
    role: Object.values(KiokuRole),
}
const tagOrder = (t: DealerTag) => (TAG_ORDER[t.kind]?.indexOf(t.value) ?? -1)

/** Variant bars of one character (and ascension) that show the same value and differ in one tag only (Cherry Ballad:
 *  Dark and Light) become one bar whose tag lists both ("Dark/Light", one split icon). */
const mergeEqualVariants = (rows: GainRow[]): GainRow[] => {
    const plain: GainRow[] = [], groups = new Map<string, GainRow[]>()
    for (const r of rows) {
        if (!r.tags.length) { plain.push(r); continue }
        const k = [r.ch.id, r.ascension ?? "", fmt(r.gain), r.tags.map(t => t.kind).join(",")].join("|")
        groups.set(k, [...(groups.get(k) ?? []), r])
    }
    const out = [...plain]
    for (let list of groups.values()) {
        for (let j = 0; j < list[0].tags.length; j++) {
            const buckets = new Map<string, GainRow[]>()
            for (const r of list) {
                const other = r.tags.map((t, i) => i === j ? "" : t.value).join("|")
                buckets.set(other, [...(buckets.get(other) ?? []), r])
            }
            list = [...buckets.values()].map(b => {
                if (b.length < 2) return b[0]
                const parts = b.flatMap(r => r.tags[j].icons
                    ? r.tags[j].value.split("/").map((value, i) => ({ value, icon: r.tags[j].icons![i] }))
                    : [{ value: r.tags[j].value, icon: r.tags[j].icon }])
                parts.sort((a, b2) => tagOrder({ ...b[0].tags[j], value: a.value }) - tagOrder({ ...b[0].tags[j], value: b2.value }) || a.value.localeCompare(b2.value))
                const tag: DealerTag = { kind: b[0].tags[j].kind, value: parts.map(p => p.value).join("/"), icon: parts[0].icon, icons: parts.map(p => p.icon) }
                return { ...b[0], tags: b[0].tags.map((t, i) => i === j ? tag : t) }
            })
        }
        out.push(...list)
    }
    return out
}

const ascBadgeClass = (label: string) => {
    const a = Number(label.split("-").pop()) // a merged bar ("0-2") is coloured by its highest ascension
    return { low: a < 2, mid: 2 <= a && a < 5, high: a === 5 }
}

/** "Multiple ascensions": one bar per ascension and dealer identity (main bar / element, role, ailment variant), with
 *  neighbouring selected ascensions merged into one bar ("0-2") while the bar shows the same value. */
const mergeAscensionBars = (list: { ascension: number, rows: GainRow[] }[]): GainRow[] => {
    const tagKey = (r: GainRow) => r.tags.map(t => `${t.kind}-${t.value}`).join("|")
    const byTags = new Map<string, { ascension: number, row: GainRow }[]>()
    for (const { ascension, rows } of [...list].sort((a, b) => a.ascension - b.ascension)) {
        for (const row of rows) {
            const k = tagKey(row)
            byTags.set(k, [...(byTags.get(k) ?? []), { ascension, row }])
        }
    }
    const order = multiAscensions.value
    const out: GainRow[] = []
    for (const entries of byTags.values()) {
        let run: { ascension: number, row: GainRow }[] = []
        const flush = () => {
            if (!run.length) return
            const first = run[0].ascension, last = run[run.length - 1].ascension
            out.push({ ...run[0].row, ascension: first === last ? `${first}` : `${first}-${last}` })
            run = []
        }
        for (const e of entries) {
            const prev = run[run.length - 1]
            // neighbours among the selected ascensions with the same bar (same label = same height on the chart)
            const adjacent = prev && order.indexOf(e.ascension) === order.indexOf(prev.ascension) + 1
            if (prev && !(adjacent && fmt(prev.row.gain) === fmt(e.row.gain))) flush()
            run.push(e)
        }
        flush()
    }
    return out
}

const buildBenchChart = (kind: BenchChartKind) => {
    const progress = benchProgress[kind].value
    if (progress.error) return { ...emptyBarChart(), error: progress.error, notes: [] as string[] }

    // the break chart: "max" = break per 100 AV, "avg" = break per SP (see the cells below)
    const metric: Metric = kind === "break" ? (benchBreakPerSp.value ? "avg" : "max") : benchAverageDmg.value ? "avg" : "max"
    const visible = new Map(allChars.value.map(c => [c.id, c]))
    const rows: GainRow[] = []

    // Per character, the bars of each ascension it was calculated at (one ascension unless "Multiple ascensions").
    const byChar = new Map<number, { ascension: number, rows: GainRow[] }[]>()
    for (const cells of benchResults[kind].value.values()) {
        const ch = visible.get(cells[0]?.charId)
        if (!ch) continue
        // Average Damage: a character shows up once all of its battles are done.
        if (metric === "avg" && cells.some(c => c.avgGain === undefined)) continue

        const gains: GainLike[] = cells.map(c => ({
            dealer: { context: c.context, tags: c.context.tags },
            result: { critRate: c.critRate?.toFixed(1) ?? "?" },
            maxGain: c.maxGain,
            // break per SP; a rotation that costs no SP (or gains SP) is infinitely efficient
            avgGain: kind === "break" ? (c.sp! > 0 ? c.maxGain / c.sp! : Infinity) : c.avgGain ?? NaN,
            sp: c.sp,
        }))
        const result = buildCharGainResult(ch, gains, metric)
        if (!result) continue
        const list = byChar.get(ch.id) ?? []
        list.push({ ascension: cells[0].ascension, rows: [result.main, ...result.variants] })
        byChar.set(ch.id, list)
    }
    for (const list of byChar.values()) {
        // With max levels everyone is A5: no badge. "My Kioku": the ascension it was calculated at.
        if (levelsMode.value === "max") rows.push(...list.flatMap(l => l.rows))
        else if (levelsMode.value === "mine") rows.push(...list.flatMap(l => l.rows.map(r => ({ ...r, ascension: String(l.ascension) }))))
        else rows.push(...mergeAscensionBars(list))
    }

    // Like the legacy charts: the support chart only shows real gains, the attacker chart everything.
    const merged = mergeEqualVariants(rows)
    const shown = kind === "support" ? merged.filter(r => r.gain > 1) : merged

    return {
        ...buildBarChart(shown, kind === "break"
            ? { idPrefix: `bench-${kind}:`, title: benchBreakTitle, format: fmtBreak }
            : {
                idPrefix: `bench-${kind}:`,
                titleLabel: kind === "support" ? "dmg increase" : "dmg vs Lux",
                title: benchBarTitle,
            }),
        error: "",
        notes: progress.failed ? [`${progress.failed} character(s) could not be simulated (see console).`] : [],
    }
}

const benchStatusText = (kind: BenchChartKind): string => {
    if (!benchPrecalcReady.value) return "Loading results…"
    const p = benchProgress[kind].value
    if (!p.running) return ""
    return `Simulating battles… ${p.avgDone + p.failed}/${p.total}`
}

const enemyDamageText = () => `${benchEnemyText.value} with 3000 DEF, weak to every element and broken for the whole battle (500% damage taken, x5): in Average Damage they start unbroken and the first hit breaks each of them, so on-break effects trigger once per enemy; in Max Burst they are broken from the start. They never act. Single-target and proximity skills aim at the middle enemy, so a single-target debuff covers one enemy and an AoE one all of them.`
const AILMENT_TEXT = "Ailment bonuses (enemies under Curse, Burn, ... for the whole battle) get their own bar when they change the result; every other bar makes the enemies immune to those ailments, so a character that applies an ailment itself and reacts to it shows that only in its ailment bar."

const benchEnemyText = computed(() =>
    fightMode.value === "st" ? "One enemy" : fightMode.value === "aoe" ? "Five enemies" : "Three enemies")

const damageMetrics = (onSelect?: () => void) => benchMetricOptions.map(opt => ({
    label: opt.label, title: opt.title, select: () => { benchAverageDmg.value = opt.value; onSelect?.() },
}))

const attackerMetrics = () => [
    ...damageMetrics(() => { benchAttackerBreak.value = false }),
    { label: "Break", title: "Breakers only: break gauge each removes per 100 AV (one turn) as the damage dealer", select: () => { benchAttackerBreak.value = true } },
]

const benchCharts = computed(() => [
    {
        kind: "support" as BenchChartKind,
        metrics: damageMetrics(),
        metricIndex: benchMetricIndex.value,
        battleLength: benchAverageDmg.value,
        sectionClass: "bench-buff-chart-section",
        filename: "relative-buff-strength-battle-engine.png",
        title: "Relative buff strength",
        fightType: true,
        desc: [
            `How much each character increases the damage of a ${LuxMagica} damage dealer. The dealer is ${LuxMagica} as her own Light Breaker (another element or role when the character's kit is limited to Light or Breakers), with the average HP, ATK and DEF of the 5 star units of that role. She is also simulated as each element and role the character's kit is limited to; those get their own bar when the result differs. ${levelsDescription.value}`,
            benchAverageDmg.value
                ? `Average Damage: ${benchAv()} AV (${benchTurns.value} turns) of battle on the game's battle code with infinite SP (topped up to 5 before every turn): ultimates as soon as they are ready, Battle Skill every turn, ally-target skills on the damage dealer (a few kits have their own play, e.g. Tenebrous Arcana uses her Basic Attack at 3 Magic). The character is next to the damage dealer, with three ${LuxMagica} filling the team. ${CRIT_TEXT} Only the damage dealer's own damage counts (including additional damage it deals), never the rest of the team's. ${RATE_TEXT(benchAv())}`
                : `Max Burst: the damage dealer's Ultimate with every buff and debuff of the team at full stacks and every hit a crit.`,
            enemyDamageText(),
            `${AILMENT_TEXT} A bonus can show in one metric only: crit rate and procs (chains, follow-ups) don't change Max Burst, and Max Burst counts every buff as already applied.`,
            benchAverageDmg.value
                ? `Be aware: additional damage and vortex scale on the ATK of the character giving them, not on the damage dealer's, and the damage dealer is ${LuxMagica} with average stats, so they weigh more here than they would on an Attacker with higher ATK.`
                : ``,
        ],
        chart: buildBenchChart("support"),
        status: benchStatusText("support"),
        running: benchProgress.support.value.running,
    },
    benchAttackerBreak.value ? {
        kind: "break" as BenchChartKind,
        metrics: attackerMetrics(),
        metricIndex: 2,
        battleLength: true,
        sectionClass: "bench-attacker-chart-section",
        filename: "break-per-100-av-battle-engine.png",
        title: benchBreakPerSp.value ? "Break gauge depletion per SP" : "Break gauge depletion per 100 AV",
        fightType: true,
        desc: [
            `Breakers only. The break gauge each Breaker removes as the damage dealer per 100 AV (one turn), over ${benchAv()} AV (${benchTurns.value} turns) of battle on the game's battle code with infinite SP (topped up to 5 before every turn): ultimates as soon as they are ready and Battle Skill every turn (Tenebrous Arcana: Basic Attack at 3 Magic), the other four units being ${LuxMagica} without gear. Not compared to ${LuxMagica}: the bar is the gauge itself, added up over every enemy the Breaker hits; only its own hits count. ${RATE_TEXT(100)}`,
            `Every Breaker wears its EX crystalis, Quickstep++ (SPD +8) and Mana Infusion++ (MP recovery +10%), the portrait Proof of Friends Again (SPD +20%) and Cherry Blizzard (A5, max level) as support: SPD +20%, and +2 MP on dealing damage while the enemies carry 2 or more debuffs.`,
            `The number under each icon is the SP the Breaker's own actions cost per 100 AV: its Battle Skills minus the SP it generates itself (+1 per Basic Attack, its own SP gain effects). SP gained on enemy break (e.g. Tenebrous Arcana's A2) counts too: each enemy is broken once (see below). ${benchBreakPerSp.value ? "Break per SP sorts the Breakers from least to most SP efficient; a rotation that costs no SP shows as \"no SP\" at the end." : "Switch \"Break per\" to SP to see the break per SP spent."}`,
            `${levelsOnlyDescription.value} ${benchEnemyText.value} with 3000 DEF, weak to every element (+20% break gauge depletion) and a break gauge that never runs out, with one exception: the damage dealer's first hit on each enemy breaks it, so on-break effects (Weakness, follow-ups, SPD, SP, ...) trigger once per enemy, as in the damage charts. The enemy recovers right away, the way a broken enemy recovers at its turn start, and is never broken again. Every hit counts the full break value the game computes for it, the breaking hit included, so the bars show what the Breaker removes from a gauge that never runs out, plus what its on-break effects add. They never act. Single-target and proximity skills aim at the middle enemy. ${AILMENT_TEXT}`,
        ],
        chart: buildBenchChart("break"),
        status: benchStatusText("break"),
        running: benchProgress.break.value.running,
    } : {
        kind: "attacker" as BenchChartKind,
        metrics: attackerMetrics(),
        metricIndex: benchMetricIndex.value,
        battleLength: benchAverageDmg.value,
        sectionClass: "bench-attacker-chart-section",
        filename: "attacker-strength-vs-lux-battle-engine.png",
        title: `Damage dealer strength compared to ${LuxMagica}`,
        fightType: true,
        desc: [
            `Damage each character deals as the damage dealer, compared to ${LuxMagica} in the same spot as an Attacker: ${LuxMagica} has the average HP, ATK and DEF of the 5 star Attackers (and, as an Attacker, gets The Universe's Edge), the same for every role.`,
            `${LuxMagica} is the 0% line; 100% means double of her damage.`,
            benchAverageDmg.value
                ? `Average Damage: ${benchAv()} AV (${benchTurns.value} turns) of battle on the game's battle code with infinite SP (topped up to 5 before every turn): ultimates as soon as they are ready and Battle Skill every turn (a few kits have their own play, e.g. Tenebrous Arcana uses her Basic Attack at 3 Magic), the other four units being ${LuxMagica} without gear. ${CRIT_TEXT} Only the damage dealer's own damage counts. ${RATE_TEXT(benchAv())}`
                : `Max Burst: the Ultimate with the damage dealer's own buffs and debuffs at full stacks and every hit a crit.`,
            levelsDescription.value,
            enemyDamageText(),
            AILMENT_TEXT,
            benchAverageDmg.value
                ? `Be aware: DoT poppers (e.g. Marigold Dadaism) need a team of DoT appliers and scale on the whole team's DoTs, not just their own; with ${LuxMagica} as the rest of the team their damage is not well reflected here.`
                : ``,
        ],
        chart: buildBenchChart("attacker"),
        status: benchStatusText("attacker"),
        running: benchProgress.attacker.value.running,
    },
])

const shareOptionsForBenchChart = (title: string) => () => ({
    title,
    backUrl: window.location.href,
})

// Click/tap tooltip for the bar chart (native `title` tooltips don't work on touch screens)
const activeBarTip = ref<{ id: string; text: string; x: number; y: number; below: boolean } | null>(null)

const closeBarTip = () => {
    activeBarTip.value = null
}

const toggleBarTip = (bar: { id: string; title: string }, e: MouseEvent) => {
    if (activeBarTip.value?.id === bar.id) {
        closeBarTip()
        return
    }

    const halfWidth = 110 // half the tooltip's max width, keeps it fully on screen
    activeBarTip.value = {
        id: bar.id,
        text: bar.title,
        x: Math.min(Math.max(e.clientX, halfWidth + 8), window.innerWidth - halfWidth - 8),
        y: e.clientY,
        below: e.clientY < 110, // flip under the finger when too close to the top
    }
}

onMounted(() => {
    document.addEventListener("click", closeBarTip)
    window.addEventListener("scroll", closeBarTip, true) // capture: also fires for the chart's own scroll
    window.addEventListener("resize", closeBarTip)
})

onBeforeUnmount(() => {
    document.removeEventListener("click", closeBarTip)
    window.removeEventListener("scroll", closeBarTip, true)
    window.removeEventListener("resize", closeBarTip)
})

const allElementValues = computed(() => Object.values(KiokuElement))
const displayedElements = computed(() => allElementValues.value.filter(el => !hiddenElements.value.includes(el)))

const valuesFor = (key: AxisKey): string[] => {
    if (key === "element") return displayedElements.value as string[]
    if (key === "role") return displayedVirtualRoles.value
    if (showUnowned.value) return ["5", "4", "3", "2", "1", "0", "-1"]
    return ["5", "4", "3", "2", "1", "0"]
}

const visibleXValues = computed(() => valuesFor(xAxisKey.value))
const visibleYValues = computed(() => valuesFor(yAxisKey.value))

const charMap = computed(() => {
    const xVals = visibleXValues.value
    const yVals = visibleYValues.value
    const xKey = xAxisKey.value
    const yKey = yAxisKey.value
    const chars = allChars.value

    const matchVal = (axisKey: AxisKey, val: string, c: typeof chars[0]): boolean => {
        if (axisKey === "element") return c.element === val
        if (axisKey === "ascension") return val === (c.enabled ? String(c.ascension) : "-1")
        return virtualRoleForChar(c) === val
    }

    const map = new Map<string, typeof chars>()

    for (const yVal of yVals) {
        for (const xVal of xVals) {
            for (const r of [3, 4, 5] as const) {
                const key = `${xVal}|${yVal}|${r}`
                map.set(key, chars.filter(c =>
                    c.rarity === r && matchVal(xKey, xVal, c) && matchVal(yKey, yVal, c)
                ))
            }
        }
    }
    return map
})

const getChars = (xVal: string, yVal: string, rarity: number) =>
    charMap.value.get(`${xVal}|${yVal}|${rarity}`) ?? []

const maxCharsPerRarityPerRow = computed(() => {
    const result: Record<string, Record<number, number>> = {}
    for (const yVal of visibleYValues.value) {
        result[yVal] = { 3: 0, 4: 0, 5: 0 }
        for (const xVal of visibleXValues.value) {
            for (const r of [3, 4, 5]) {
                const count = (charMap.value.get(`${xVal}|${yVal}|${r}`) ?? []).length
                if (count > result[yVal][r]) result[yVal][r] = count
            }
        }
    }
    return result
})

const maxCharsPerColumn = computed(() => {
    const result: Record<string, number> = {}
    for (const xVal of visibleXValues.value) {
        let max = 0
        for (const yVal of visibleYValues.value) {
            for (const r of [3, 4, 5] as const) {
                if (!shouldShow(r)) continue
                const count = (charMap.value.get(`${xVal}|${yVal}|${r}`) ?? []).length
                if (count > max) max = count
            }
        }
        result[xVal] = max
    }
    return result
})

const bandCols = (xVal: string): number => {
    const maxInColumn = maxCharsPerColumn.value[xVal] ?? 0
    return maxInColumn <= 1 ? 1 : 2
}

const bandRows = (yVal: string, rarity: number): number => {
    const maxInRow = maxCharsPerRarityPerRow.value[yVal]?.[rarity] ?? 0
    return Math.max(1, Math.ceil(maxInRow / 2))
}

const borderClass = (ch: Character): string => {
    return obtainBorderClass(ch.obtain)
}

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (!ch.isStandardChar) {
        title += ` - ${ch.obtain}`
    }
    return title
}

const exportOpts = { exportClass: "exporting" }

const shareOptionsForGrid = () => ({
    title: `${useFriendStore().getFormattedDisplayNamePossessive()} Kioku Grid`,
    backUrl: window.location.href,
})

// The bar charts scroll sideways on the page; the exported image shows the whole chart instead,
// never narrower than the section is on screen.
const chartExportOpts = (selector: string): ImageExportOptions => {
    const el = document.querySelector<HTMLElement>(selector)
    return {
        exportClass: "chart-exporting",
        // Runs before the export class widens the section, so this is its on-screen width.
        onBefore: () => { if (el) el.style.minWidth = `${el.offsetWidth}px` },
        onAfter: () => { el?.style.removeProperty("min-width") },
    }
}

// The bench only runs while its charts are shown; hiding them stops the workers.
// The damage dealer chart runs either its damage job or its break job, whichever it shows.
const benchKinds: BenchChartKind[] = ["support", "attacker", "break"]
watch([showBenchCharts, markedCharacters, levelsMode, multiAscensions, fightMode, benchSpeed, benchPrecalcReady, benchAttackerBreak], () => {
    if (!benchPrecalcReady.value) return
    for (const kind of benchKinds) {
        const shown = kind === "support" || (kind === "break") === benchAttackerBreak.value
        if (showBenchCharts.value && shown) runBench(kind)
        else stopBench(kind)
    }
}, { immediate: true })
</script>

<style scoped>
.bench-toggle-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
}

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

.card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 1rem;
    margin-bottom: 0.6rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.toolbar {
    justify-content: space-between;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
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

.filter-chip {
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

.filter-chip input {
    display: none;
}

.filter-chip.active {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.filter-chip.disabled {
    opacity: 0.5;
    cursor: default;
}

.fight-mode-row {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.fight-mode-label {
    font-size: 0.8rem;
    color: var(--muted);
}

.fight-mode-toggle {
    position: relative;
    display: inline-grid;
    grid-template-columns: repeat(var(--count, 3), minmax(0, 1fr));
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--panel);
}

.fight-mode-highlight {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc((100% - 6px) / var(--count, 3));
    border-radius: 16px;
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    transition: transform 0.2s ease;
    z-index: 0;
}

.fight-mode-option {
    position: relative;
    z-index: 1;
    padding: 0.2rem 0.9rem;
    border: none;
    background: transparent;
    color: var(--muted);
    font-size: 0.8rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 16px;
    transition: color 0.12s;
    white-space: nowrap;
}

.fight-mode-option.active {
    color: var(--accent);
}

.axis-row {
    gap: 1.25rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.85rem;
    align-items: flex-start;
}

.field-label {
    font-size: 0.74rem;
    color: var(--muted);
}

.exporting {
    overflow: visible !important;
}

.grid-scroll.exporting {
    display: block !important;
    width: max-content !important;
}

.er-grid {
    border-collapse: collapse;
    min-width: max-content;
    margin: 0 auto;
}

.options-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.options-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
}

.axis-select {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.4rem;
    font-size: 0.85rem;
    cursor: pointer;
}

.info-axis-label {
    font-size: 0.82rem;
    opacity: 0.7;
}

.ascension-header-label {
    display: block;
    text-align: center;
    font-size: 0.85rem;
    font-weight: bold;
    padding: 0.3rem 0.5rem;
}

.info-badge-img {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1px;
}

.info-badge-icon {
    width: 16px;
    height: 16px;
    display: block;
}

.role-chip-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.role-chip-label {
    position: absolute;
    bottom: -2px;
    right: -4px;
    font-size: 0.5rem;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.75);
    color: var(--text);
    border-radius: 3px;
    padding: 0 2px;
    line-height: 1.3;
    pointer-events: none;
}

.role-header-inner {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.role-header-label {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--text);
    margin-top: 2px;
    line-height: 1;
}

.role-badge-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
}

.role-badge-tag {
    font-weight: bold;
    line-height: 1;
    color: var(--text);
    right: 2px;
    position: absolute;
    top: 30%;
}

.chips-label {
    font-size: 0.78rem;
    opacity: 0.6;
}

.chip {
    display: flex;
    align-items: center;
    padding: 2px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.55;
    transition: opacity 0.15s, background 0.15s;
}

.chip--visible {
    opacity: 1;
}

.chip--hidden {
    opacity: 0.3;
    filter: grayscale(60%);
}

.chip:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
}

.chip img {
    height: 28px;
    display: block;
}

.chip-all-label {
    height: 28px;
    width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text);
}

.archetype-none-label {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text);
}

.header-icon-btn {
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
}

.header-icon-btn:hover {
    opacity: 0.5;
    transform: scale(0.9);
}

.er-grid {
    border-collapse: collapse;
    min-width: max-content;
}

.grid-scroll {
    display: flex;
    justify-content: center;
    overflow-x: visible;
}

@media (max-width: 768px) {
    .grid-scroll {
        display: block;
        overflow-x: auto;
    }
}

.corner-cell,
.header-cell {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.4rem 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.header-icon {
    height: 50px;
    display: block;
    margin: 0 auto;
}

.rarity-band {
    --icon: 64px;
    --gap: 2px;
    --pad: 3px;
    display: grid;
    grid-template-columns: repeat(var(--band-cols, 2), var(--icon));
    padding: var(--pad) 4px;
    min-height: calc(var(--band-rows, 1) * var(--icon) + (var(--band-rows, 1) - 1) * var(--gap) + 4 * var(--pad));
    border-radius: 4px;
    box-sizing: border-box;
}

@media (max-width: 768px) {
    .rarity-band {
        grid-template-columns: repeat(1, var(--icon));
        min-height: calc(2 * var(--band-rows, 1) * var(--icon) + (var(--band-rows, 1) - 1) * var(--gap) + 4 * var(--pad));
    }
}

.rarity-5 {
    background: rgba(255, 215, 0, 0.07);
}

.rarity-4 {
    background: rgba(192, 132, 252, 0.07);
}

.rarity-3 {
    background: rgba(125, 211, 252, 0.07);
}

.char-thumb {
    display: contents;
}

.character-img-wrapper {
    position: relative;
    display: inline-block;
}

.character-img-wrapper>.avatar-slot {
    position: inherit;
}

.char-img {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    display: block;
}

.char-img:hover {
    transform: scale(1.1);
}

.limited-border.char-img {
    border: 2px solid red;
}

.limited-border.gain-char-icon {
    border: 1px solid red;
}

.default-border {
    border: 2px solid transparent;
}

.level-badge {
    position: absolute;
    width: 25px;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: var(--text);
    font-size: 0.6rem;
    text-align: center;
    border-radius: 15rem;
    font-weight: bold;
}

.level-badge.low {
    color: pink;
}

.level-badge.mid {
    color: rgb(154, 149, 212);
}

.level-badge.high {
    color: palegreen;
}


.axis-info-badge {
    left: 22%;
    top: 0;
}

.archetype-icons {
    position: absolute;
    right: -2px;
    top: 0;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(4, auto);
    grid-auto-columns: 16px;
    direction: rtl;
    gap: 1px;
    z-index: 2;
    cursor: help;
}

.archetype-icon {
    width: 16px;
    height: 16px;
    display: block;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 50%;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.85));
}

.copy-btn {
    margin: 10px;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.copy-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 209, 110, 0.35);
}

.gain-section {
    flex-direction: column;
    align-items: stretch;
    margin-top: 1rem;
}

.chart-export-toolbar {
    display: flex;
    justify-content: flex-end;
}

/* Image export of a bar chart: show the whole chart (no sideways scroll) and hide the toolbar. */
.gain-section.chart-exporting {
    width: max-content !important;
    max-width: none !important;
}

.chart-exporting .chart-export-toolbar {
    display: none;
}

.chart-exporting .gain-scroll {
    overflow: visible;
    width: max-content;
    margin: 0 auto;
}

.gain-header {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.beta-badge {
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    border: 1px solid var(--accent);
    color: var(--accent);
    font-size: 0.6rem;
    letter-spacing: 0.06em;
}

.gain-desc,
.gain-empty {
    width: 100%;
    max-width: 50rem;
    margin: 0 auto;
    text-align: center;
    font-size: 0.8rem;
    color: var(--muted);
}

.gain-legend {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem 0.9rem;
    font-size: 0.75rem;
    color: var(--muted);
}

.gain-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
}

.gain-legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
}

.gain-legend-swatch.striped,
.gain-col.variant .gain-bar {
    background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.4) 0 3px, transparent 3px 6px);
}

.gain-legend-swatch.striped {
    background-color: var(--muted);
}

.gain-col.variant .gain-name {
    font-style: italic;
}

.gain-scroll {
    width: 100%;
    height: 500px;
    overflow-x: scroll;
}

.gain-chart {
    --track-height: 240px;
    display: flex;
    align-items: flex-start;
    width: max-content;
    margin: 0 auto;
    padding-top: 3.5rem;
}

.gain-col {
    width: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.gain-track {
    position: relative;
    width: 100%;
    height: var(--track-height);
}

.gain-zero {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border-strong);
}

.gain-bar-wrap {
    position: absolute;
    left: 4px;
    right: 4px;
}

/* Beta charts fill in while they are computed: each new bar grows in from the zero line, and the others glide to
   their new size when the scale changes. */
.bench-col .gain-bar-wrap {
    transition: height 0.3s ease, top 0.3s ease, bottom 0.3s ease;
}

.bench-col .gain-bar {
    transform-origin: bottom;
    animation: bench-bar-in 0.4s ease-out;
}

.bench-col.negative .gain-bar {
    transform-origin: top;
}

.bench-col .gain-value {
    animation: bench-value-in 0.4s ease-out;
}

@keyframes bench-bar-in {
    from {
        transform: scaleY(0);
    }

    to {
        transform: scaleY(1);
    }
}

@keyframes bench-value-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .bench-col .gain-bar-wrap {
        transition: none;
    }

    .bench-col .gain-bar,
    .bench-col .gain-value {
        animation: none;
    }
}

.gain-bar {
    width: 100%;
    height: 100%;
    min-height: 1px;
    border-radius: 3px 3px 0 0;
}

.gain-col:hover .gain-bar,
.gain-col.active .gain-bar {
    filter: brightness(1.25);
}

.gain-tip {
    position: fixed;
    z-index: 1000;
    width: max-content;
    max-width: 220px;
    padding: 0.4rem 0.6rem;
    transform: translate(-50%, calc(-100% - 12px));
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    font-size: 0.8rem;
    line-height: 1.4;
    text-align: left;
    white-space: pre-line;
}

.gain-tip.below {
    transform: translate(-50%, 12px);
}

.gain-value {
    position: absolute;
    left: 50%;
    font-size: 0.72rem;
    white-space: nowrap;
    color: var(--text);
}

.gain-bar-wrap .gain-value {
    bottom: 100%;
    margin-bottom: 2px;
    transform: rotate(-45deg);
    transform-origin: left bottom;
}

.gain-bar-options {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-direction: column;
}

.gain-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    margin-top: 0.35rem;
    width: 28px;
    transform: none;
}

.gain-char-icon,
.gain-tag-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    display: block;
}

.gain-char-icon,
.gain-tag-icon {
    border-radius: 50%;
}

.gain-tag-split {
    position: relative;
    overflow: hidden;
}

.gain-tag-split img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.gain-tag-split-lines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.gain-tag-split-lines line {
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
}

.gain-char-icon-wrap {
    position: relative;
    display: block;
}

.gain-sp {
    font-size: 0.6rem;
    line-height: 1;
    color: var(--muted);
    white-space: nowrap;
}

.gain-asc-badge {
    position: absolute;
    right: -4px;
    bottom: -3px;
    min-width: 12px;
    padding: 0 2px;
    white-space: nowrap;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.8);
    color: var(--text);
    font-size: 0.55rem;
    font-weight: bold;
    line-height: 12px;
    text-align: center;
    border-radius: 6px;
    pointer-events: none;
}

.gain-asc-badge.low {
    color: pink;
}

.gain-asc-badge.mid {
    color: rgb(154, 149, 212);
}

.gain-asc-badge.high {
    color: palegreen;
}

.gain-tag-icons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}
</style>
