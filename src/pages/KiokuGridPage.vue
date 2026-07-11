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
        </section>

        <section class="filters card">
            <span class="filters-heading">Display</span>
            <label class="filter-chip" :class="{ active: showLevels }">
                <input type="checkbox" v-model="showLevels" /> Magic &amp; Special levels
            </label>
            <label class="filter-chip" :class="{ active: showHearts }">
                <input type="checkbox" v-model="showHearts" /> Heartphial levels
            </label>
            <label class="filter-chip" :class="{ active: colourLevels, disabled: !(showLevels || showHearts) }">
                <input type="checkbox" v-model="colourLevels" :disabled="!(showLevels || showHearts)" /> Colour max
                levels
            </label>
            <label class="filter-chip" :class="{ active: splitAttackerRange }">
                <input type="checkbox" v-model="splitAttackerRange" /> Split Attacker ranges
            </label>
            <label class="filter-chip" :class="{ active: splitBreakerRange }">
                <input type="checkbox" v-model="splitBreakerRange" /> Split Breaker ranges
            </label>
            <label class="filter-chip" :class="{ active: splitDebufferRange }">
                <input type="checkbox" v-model="splitDebufferRange" /> Split Debuffer ranges
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
                                    :style="{ '--band-rows': bandRows(yVal, r) }">
                                    <div v-for="ch in getChars(xVal, yVal, r)" :key="ch.id" class="char-thumb">
                                        <div class="character-img-wrapper">
                                            <div>
                                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                                    <img :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`"
                                                        :alt="ch.name" :title="ch._title" class="char-img"
                                                        :class="ch._borderClass" />
                                                </a>
                                                <div class="heart-level-badge level-badge"
                                                    v-if="showHearts && ch.enabled"
                                                    :class="colourLevels ? (ch.heartphialLvl === KiokuConstants.maxHeartphialLvl ? 'maxLvl' : 'notMaxLvl') : ''">
                                                    {{ ch.heartphialLvl }}
                                                </div>
                                                <div class="magic-level-badge level-badge"
                                                    v-if="showLevels && ch.enabled"
                                                    :class="colourLevels ? (ch.magicLvl === KiokuConstants.maxMagicLvl ? 'maxLvl' : 'notMaxLvl') : ''">
                                                    {{ ch.magicLvl }}
                                                </div>
                                                <div class="special-level-badge level-badge"
                                                    v-if="showLevels && ch.enabled"
                                                    :class="colourLevels ? (ch._isMaxSpecial ? 'maxLvl' : 'notMaxLvl') : ''">
                                                    {{ ch.specialLvl }}
                                                </div>
                                                <div class="ascension-badge level-badge"
                                                    v-if="infoAxisKey === 'ascension'">
                                                    {{ ch.ascension === -1 ? "X" : `A${ch.ascension}` }}
                                                </div>
                                                <div class="ascension-badge level-badge info-badge-img"
                                                    v-else-if="infoAxisKey === 'element'">
                                                    <img :src="`/exedra-dmg-calc/elements/${ch.element}.png`"
                                                        :alt="ch.element" class="info-badge-icon" />
                                                </div>
                                                <div class="ascension-badge level-badge"
                                                    v-else-if="infoAxisKey === 'role' && shouldShowRangeBadge(ch)">
                                                    <div class="role-badge-inner">
                                                        <img :src="`/exedra-dmg-calc/roles/${ch.role}.png`"
                                                            :alt="ch.role" class="info-badge-icon" />
                                                        <span class="role-badge-tag">{{ rangeTag(ch.range, ch.role )[0] }}</span>
                                                    </div>
                                                </div>
                                                <div class="ascension-badge level-badge info-badge-img"
                                                    v-else-if="infoAxisKey === 'role'">
                                                    <img :src="`/exedra-dmg-calc/roles/${ch.role}.png`" :alt="ch.role"
                                                        class="info-badge-icon" />
                                                </div>
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
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character, KiokuElement, KiokuRole, KiokuConstants } from "../types/KiokuTypes"
import { useSetting } from "../store/settingsStore"
import { Kioku } from "../models/Kioku"
import { skillDetails } from "../utils/helpers"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
import { useFriendStore } from "../store/friendStore"

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
const showLevels = useSetting("showLevels", true)
const showHearts = useSetting("showHearts", false)
const colourLevels = useSetting("colourLevels", true)
const splitAttackerRange = useSetting("splitAttackerRange", true)
const splitBreakerRange = useSetting("splitBreakerRange", true)
const splitDebufferRange = useSetting("splitDebufferRange", true)

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

const virtualRoleForChar = (ch: { role: string; range: number }): VirtualRole => {
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

const isSplittableRole = (role: string): boolean => splitSettingForRole(role) !== null

const shouldShowRangeBadge = (ch: { role: string }): boolean => {
    const setting = splitSettingForRole(ch.role)
    return !!setting && setting.value
}

const hiddenElements = useSetting<KiokuElement[]>("hiddenGridElements", [])
const hiddenVirtualRoles = useSetting<VirtualRole[]>("hiddenGridRoles", [])

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

const skillDetailsBySkillMstId = (() => {
    const map = new Map<number, (typeof skillDetails[keyof typeof skillDetails])[]>()
    for (const v of Object.values(skillDetails)) {
        const arr = map.get(v.skillMstId) ?? []
        arr.push(v)
        map.set(v.skillMstId, arr)
    }
    return map
})()

const computeSkillRange = (c: Character): number => {
    const k = new Kioku({ ...c })
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
    if (c.name === "Lux☆Magica") c.rarity = 4
    if (!c.enabled) c.ascension = -1
    range = computeSkillRange(c as unknown as Character)
    const enriched = { ...c, range }
    return {
        ...enriched,
        _borderClass: borderClass(enriched as unknown as Character),
        _title: makeTitle(enriched as unknown as Character),
        _isMaxSpecial: isMaxSpecialLvl(enriched as unknown as Character),
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
        .filter(c => !hiddenElements.value.includes(c.element as KiokuElement))
        .filter(c => !hiddenVirtualRoles.value.includes(virtualRoleForChar(c)))
)

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

const bandRows = (yVal: string, rarity: number): number => {
    const maxInRow = maxCharsPerRarityPerRow.value[yVal]?.[rarity] ?? 0
    return Math.max(1, Math.ceil(maxInRow / 2))
}

const today = new Date()

const borderClass = (ch: Character): string => {
    if (ch.name === "Lux☆Magica") return "default-border"
    if (ch.obtain && ch.obtain !== "Permanent") return "limited-border"
    if (today > new Date(ch.permaDate)) return "default-border"
    return "not-limited-border"
}

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.name === "Lux☆Magica") { }
    else if (ch.obtain && ch.obtain !== "Permanent") {
        title += ` - ${ch.obtain}`
    } else if (ch.permaDate == "") {
        title += " - Not added to permanent yet"
    } else if (new Date(ch.permaDate) > today) {
        title += " - Added to standard pool on " + new Date(ch.permaDate).toLocaleDateString()
    }
    return title
}

const isMaxSpecialLvl = (ch: Character): boolean => {
    if (ch.ascension === 5) return ch.specialLvl === 10
    if (ch.ascension >= 3) return ch.specialLvl === 7
    return ch.specialLvl === 4
}

const exportOpts = { exportClass: "exporting" }

const shareOptionsForGrid = () => ({
    title: `${useFriendStore().getFormattedDisplayNamePossessive()} Kioku Grid`,
    backUrl: window.location.href,
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

.exporting .grid-scroll {
    overflow: visible !important;
}

.exporting .er-grid {
    margin: 0 !important;
    width: max-content !important;
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
    margin: 0 auto;
}

.grid-scroll {
    overflow-x: visible;
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
    grid-template-columns: repeat(2, var(--icon));
    padding: var(--pad) 4px;
    min-height: calc(var(--band-rows, 1) * var(--icon) + (var(--band-rows, 1) - 1) * var(--gap) + 2 * var(--pad));
    border-radius: 4px;
    box-sizing: border-box;
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

.character-img-wrapper>div {
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

.limited-border {
    border: 2px solid red;
}

.not-limited-border {
    border: 2px solid rgb(255, 255, 0);
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

.heart-level-badge {
    left: 22%;
    top: 0;
}

.magic-level-badge {
    left: 22%;
    bottom: 0;
}

.special-level-badge {
    left: 78%;
    bottom: 0;
}

.ascension-badge {
    left: 78%;
    top: 0;
}

.maxLvl {
    color: palegreen;
}

.notMaxLvl {
    color: pink;
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
</style>
