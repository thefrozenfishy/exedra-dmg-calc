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

        <section class="card gain-section">
            <div class="gain-header filters-heading">Relative buff strength</div>
            <p class="gain-desc">Comparison of relative buff strength on a character with no other buffs. Only buffs to
                special dmg is being compared. All characters being compared are A5 and max level.</p>
            <p class="gain-desc">One enemy with 3000 def is used as basis for dmg calculation.</p>
            <p class="gain-desc">Be careful when directly comparing buffers and debuffs, as they scale differently on
                eachother.
            </p>
            <p class="gain-desc">Buffs which are only active under some circumstances have dashed bars.</p>

            <div class="fight-mode-row" style="width: fit-content; margin: 0 auto;">
                <span class="fight-mode-label">Display</span>
                <div class="fight-mode-toggle" style="--count: 2" role="radiogroup" aria-label="Damage metric">
                    <div class="fight-mode-highlight" :style="{ transform: `translateX(${metricIndex * 100}%)` }"></div>
                    <button v-for="opt in metricOptions" :key="opt.label" type="button" class="fight-mode-option"
                        :class="{ active: barGraphAverageDmg === opt.value }" :title="opt.title"
                        @click="barGraphAverageDmg = opt.value">
                        {{ opt.label }}
                    </button>
                </div>
            </div>
            <p v-if="gainChart.error" class="gain-empty">{{ gainChart.error }}</p>
            <p v-else-if="gainLoading && !gainChart.bars.length" class="gain-empty">Calculating… {{ gainProgress }}%
            </p>
            <p v-else-if="!gainChart.bars.length" class="gain-empty">No characters to show with the current filters.
            </p>
            <template v-else>
                <p v-if="gainLoading" class="gain-desc">Updating… {{ gainProgress }}%</p>
                <div class="gain-legend">
                    <span v-for="role in gainChart.roles" :key="role" class="gain-legend-item">
                        <span class="gain-legend-swatch" :style="{ background: roleColor(role) }"></span>{{ virtualRoleLabel(role) }}
                    </span>
                </div>
                <div class="gain-scroll">
                    <div class="gain-chart">
                        <div v-for="bar in gainChart.bars" :key="bar.id" class="gain-col"
                            :class="{ variant: bar.variant, active: activeBarTip?.id === bar.id }"
                            :title="activeBarTip?.id === bar.id ? undefined : bar.title"
                            @click.stop="toggleBarTip(bar, $event)">
                            <div class="gain-track">
                                <div class="gain-zero" :style="{ bottom: `${gainChart.zeroPct}%` }"></div>
                                <div class="gain-bar-wrap" :style="bar.style">
                                    <div class="gain-bar" :style="{ backgroundColor: roleColor(bar.vRole) }">
                                    </div>
                                    <span class="gain-value">{{ bar.label }}</span>
                                </div>
                            </div>
                            <div class="gain-name" :title="bar.name">
                                <img class="gain-char-icon" :class="bar._borderClass"
                                    :src="`/exedra-dmg-calc/kioku_images/${bar.charId}_thumbnail.png`"
                                    :alt="bar.name" />

                                <div v-if="bar.tags.length" class="gain-tag-icons">
                                    <img v-for="tag in bar.tags" :key="`${tag.kind}:${tag.value}`" class="gain-tag-icon"
                                        :src="tag.icon" :alt="tag.value" :title="tag.value" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-for="note in gainChart.notes" :key="note" class="gain-desc">{{ note }}</p>
            </template>
        </section>

        <section class="card gain-section">
            <div class="gain-header filters-heading">Attacker strength compared to Lux</div>
            <p class="gain-desc">Damage each character deals as the attacker, compared to {{ LuxMagica }} in the same
                spot. {{ LuxMagica }} is the 0% line; -50% means half of her damage.</p>
            <p class="gain-desc">Every character uses their own element and role, has no other buffs and is supported by
                four {{ LuxMagica }}. All characters are A5 and max level.</p>
            <p class="gain-desc">{{ fightMode === 'st' ? 'One enemy' : fightMode === 'aoe' ? 'Five enemies' : 'Three enemies'}} with 3000 def is used as basis for dmg calculation.</p>

            <div style="width: fit-content; margin: 0 auto; display: flex; align-items: center; gap: 0.5rem;">
                <div class="fight-mode-row">
                    <span class="fight-mode-label">Display</span>
                    <div class="fight-mode-toggle" style="--count: 2" role="radiogroup" aria-label="Damage metric">
                        <div class="fight-mode-highlight" :style="{ transform: `translateX(${metricIndex * 100}%)` }"></div>
                        <button v-for="opt in metricOptions" :key="opt.label" type="button" class="fight-mode-option"
                            :class="{ active: barGraphAverageDmg === opt.value }" :title="opt.title"
                            @click="barGraphAverageDmg = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <div class="fight-mode-row">
                    <span class="fight-mode-label">Fight type</span>
                    <div class="fight-mode-toggle" role="radiogroup" aria-label="Fight type">
                        <div class="fight-mode-highlight" :style="{ transform: `translateX(${fightModeIndex * 100}%)` }"></div>
                        <button v-for="opt in fightModeOptions" :key="opt.value" type="button" class="fight-mode-option"
                            :class="{ active: fightMode === opt.value }" :title="opt.title"
                            @click="fightMode = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
            </div>
            <p v-if="attackerChart.error" class="gain-empty">{{ attackerChart.error }}</p>
            <p v-else-if="attackerLoading && !attackerChart.bars.length" class="gain-empty">Calculating…</p>
            <p v-else-if="!attackerChart.bars.length" class="gain-empty">No characters to show with the current
                filters.</p>
            <template v-else>
                <div class="gain-legend">
                    <span v-for="role in attackerChart.roles" :key="role" class="gain-legend-item">
                        <span class="gain-legend-swatch" :style="{ background: roleColor(role) }"></span>{{ virtualRoleLabel(role) }}
                    </span>
                </div>
                <div class="gain-scroll">
                    <div class="gain-chart">
                        <div v-for="bar in attackerChart.bars" :key="bar.id" class="gain-col"
                            :class="{ variant: bar.variant, active: activeBarTip?.id === bar.id }"
                            :title="activeBarTip?.id === bar.id ? undefined : bar.title"
                            @click.stop="toggleBarTip(bar, $event)">
                            <div class="gain-track">
                                <div class="gain-zero" :style="{ bottom: `${attackerChart.zeroPct}%` }"></div>
                                <div class="gain-bar-wrap" :style="bar.style">
                                    <div class="gain-bar" :style="{ backgroundColor: roleColor(bar.vRole) }">
                                    </div>
                                    <span class="gain-value">{{ bar.label }}</span>
                                </div>
                            </div>
                            <div class="gain-name" :title="bar.name">
                                <img class="gain-char-icon" :class="bar._borderClass"
                                    :src="`/exedra-dmg-calc/kioku_images/${bar.charId}_thumbnail.png`"
                                    :alt="bar.name" />

                                <div v-if="bar.tags.length" class="gain-tag-icons">
                                    <img v-for="tag in bar.tags" :key="`${tag.kind}:${tag.value}`" class="gain-tag-icon"
                                        :src="tag.icon" :alt="tag.value" :title="tag.value" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-for="note in attackerChart.notes" :key="note" class="gain-desc">{{ note }}</p>
            </template>
        </section>

        <div v-if="activeBarTip" class="gain-tip" :class="{ below: activeBarTip.below }"
            :style="{ left: `${activeBarTip.x}px`, top: `${activeBarTip.y}px` }" @click.stop="closeBarTip">
            {{ activeBarTip.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character, KiokuConstants, withMaxLevelsForPlayerLevel } from "../types/KiokuTypes"
import { Ailment, KiokuElement, KiokuRole, LuxMagica } from '../types/enums'
import { useSetting } from "../store/settingsStore"
import { ScoreAttackKioku } from "../models/ScoreAttackKioku"
import { ScoreAttackTeam } from "../models/ScoreAttackTeam"
import { skillDetails } from "../utils/helpers"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
import { useFriendStore } from "../store/friendStore"
import { Enemy } from "../types/EnemyTypes"

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

interface ArchetypeRule {
    id: string
    label: string
    match: (k: ScoreAttackKioku) => boolean
}

const archetypeRules: ArchetypeRule[] = [
    {
        id: "mono",
        label: "Mono Element",
        match: (k: ScoreAttackKioku) => k.effects.some(e =>
            e.abilityEffectType.includes("AIM")
            || e.abilityEffectType.includes("ZONE")
            || (!e.abilityEffectType.includes("DMG") && e.element)
        )
    },
    {
        id: "fua",
        label: "Fua",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.abilityEffectType === "ADDITIONAL_SKILL_ACT")
    },
    {
        id: "crit",
        label: "Crit",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.abilityEffectType.includes("_CT"))
        // Self crit is also crit archetype
    },
    {
        id: "mp",
        label: "MP Generator",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.range > 0 && [
            "GAIN_EP_FIXED",
            "GAIN_EP_RATIO",
            "UP_EP_RECOVER_RATE_RATIO"
        ].includes(e.abilityEffectType))
    },
    {
        id: "sp",
        label: "SP Generator",
        match: (k: ScoreAttackKioku) => k.effects.some(e => "GAIN_SP_FIXED" === e.abilityEffectType)
    },
    {
        id: "aa",
        label: "Action Advance",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.range > 0 && e.abilityEffectType === "HASTE")
    },
    {
        id: "spd_up",
        label: "AoE SPD buff",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.range > 0 && e.abilityEffectType.includes("UP_SPD"))
    },
    {
        id: "spd_down",
        label: "SPD debuff",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.range > 0 && e.abilityEffectType.includes("N_SPD"))
    },
    {
        id: "ailment",
        label: "Ailment",
        match: (k: ScoreAttackKioku) => k.effects.some(e => Object.values(Ailment).includes(
            e.abilityEffectType.replace(/_(ATK|DEF|HP)$/, "") as Ailment
        )),
    },
    {
        id: "ailment_remove",
        label: "Ailment Remove",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.abilityEffectType === "REMOVE_ALL_ABNORMAL")
    },
    {
        id: "buff_remove",
        label: "Buff Remove",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.abilityEffectType === "REMOVE_ALL_BUFF")
    },
    {
        id: "debuff_remove",
        label: "Debuff Remove",
        match: (k: ScoreAttackKioku) => k.effects.some(e => e.abilityEffectType === "REMOVE_ALL_DEBUFF")
    },
]

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
const barGraphAverageDmg = useSetting("barGraphAverageDmg", false)

