<template>
    <div>
        <div class="options-bar">
            <div class="options-row">
                <button class="copy-btn" @click="copyAscensionList">Copy to clipboard</button>
                <button class="copy-btn" @click="downloadAscensionList">Download</button>
            </div>
            <div class="options-row">
                <label> <input type="checkbox" v-model="show5stars" /> Include 5-stars </label>
                <label> <input type="checkbox" v-model="show4stars" /> Include 4-stars </label>
                <label> <input type="checkbox" v-model="show3stars" /> Include 3-stars </label>
                <label> <input type="checkbox" v-model="showUnowned" /> Show Unowned </label>
            </div>
            <div class="options-row">
                <label> <input type="checkbox" v-model="showLevels" /> Show Magic & Special levels </label>
                <label> <input type="checkbox" v-model="showHearts" /> Show Heartphial levels </label>
                <label> <input type="checkbox" v-model="colourLevels" :disabled="!(showLevels || showHearts)" /> Colour
                    max levels </label>
                <label> <input type="checkbox" v-model="splitAttackerRange" /> Split Attacker ranges </label>
            </div>
            <div class="options-row">
                <label>
                    Rows:
                    <select :value="yAxisKey" class="axis-select" @change="onYChange">
                        <option v-for="opt in axisOptions" :key="opt.key" :value="opt.key">
                            {{ opt.label }} {{ opt.key === xAxisKey ? "🗘" : "" }}
                        </option>
                    </select>
                </label>
                <label>
                    Columns:
                    <select :value="xAxisKey" class="axis-select" @change="onXChange">
                        <option v-for="opt in axisOptions" :key="opt.key" :value="opt.key">
                            {{ opt.label }} {{ opt.key === yAxisKey ? "🗘" : "" }}
                        </option>
                    </select>
                </label>
            </div>

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
                        <span v-if="isVirtualAttacker(vRole)" class="role-chip-label">{{ virtualRoleRangeTag(vRole)
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
                                    <span v-if="isVirtualAttacker(xVal)" class="role-header-label">{{
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
                                    <span v-if="isVirtualAttacker(yVal)" class="role-header-label">{{
                                        virtualRoleRangeTag(yVal) }}</span>
                                </div>
                            </template>
                            <span v-else class="ascension-header-label">{{ yVal === "-1" ? "Not Owned" : `A${yVal}`
                                }}</span>
                        </td>
                        <td v-for="xVal in visibleXValues" :key="xVal" class="grid-cell">
                            <div v-for="r in [5, 4, 3]" :key="r" v-show="shouldShow(r)" class="rarity-band"
                                :class="`rarity-${r}`" :style="{ '--band-rows': bandRows(xVal, yVal, r) }">
                                <div v-for="ch in getChars(xVal, yVal, r)" :key="ch.id" class="char-thumb">
                                    <div class="character-img-wrapper">
                                        <div>
                                            <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                                <img :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`"
                                                    :alt="ch.name" :title="makeTitle(ch)" class="char-img"
                                                    :class="borderClass(ch)" />
                                            </a>

                                            <div class="heart-level-badge level-badge" v-if="showHearts && ch.enabled"
                                                :class="colourLevels ? (ch.heartphialLvl === KiokuConstants.maxHeartphialLvl ? 'maxLvl' : 'notMaxLvl') : ''">
                                                {{ ch.heartphialLvl }}
                                            </div>

                                            <div class="magic-level-badge level-badge" v-if="showLevels && ch.enabled"
                                                :class="colourLevels ? (ch.magicLvl === KiokuConstants.maxMagicLvl ? 'maxLvl' : 'notMaxLvl') : ''">
                                                {{ ch.magicLvl }}
                                            </div>

                                            <div class="special-level-badge level-badge" v-if="showLevels && ch.enabled"
                                                :class="colourLevels ? (isMaxSpecialLvl(ch) ? 'maxLvl' : 'notMaxLvl') : ''">
                                                {{ ch.specialLvl }}
                                            </div>

                                            <div class="ascension-badge level-badge" v-if="infoAxisKey === 'ascension'">
                                                {{ ch.ascension === -1 ? "X" : `A${ch.ascension}` }}
                                            </div>
                                            <div class="ascension-badge level-badge info-badge-img"
                                                v-else-if="infoAxisKey === 'element'">
                                                <img :src="`/exedra-dmg-calc/elements/${ch.element}.png`"
                                                    :alt="ch.element" class="info-badge-icon" />
                                            </div>
                                            <div class="ascension-badge level-badge"
                                                v-else-if="infoAxisKey === 'role' && ch.role === KiokuRole.Attacker && splitAttackerRange">
                                                <div class="role-badge-inner">
                                                    <img :src="`/exedra-dmg-calc/roles/${ch.role}.png`" :alt="ch.role"
                                                        class="info-badge-icon" />
                                                    <span class="role-badge-tag">{{ rangeTag(ch.range)[0] }}</span>
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
import html2canvas from "html2canvas"
import { toast } from "vue3-toastify"
import { Kioku } from "../models/Kioku"
import { skillDetails } from "../utils/helpers"

const store = useCharacterStore()
type AxisKey = "element" | "role" | "ascension"

const axisOptions: { key: AxisKey; label: string }[] = [
    { key: "element", label: "Element" },
    { key: "role", label: "Role" },
    { key: "ascension", label: "Ascension" },
]

const xAxisKey = useSetting<AxisKey>("gridXAxis", "element")
const yAxisKey = useSetting<AxisKey>("gridYAxis", "role")

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
const showUnowned = useSetting("showGridUnowned", false)
const showLevels = useSetting("showLevels", true)
const showHearts = useSetting("showHearts", false)
const colourLevels = useSetting("colourLevels", true)
const splitAttackerRange = useSetting("splitAttackerRange", true)

type VirtualRole = string

const VIRTUAL_ATTACKER_ST = "Attacker-ST"
const VIRTUAL_ATTACKER_P = "Attacker-Prox"
const VIRTUAL_ATTACKER_AOE = "Attacker-AOE"

const rangeTag = (range: number): string => {
    if (range === 2) return "Prox"
    if (range === 3) return "AOE"
    return "ST"
}

const virtualRoleForChar = (ch: { role: string; range: number }): VirtualRole => {
    if (ch.role === KiokuRole.Attacker && splitAttackerRange.value) {
        return `Attacker-${rangeTag(ch.range)}`
    }
    return ch.role
}

const isVirtualAttacker = (vRole: VirtualRole): boolean =>
    vRole === VIRTUAL_ATTACKER_ST || vRole === VIRTUAL_ATTACKER_P || vRole === VIRTUAL_ATTACKER_AOE

const virtualRoleBase = (vRole: VirtualRole): string =>
    isVirtualAttacker(vRole) ? KiokuRole.Attacker : vRole

const virtualRoleRangeTag = (vRole: VirtualRole): string => {
    if (vRole === VIRTUAL_ATTACKER_ST) return "ST"
    if (vRole === VIRTUAL_ATTACKER_P) return "Prox"
    if (vRole === VIRTUAL_ATTACKER_AOE) return "AOE"
    return ""
}

const virtualRoleLabel = (vRole: VirtualRole): string =>
    isVirtualAttacker(vRole) ? `Attacker (${virtualRoleRangeTag(vRole)})` : vRole

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

const markedCharacters = computed(() => store.characters.map(c => {
    let range = 1
    if (c.name === "Lux☆Magica") c.rarity = 4
    if (!c.enabled) c.ascension = -1
    if (c.role === KiokuRole.Attacker) {
        const k = new Kioku({ ...c })
        for (const e of Object.values(skillDetails).filter(v => v.skillMstId === k.data.special_id * 100 + 10)) {
            if (e.abilityEffectType.startsWith("DMG_")) {
                range = Math.max(range, e.range)
            }
        }
    }
    return { ...c, range }
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
        if (role === KiokuRole.Attacker && splitAttackerRange.value) {
            result.push(VIRTUAL_ATTACKER_ST, VIRTUAL_ATTACKER_P, VIRTUAL_ATTACKER_AOE)
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
        .filter(c => showUnowned.value ? true : c.enabled )
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

const getChars = (xVal: string, yVal: string, rarity: number): (typeof allChars.value[0])[] =>
    allChars.value.filter(c => {
        if (c.rarity !== rarity) return false

        const matchesVal = (axisKey: AxisKey, val: string) => {
            if (axisKey === "element") return c.element === val
            if (axisKey === "ascension") return val === (c.enabled ? String(c.ascension) : "-1")
            return virtualRoleForChar(c) === val
        }

        return matchesVal(xAxisKey.value, xVal) && matchesVal(yAxisKey.value, yVal)
    })

const maxCharsPerRarityPerRow = computed(() => {
    const result: Record<string, Record<number, number>> = {}
    for (const yVal of visibleYValues.value) {
        result[yVal] = { 3: 0, 4: 0, 5: 0 }
        for (const xVal of visibleXValues.value) {
            for (const r of [3, 4, 5]) {
                const count = getChars(xVal, yVal, r).length
                if (count > result[yVal][r]) result[yVal][r] = count
            }
        }
    }
    return result
})

const bandRows = (xVal: string, yVal: string, rarity: number): number => {
    const maxInRow = maxCharsPerRarityPerRow.value[yVal]?.[rarity] ?? 0
    return Math.max(1, Math.ceil(maxInRow / 2))
}

const borderClass = (ch: Character): string => {
    if (ch.name === "Lux☆Magica") return "default-border"
    if (ch.obtain && ch.obtain !== "Permanent") return "limited-border"
    if (new Date() > new Date(ch.permaDate)) return "default-border"
    return "not-limited-border"
}

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.name === "Lux☆Magica") { }
    else if (ch.obtain && ch.obtain !== "Permanent") {
        title += ` -  ${ch.obtain}`
    } else if (ch.permaDate == "") {
        title += " -  Not added to permanent yet"
    } else if (new Date(ch.permaDate) > new Date()) {
        title += " -  Added to standard pool on " + new Date(ch.permaDate).toLocaleDateString()
    }
    return title
}

const isMaxSpecialLvl = (ch: Character): boolean => {
    if (ch.ascension === 5) return ch.specialLvl === 10
    if (ch.ascension >= 3) return ch.specialLvl === 7
    return ch.specialLvl === 4
}

const downloadImg = async (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "ascension.png"
    link.click()
    URL.revokeObjectURL(url)
}

const copyAscensionList = async () => {
    const el = document.querySelector(".er-grid") as HTMLElement
    if (!el) return

    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#242424" })

    const blob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
    )
    if (!blob) return

    try {
        const perm = await navigator.permissions?.query({
            name: "clipboard-write" as PermissionName
        })
    } catch { }

    try {
        const item = new ClipboardItem({ "image/png": blob })
        await navigator.clipboard.write([item])

        toast.success("Copied to clipboard!", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    } catch (err) {
        console.error("Clipboard failed:", err)

        await downloadImg(blob)

        toast.info("Clipboard blocked — saved as file instead", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    }
}

const downloadAscensionList = async () => {
    const el = document.querySelector(".ascension-table") as HTMLElement
    if (!el) return

    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#242424" })

    canvas.toBlob((blob) => {
        if (!blob) return

        downloadImg(blob)

    }, "image/png")
}
</script>

<style scoped>
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
    margin-left: 0.3rem;
    background: #2a2a2a;
    color: #eee;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0.15rem 0.3rem;
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
    color: #fff;
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
    color: #eee;
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
    color: #fff;
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
    background: #2a2a2a;
    border: 1px solid #555;
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
    background: #383838;
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

.grid-scroll {
    overflow-x: auto;
}

.er-grid {
    border-collapse: collapse;
    min-width: max-content;
    margin: 0 auto;
}

.corner-cell,
.header-cell {
    background: #2c2c2c;
    padding: 0.4rem 0.5rem;
    border: 1px solid #444;
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
    color: #fff;
    font-size: 0.6rem;
    text-align: center;
    backdrop-filter: blur(2px);
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
    padding: 0.4rem 0.8rem;
    background: #444;
    color: #eee;
    border: 1px solid #666;
    border-radius: 6px;
    cursor: pointer;
}
</style>