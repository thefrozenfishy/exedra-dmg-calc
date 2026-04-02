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
                <label> <input type="checkbox" v-model="showOwnedOnly" /> Show Owned Only </label>
            </div>
            <div class="options-row">
                <label> <input type="checkbox" v-model="showLevels" /> Show Magic & Special levels </label>
                <label> <input type="checkbox" v-model="showHearts" /> Show Heartphial levels </label>
                <label> <input type="checkbox" v-model="colourLevels" :disabled="!(showLevels || showHearts)" /> Colour
                    max levels </label>
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
                <button v-for="role in allRoleValues" :key="role" class="chip"
                    :class="hiddenRoles.includes(role) ? 'chip--hidden' : 'chip--visible'"
                    @click="toggleRole(role as KiokuRole)"
                    :title="hiddenRoles.includes(role) ? `Show ${role}` : `Hide ${role}`">
                    <img :src="`/exedra-dmg-calc/roles/${role}.png`" :alt="role" />
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
                            <img v-else-if="xAxisKey === 'role'" :src="`/exedra-dmg-calc/roles/${xVal}.png`" :alt="xVal"
                                :title="`Hide ${xVal}`" class="header-icon header-icon-btn"
                                @click="toggleRole(xVal as KiokuRole)" />
                            <span v-else class="ascension-header-label">A{{ xVal }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="yVal in visibleYValues" :key="yVal">
                        <td class="header-cell role-header">
                            <img v-if="yAxisKey === 'element'" :src="`/exedra-dmg-calc/elements/${yVal}.png`"
                                :alt="yVal" :title="`Hide ${yVal}`" class="header-icon header-icon-btn"
                                @click="toggleElement(yVal as KiokuElement)" />
                            <img v-else-if="yAxisKey === 'role'" :src="`/exedra-dmg-calc/roles/${yVal}.png`" :alt="yVal"
                                :title="`Hide ${yVal}`" class="header-icon header-icon-btn"
                                @click="toggleRole(yVal as KiokuRole)" />
                            <span v-else class="ascension-header-label">A{{ yVal }}</span>
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
                                                A{{ ch.ascension }}
                                            </div>
                                            <div class="ascension-badge level-badge info-badge-img"
                                                v-else-if="infoAxisKey === 'element'">
                                                <img :src="`/exedra-dmg-calc/elements/${ch.element}.png`"
                                                    :alt="ch.element" class="info-badge-icon" />
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
const showOwnedOnly = useSetting("showGridOnlyOwned", true)
const showLevels = useSetting("showLevels", true)
const showHearts = useSetting("showHearts", false)
const colourLevels = useSetting("colourLevels", true)

const hiddenElements = useSetting<KiokuElement[]>("hiddenGridElements", [])
const hiddenRoles = useSetting<KiokuRole[]>("hiddenGridRoles", [])

const toggleElement = (el: KiokuElement) => {
    hiddenElements.value = hiddenElements.value.includes(el)
        ? hiddenElements.value.filter(e => e !== el)
        : [...hiddenElements.value, el]
}

const toggleRole = (role: KiokuRole) => {
    hiddenRoles.value = hiddenRoles.value.includes(role)
        ? hiddenRoles.value.filter(r => r !== role)
        : [...hiddenRoles.value, role]
}

const allChars = computed(() =>
    (showOwnedOnly.value ? store.characters.filter(c => c.enabled) : store.characters)
        .map(c => ({ ...c, rarity: c.name === "Lux☆Magica" ? 4 : c.rarity }))
        .filter(c => !hiddenElements.value.includes(c.element as KiokuElement))
        .filter(c => !hiddenRoles.value.includes(c.role as KiokuRole))
)

const allElementValues = computed(() => Object.values(KiokuElement))
const displayedElements = computed(() => allElementValues.value.filter(el => !hiddenElements.value.includes(el)))

const allRoleValues = computed(() => Object.values(KiokuRole).sort((a, b) => {
    if (a === KiokuRole.Defender) return 1
    if (b === KiokuRole.Defender) return -1
    if (a === KiokuRole.Healer) return 1
    if (b === KiokuRole.Healer) return -1
    return 0
}))
const displayedRoles = computed(() => allRoleValues.value.filter(role => !hiddenRoles.value.includes(role)))

const valuesFor = (key: AxisKey): string[] => {
    if (key === "element") return displayedElements.value as string[]
    if (key === "role") return displayedRoles.value as string[]
    return ["5", "4", "3", "2", "1", "0"]
}

const visibleXValues = computed(() => valuesFor(xAxisKey.value))
const visibleYValues = computed(() => valuesFor(yAxisKey.value))


const getChars = (xVal: string, yVal: string, rarity: number): Character[] =>
    allChars.value.filter(c => {
        if (c.rarity !== rarity) return false
        const xMatch =
            xAxisKey.value === "element" ? c.element === xVal :
                xAxisKey.value === "role" ? c.role === xVal :
                    String(c.ascension) === xVal
        const yMatch =
            yAxisKey.value === "element" ? c.element === yVal :
                yAxisKey.value === "role" ? c.role === yVal :
                    String(c.ascension) === yVal
        return xMatch && yMatch
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
    width: 30px;
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
    left: 20%;
    top: 0;
}

.magic-level-badge {
    left: 20%;
    bottom: 0;
}

.special-level-badge {
    left: 80%;
    bottom: 0;
}

.ascension-badge {
    left: 80%;
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