const fightModeOptions = [
    { value: "st", label: "ST", title: "Single target — only the center enemy takes damage" },
    { value: "prox", label: "Prox", title: "Proximity — the center enemy and its two neighbors take damage" },
    { value: "aoe", label: "AoE", title: "Area of effect — all five enemies take damage" },
] as const
type FightMode = typeof fightModeOptions[number]["value"]
const fightMode = useSetting<FightMode>("fightMode", "aoe")
const fightModeIndex = computed(() => fightModeOptions.findIndex(opt => opt.value === fightMode.value))

const metricOptions = [
    { value: false, label: "Max Damage", title: "Show the max dmg increase" },
    { value: true, label: "Average Damage", title: "Show the average dmg instead of the max dmg" },
] as const
const metricIndex = computed(() => metricOptions.findIndex(opt => opt.value === barGraphAverageDmg.value))

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

const archetypesFor = (k: ScoreAttackKioku): ArchetypeRule[] =>
    archetypeRules.filter(rule => rule.match(k))

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
        _archetypes: archetypesFor(k),
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
        .filter(c => showLimiteds.value ? true : c.isStandardChar)
        .filter(c => showStandards.value ? true : !c.isStandardChar)
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

const prepareForChart = (c: Character): Character => {
    return withMaxLevelsForPlayerLevel({ ...c, ascension: KiokuConstants.maxAscension }, KiokuConstants.maxKiokuLvl)
}

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

interface Dealer {
    char: Character
    context: DealerContext
    tags: DealerTag[]
    dps: ScoreAttackKioku
    baseline: DmgResult
}

interface DealerGain {
    dealer: Dealer
    result: DmgResult
    maxGain: number
    avgGain: number
}

const dealerLabel = (d: Dealer) => `${d.char.name}${d.tags.length ? ` (${d.tags.map(t => t.value).join("/")})` : ""}`

const exampleEnemies = computed(() => {
    const outerEnabled = fightMode.value === "aoe"
    const proxEnabled = fightMode.value === "aoe" || fightMode.value === "prox"
    return [
        { name: 'Left Other', maxBreak: 500, defense: 3000, enabled: outerEnabled, defenseUp: 0, dmgTakenDown: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 10 },
        { name: 'Left Proximity', maxBreak: 500, defense: 3000, enabled: proxEnabled, defenseUp: 0, dmgTakenDown: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 10 },
        { name: 'Target', maxBreak: 500, defense: 3000, enabled: true, defenseUp: 0, dmgTakenDown: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 },
        { name: 'Right Proximity', maxBreak: 500, defense: 3000, enabled: proxEnabled, defenseUp: 0, dmgTakenDown: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 10 },
        { name: 'Right Other', maxBreak: 500, defense: 3000, enabled: outerEnabled, defenseUp: 0, dmgTakenDown: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 10 },
    ] as Enemy[]
})

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

// Same shape, but for the attacker chart: `gain` is the dmg the character deals as the
// attacker compared to Lux in the same spot (0% = as much as Lux).
type AttackerGainEntry = SupportGainEntry

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

const pctGain = (value: number, base: number) => base > 0 ? (value / base - 1) * 100 : 0

const calculateDmg = (
    dps: ScoreAttackKioku,
    supports: ScoreAttackKioku[],
    activeAilment?: Ailment,
    noConsume = false,
): DmgResult => {
    const [max, avg, critRate] = new ScoreAttackTeam(
        dps,
        supports,
        100,
        activeAilment ? [activeAilment] : [],
        {},
        false,
        new Set(),
        new Set(),
        new Map(),
        new Set(),
        new Map(),
        noConsume,
    ).calculate_max_dmg(exampleEnemies.value, 0)

    return { max, avg, critRate }
}

// Static: only depends on the enums, so build it once.
const dealerContexts: DealerContext[] = [
    makeContext(),
    makeContext(undefined, undefined, undefined, true),

    ...Object.values(KiokuElement).flatMap(element => [
        makeContext(element),
        makeContext(element, undefined, undefined, true),
    ]),

    ...Object.values(KiokuRole).flatMap(role => [
        makeContext(undefined, role),
        makeContext(undefined, role, undefined, true),
    ]),

    ...Object.values(Ailment).flatMap(ailment => [
        makeContext(undefined, undefined, ailment),
        makeContext(undefined, undefined, ailment, true),
    ]),

    ...Object.values(KiokuElement).flatMap(element =>
        Object.values(KiokuRole).flatMap(role => [
            makeContext(element, role),
            makeContext(element, role, undefined, true),
        ])
    ),

    ...Object.values(KiokuElement).flatMap(element =>
        Object.values(Ailment).flatMap(ailment => [
            makeContext(element, undefined, ailment),
            makeContext(element, undefined, ailment, true),
        ])
    ),

    ...Object.values(KiokuRole).flatMap(role =>
        Object.values(Ailment).flatMap(ailment => [
            makeContext(undefined, role, ailment),
            makeContext(undefined, role, ailment, true),
        ])
    ),

    ...Object.values(KiokuElement).flatMap(element =>
        Object.values(KiokuRole).flatMap(role =>
            Object.values(Ailment).flatMap(ailment => [
                makeContext(element, role, ailment),
                makeContext(element, role, ailment, true),
            ])
        )
    ),
]

const NONE_CONTEXT_KEY = contextKey(makeContext())

const buildCharGainResult = (
    ch: MarkedChar,
    gains: DealerGain[],
    metric: Metric,
): CharGainResult | null => {
    const gainOf = (g: DealerGain) => metric === "avg" ? g.avgGain : g.maxGain

    const toRow = (g: DealerGain, tags: DealerTag[]): GainRow => ({
        ch,
        tags,
        gain: gainOf(g),
        maxGain: g.maxGain,
        avgGain: g.avgGain,
        critRate: g.result.critRate,
    })

    const gainByContext = new Map<string, DealerGain>()
    for (const g of gains) {
        gainByContext.set(contextKey(g.dealer.context), g)
    }

    const noneGain = gainByContext.get(NONE_CONTEXT_KEY)
    if (!noneGain) return null

    const meaningfulTagsFor = (g: DealerGain): DealerTag[] =>
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

// --- Heavy part: runs in the background, in time-sliced chunks -------------------------
// It only depends on the roster, NOT on the filters or the avg/max toggle.

const gainResults = shallowRef<SupportGainEntry[]>([])
const gainStatus = shallowRef({ error: "", notes: [] as string[] })
const gainLoading = ref(false)
const gainProgress = ref(0)
let gainRun = 0

const attackerResults = shallowRef<AttackerGainEntry[]>([])
const attackerStatus = shallowRef({ error: "", notes: [] as string[] })
const attackerLoading = ref(false)

const SLICE_MS = 12

const yieldToMain = (): Promise<void> => {
    const sched = (globalThis as any).scheduler
    return typeof sched?.yield === "function"
        ? sched.yield()
        : new Promise<void>(resolve => setTimeout(resolve, 0))
}

// The bar charts are only published once their icons are in the browser cache, so the bars and
// their character/tag icons appear together instead of the icons popping in afterwards.
const IMAGE_PRELOAD_TIMEOUT_MS = 3000

const preloadImages = (urls: Iterable<string>): Promise<void> => {
    const loads = [...urls].map(url => new Promise<void>(resolve => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // a missing icon must never block the chart
        img.src = url
    }))

    let timer: ReturnType<typeof setTimeout>
    const timeout = new Promise<void>(resolve => {
        timer = setTimeout(resolve, IMAGE_PRELOAD_TIMEOUT_MS) // don't hang on a stalled request
    })

    return Promise.race([Promise.all(loads), timeout]).finally(() => clearTimeout(timer))
}

// Every icon a chart can show: the character thumbnails plus the tag icons of their variants.
// Covers both metrics so flipping the avg/max toggle never loads anything new.
// `minGain` mirrors the chart's own cut-off, so characters that are never drawn aren't loaded.
const chartImageUrls = (entries: SupportGainEntry[], minGain: number): Set<string> => {
    const urls = new Set<string>()

    for (const entry of entries) {
        for (const metric of [entry.max, entry.avg]) {
            for (const row of [metric.main, ...metric.variants]) {
                if (row.gain <= minGain) continue

                urls.add(`/exedra-dmg-calc/kioku_images/${row.ch.id}_thumbnail.png`)
                row.tags.forEach(tag => urls.add(tag.icon))
            }
        }
    }

    return urls
}

// Attacker chart: every character is put in the attacker slot with four Lux as supports and
// compared to Lux in the same setup. Element and role are the character's own, so the only thing
// varied is which ailment is active on the enemy and whether one-time buffs are excluded.
// Cheap (one calc per character per context),
// so it runs before the support chart and shows up first.
const attackerContexts: DealerContext[] = [
    makeContext(),
    makeContext(undefined, undefined, undefined, true),
    ...Object.values(Ailment).flatMap(ailment => [
        makeContext(undefined, undefined, ailment),
        makeContext(undefined, undefined, ailment, true),
    ]),
]

// Returns false if a newer run superseded this one and the caller should bail out.
const computeAttackerGains = async (
    lux: Character,
    filler: ScoreAttackKioku,
    shouldStop: () => Promise<boolean>,
): Promise<boolean> => {
    const supports = [filler, filler, filler, filler]
    const luxDps = toKioku(prepareForChart(lux))

    const finishAttacker = (results: AttackerGainEntry[], error = "", notes: string[] = []) => {
        attackerResults.value = results
        attackerStatus.value = { error, notes }
        attackerLoading.value = false
    }

    // Lux's own dmg in each ailment context is what everyone is compared against.
    // (Reusing the `Dealer` shape here: "dealer" is the reference Lux, `baseline` its dmg.)
    const references: Dealer[] = []

    for (const context of attackerContexts) {
        if (await shouldStop()) return false

        try {
            const baseline = calculateDmg(luxDps, supports, context.ailment, context.noConsume)

            if (baseline.max > 0 || baseline.avg > 0) {
                references.push({ char: lux, context, tags: context.tags, dps: luxDps, baseline })
            }
        } catch (err) {
            console.error(
                `Attacker chart: failed to calculate Lux Magica in ${context.tags.map(t => t.value).join("/") || "none"}:`,
                err,
            )
        }
    }

    if (!references.some(r => contextKey(r.context) === NONE_CONTEXT_KEY)) {
        finishAttacker([], "No Lux Magica baseline could be calculated.")
        return true
    }

    const chars = markedCharacters.value.filter(c => c.name !== LuxMagica)
    const results: AttackerGainEntry[] = []
    let failed = 0

    for (const ch of chars) {
        try {
            const dps = toKioku(prepareForChart(ch))
            const gains: DealerGain[] = []

            for (const reference of references) {
                if (await shouldStop()) return false

                try {
                    const result = calculateDmg(dps, supports, reference.context.ailment, reference.context.noConsume)

                    gains.push({
                        dealer: reference,
                        result,
                        maxGain: pctGain(result.max, reference.baseline.max),
                        avgGain: pctGain(result.avg, reference.baseline.avg),
                    })
                } catch (err) {
                    failed++

                    console.warn(
                        `Attacker chart: failed to calculate ${ch.name} in ${dealerLabel(reference)}:`,
                        err,
                    )
                }
            }

            if (!gains.length) continue

            const max = buildCharGainResult(ch, gains, "max")
            const avg = buildCharGainResult(ch, gains, "avg")

            if (max && avg) results.push({ ch, max, avg })
        } catch (err) {
            failed++

            console.warn(`Attacker chart: failed to calculate ${ch.name}:`, err)
        }
    }

    // Keep the "Calculating…" state until the icons are ready, then show bars + icons together.
    await preloadImages(chartImageUrls(results, -Infinity))
    if (await shouldStop()) return false

    finishAttacker(results, "", failed ? [`${failed} calculation(s) failed (see console).`] : [])
    return true
}

const computeGains = async () => {
    const run = ++gainRun
    const cancelled = () => run !== gainRun

    gainLoading.value = true
    gainProgress.value = 0
    attackerLoading.value = true

    // Let the browser paint/handle input before starting any heavy work.
    await yieldToMain()
    if (cancelled()) return

    let sliceStart = performance.now()
    // Yields to the browser when the current slice is used up.
    // Returns true if a newer run superseded this one and we should bail out.
    const shouldStop = async (): Promise<boolean> => {
        if (performance.now() - sliceStart > SLICE_MS) {
            await yieldToMain()
            sliceStart = performance.now()
        }
        return cancelled()
    }

    const finish = (results: SupportGainEntry[], error = "", notes: string[] = []) => {
        gainResults.value = results
        gainStatus.value = { error, notes }
        gainProgress.value = 100
        gainLoading.value = false
    }

    const lux = store.characters.find(c => c.name === LuxMagica)

    if (!lux) {
        const error = `${LuxMagica} was not found in your roster.`
        attackerResults.value = []
        attackerStatus.value = { error, notes: [] }
        attackerLoading.value = false
        finish([], error)
        return
    }

    const filler = toKioku(
        prepareForChart(lux),
        { role: undefined, element: undefined },
    )

    if (!(await computeAttackerGains(lux, filler, shouldStop))) return

    const dealers: Dealer[] = []

    for (const context of dealerContexts) {
        if (await shouldStop()) return

        try {
            const dps = toKioku(
                prepareForChart(lux),
                {
                    element: context.element,
                    role: context.role,
                },
            )

            const baseline = calculateDmg(
                dps,
                [filler, filler, filler, filler],
                context.ailment,
                context.noConsume,
            )

            if (baseline.max > 0 || baseline.avg > 0) {
                dealers.push({
                    char: lux,
                    context,
                    tags: context.tags,
                    dps,
                    baseline,
                })
            }
        } catch (err) {
            console.error(
                `Failed to calculate Lux Magica context ${context.tags.map(t => t.value).join("/") || "none"}:`,
                err,
            )
        }
    }

    if (!dealers.length) {
        finish([], "No Lux Magica test context could be calculated.")
        return
    }

    const chars = markedCharacters.value.filter(c => c.name !== LuxMagica)
    const results: SupportGainEntry[] = []
    let failed = 0

    for (const [i, ch] of chars.entries()) {
        gainProgress.value = Math.round((i / chars.length) * 100)

        try {
            const support = toKioku(prepareForChart(ch))
            const gains: DealerGain[] = []

            for (const dealer of dealers) {
                if (await shouldStop()) return

                try {
                    const result = calculateDmg(
                        dealer.dps,
                        [support, filler, filler, filler],
                        dealer.context.ailment,
                        dealer.context.noConsume,
                    )

                    gains.push({
                        dealer,
                        result,
                        maxGain: pctGain(result.max, dealer.baseline.max),
                        avgGain: pctGain(result.avg, dealer.baseline.avg),
                    })
                } catch (err) {
                    failed++

                    console.warn(
                        `Support chart: failed to calculate ${ch.name} in ${dealerLabel(dealer)}:`,
                        err,
                    )
                }
            }

            if (!gains.length) continue

            const max = buildCharGainResult(ch, gains, "max")
            const avg = buildCharGainResult(ch, gains, "avg")

            if (max && avg) results.push({ ch, max, avg })
        } catch (err) {
            failed++

            console.warn(
                `Support chart: failed to calculate ${ch.name}:`,
                err,
            )
        }
    }

    if (cancelled()) return

    // Keep the "Calculating…" state until the icons are ready, then show bars + icons together.
    gainProgress.value = 100
    await preloadImages(chartImageUrls(results, 1))
    if (cancelled()) return

    finish(results, "", failed ? [`${failed} calculation(s) failed (see console).`] : [])
}

onBeforeUnmount(() => {
    gainRun++ // cancel any in-flight calculation
})

// --- Cheap part: runs on every filter change --------------------------------------------

// Turns rows of { character, tags, gain } into everything the bar chart template needs.
// Negative gains are drawn below the zero line.
const buildBarChart = (
    rows: GainRow[],
    { idPrefix = "", titleLabel = "dmg increase" }: { idPrefix?: string; titleLabel?: string } = {},
) => {
    const sorted = [...rows].sort((a, b) => a.gain - b.gain)

    const gains = sorted.map(r => r.gain)

    const max = Math.max(0, ...gains)
    const min = Math.min(0, ...gains)
    const span = max - min || 1

    const bars = sorted.map(({ ch, tags, gain, maxGain, avgGain, critRate }) => ({
        id: `${idPrefix}${ch.id}:${tags.map(t => `${t.kind}-${t.value}`).join("|") || "none"}`,

        name: tags.length
            ? `${ch.name} (${tags.map(t => t.value).join("/")})`
            : ch.name,

        charId: ch.id,
        tags,

        role: ch.role as string,
        vRole: virtualRoleForChar(ch) as string,
        isStandardChar: ch.isStandardChar,
        _borderClass: borderClass(ch),

        gain,
        variant: tags.length > 0,
        label: fmt(gain),
        title: makeBarTitle({ avgGain, maxGain, critRate }, titleLabel),

        style: gain < 0
            ? {
                top: `${(max / span) * 100}%`,
                height: `${(-gain / span) * 100}%`,
            }
            : {
                bottom: `${(-min / span) * 100}%`,
                height: `${(gain / span) * 100}%`,
            },
    }))

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

const gainChart = computed(() => {
    const { error, notes } = gainStatus.value

    if (error) return { ...emptyBarChart(), notes, error }

    const metric: Metric = barGraphAverageDmg.value ? "avg" : "max"
    const visibleIds = new Set(allChars.value.map(c => c.id))

    const picked = gainResults.value
        .filter(entry => visibleIds.has(entry.ch.id))
        .map(entry => entry[metric])

    const rows = [
        ...picked
            .map(r => r.main)
            .filter(m => m.gain > 1),

        ...picked
            .flatMap(r => r.variants)
            .filter(v => v.gain > 1),
    ]

    return { ...buildBarChart(rows), notes, error: "" }
})

// Unlike the support chart, negative values are meaningful here (weaker than Lux), so nothing is
// filtered out by gain. Use the role/element filters to narrow it down.
const attackerChart = computed(() => {
    const { error, notes } = attackerStatus.value

    if (error) return { ...emptyBarChart(), notes, error }

    const metric: Metric = barGraphAverageDmg.value ? "avg" : "max"
    const visibleIds = new Set(allChars.value.map(c => c.id))

    const picked = attackerResults.value
        .filter(entry => visibleIds.has(entry.ch.id))
        .map(entry => entry[metric])

    const rows = [
        ...picked.map(r => r.main),
        ...picked.flatMap(r => r.variants),
    ]

    return {
        ...buildBarChart(rows, { idPrefix: "attacker:", titleLabel: "dmg vs Lux" }),
        notes,
        error: "",
    }
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
    if (ch.name === LuxMagica) return "default-border"
    if (ch.obtain && ch.obtain !== "Permanent") return "limited-border"
    return "default-border"
}

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.name === LuxMagica) { }
    else if (ch.obtain && !ch.isStandardChar) {
        title += ` - ${ch.obtain}`
    }
    return title
}

const exportOpts = { exportClass: "exporting" }

const shareOptionsForGrid = () => ({
    title: `${useFriendStore().getFormattedDisplayNamePossessive()} Kioku Grid`,
    backUrl: window.location.href,
})

watch([markedCharacters, fightMode], computeGains, { immediate: true })
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

.gain-header {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.gain-desc,
.gain-empty {
    width: 100%;
    margin: 0;
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

.gain-tag-icons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}
</style>
