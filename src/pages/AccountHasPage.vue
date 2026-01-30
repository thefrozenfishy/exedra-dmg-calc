<template>
    <div class="ascension-list">
        <button class="copy-btn" @click="copyAscensionList">Copy to clipboard</button>
        <button class="copy-btn" @click="downloadAscensionList">Download</button>
        <div>
            <label> <input type="checkbox" v-model="show4stars" /> Include 4-stars </label>
            <label> <input type="checkbox" v-model="showLevels" /> Show Magic and Special levels </label>
            <label> <input type="checkbox" v-model="showHearts" /> Show Heartphial levels </label>
            <label> <input type="checkbox" v-model="showDupes" /> Show Dupes </label>
            <label> <input type="checkbox" :disabled="!(showLevels || showHearts)" v-model="colourLevels" /> Colour max
                levels </label>
        </div>
        <table class="ascension-table">
            <tbody>
                <tr :data-index="index" :class="{ 'drag-over': dragOver === index }"
                    @dragover.prevent="dragOver = index" @dragleave="dragLeave" @drop="onDrop(index)"
                    v-for="(chars, index) in groupedByAscension" :key="index" class="asc-row">

                    <td class="asc-cell">{{ index === 6 ? "Not Owned" : index === 7 ? "4 Stars" : `A${5 - index}` }}
                    </td>

                    <td class="characters-cell">
                        <div v-for="ch in chars" :key="ch.id" class="character-card" draggable="true"
                            @dragstart="onDragStart(ch)" @touchstart="onTouchStart(ch, $event)" @touchmove="onTouchMove"
                            @touchend="onTouchEnd">
                            <div class="character-img-wrapper">
                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                    <img class="character-img" :class="borderClass(ch)"
                                        :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name"
                                        :title="makeTitle(ch)" />
                                </a>
                                <div class="dupe-badge level-badge editable" v-if="showDupes && index === 0"
                                    @click.stop="startEdit(ch, 'dupes', $event)">
                                    <template v-if="isEditing(ch, 'dupes')">
                                        <input type="number" v-model.number="editValue" @blur="commitEdit(ch, 'dupes')"
                                            @keydown.enter.prevent="commitEdit(ch, 'dupes')" />
                                    </template>
                                    <template v-else>
                                        + {{ ch.dupes }}
                                    </template>
                                </div>
                                <div class="heart-level-badge level-badge editable" v-if="showHearts && index !== 6"
                                    :class="colourLevels
                                        ? ch.heartphialLvl === KiokuConstants.maxHeartphialLvl ? 'maxLvl' : 'notMaxLvl'
                                        : ''" @click.stop="startEdit(ch, 'heartphialLvl', $event)">
                                    <template v-if="isEditing(ch, 'heartphialLvl')">
                                        <input type="number" v-model.number="editValue" :min="1"
                                            :max="KiokuConstants.maxHeartphialLvl"
                                            @blur="commitEdit(ch, 'heartphialLvl')"
                                            @keydown.enter.prevent="commitEdit(ch, 'heartphialLvl')" />
                                    </template>
                                    <template v-else>
                                        {{ ch.heartphialLvl }}
                                    </template>
                                </div>

                                <div class="magic-level-badge level-badge editable" v-if="showLevels && index !== 6"
                                    :class="colourLevels
                                        ? ch.magicLvl === KiokuConstants.maxMagicLvl ? 'maxLvl' : 'notMaxLvl'
                                        : ''" @click.stop="startEdit(ch, 'magicLvl', $event)">
                                    <template v-if="isEditing(ch, 'magicLvl')">
                                        <input type="number" v-model.number="editValue" :min="0"
                                            :max="KiokuConstants.maxMagicLvl" @blur="commitEdit(ch, 'magicLvl')"
                                            @keydown.enter.prevent="commitEdit(ch, 'magicLvl')" />
                                    </template>
                                    <template v-else>
                                        {{ ch.magicLvl }}
                                    </template>
                                </div>

                                <div class="special-level-badge level-badge editable" v-if="showLevels && index !== 6"
                                    :class="colourLevels
                                        ? isMaxSpecialLvl(ch) ? 'maxLvl' : 'notMaxLvl'
                                        : ''" @click.stop="startEdit(ch, 'specialLvl', $event)">
                                    <template v-if="isEditing(ch, 'specialLvl')">
                                        <input type="number" v-model.number="editValue" :min="1"
                                            :max="KiokuConstants.maxSpecialLvl" @blur="commitEdit(ch, 'specialLvl')"
                                            @keydown.enter.prevent="commitEdit(ch, 'specialLvl')" />
                                    </template>
                                    <template v-else>
                                        {{ ch.specialLvl }}
                                    </template>
                                </div>

                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="extra-input" v-if="!showDupes">
            +500s collected:
            <input type="number" v-model.number="extraCollected" />
        </div>
        <div class="total-ascensions">
            <div>
                Total SSRs collected: {{ totalAscensions + extraTotal }}
            </div>
            <div>
                Standard roster collected: {{ totalStandards }} / {{ totalPossibleStandards }} ({{ round(totalStandards
                    / totalPossibleStandards * 100) }}%)
            </div>
            <div>
                ({{ round(extraTotal / (totalStandards + extraTotal) * 100) }}% of your collected standard SSRs
                have been +500s)
            </div>
            <div>
                Limited roster collected: {{ totalLimiteds }} / {{ totalPossibleLimiteds }} ({{ round(totalLimiteds /
                    totalPossibleLimiteds * 100) }}%)
            </div>
            <div>
                Probability of hitting non A5 on standard pull:
                {{ standardPool.length - ownedA5StandardPool.length }} / {{ standardPool.length }} |
                {{ round((standardPool.length - ownedA5StandardPool.length) / standardPool.length * 100) }}%
            </div>
        </div>
        <h4 style="margin-bottom: 0;">Maxed Heartphial-, Magic-, Kioku- & Special level kioku:</h4>
        <div>
            5-stars: {{ maxed5starChars.length }} / {{ ownedFiveStars.length }}
            ({{ round(maxed5starChars.length / ownedFiveStars.length * 100) }}%)
        </div>
        <div v-if="show4stars">
            4-stars: {{ maxed4starChars.length }} / {{ allMembers.length - fiveStarMembers.length }}
            ({{ round(maxed4starChars.length / (allMembers.length - fiveStarMembers.length) * 100) }}%)
        </div>
        <div>
            <h4 style="margin-bottom: 0;">About:</h4>
            You can edit, export, and import your kioku on the Team Setup page, or edit here directly.<br />
            Red borders indicate limited characters, blue borders indicate characters not yet added to the permanent
            roster,
            and transparent borders indicate standard permanent characters.
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character, KiokuConstants } from "../types/KiokuTypes"
import html2canvas from "html2canvas"
import { toast } from "vue3-toastify"
import { useSetting } from "../store/settingsStore"
import { nextTick } from "vue"

const store = useCharacterStore()
const allMembers = computed(() => store.characters.filter(c => (show4stars.value ? (c.rarity !== 3 || ["Kako's Kioku", "Meiyui's Kioku", "Natsuki's Kioku", "Konoha's Kioku", ].includes(c.name)) : c.rarity === 5 && c.name !== "Lux☆Magica")))
const fiveStarMembers = computed(() => store.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica"))
const ownedFiveStars = computed(() => fiveStarMembers.value.filter(c => c.enabled))
const totalAscensions = computed(() => ownedFiveStars.value.reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalStandards = computed(() => ownedFiveStars.value.filter(ch => ch.obtain === "").reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalPossibleStandards = computed(() => fiveStarMembers.value.filter(ch => ch.obtain === "").reduce((sum, _) => sum + 6, 0))
const totalLimiteds = computed(() => ownedFiveStars.value.filter(ch => ch.obtain !== "").reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalPossibleLimiteds = computed(() => fiveStarMembers.value.filter(ch => ch.obtain !== "").reduce((sum, _) => sum + 6, 0))
const standardPool = computed(() => fiveStarMembers.value.filter(ch => new Date() > new Date(ch.permaDate)))
const ownedA5StandardPool = computed(() => standardPool.value.filter(ch => ch.enabled && ch.ascension === 5))
const maxed5starChars = computed(() => allMembers.value.filter(ch => ch.enabled && isMaxLevels(ch)).filter(ch => fiveStarMembers.value.includes(ch)))
const maxed4starChars = computed(() => allMembers.value.filter(isMaxLevels).filter(ch => !fiveStarMembers.value.includes(ch)))
const extraCollected = useSetting("extraCollected", 0)
const extraTotal = computed(() => (showDupes.value ? ownedFiveStars.value.reduce((sum, ch) => sum + ch.dupes, 0) : extraCollected.value))
const showLevels = useSetting("showLevels", true);
const showHearts = useSetting("showHearts", false);
const showDupes = useSetting("showDupes", false);
const colourLevels = useSetting("colourLevels", true);
const show4stars = useSetting("show4stars", false);

const round = (nr: number) => nr.toFixed(2)

const isMaxSpecialLvl = (ch: Character): boolean => {
    if (ch.ascension === 5) return ch.specialLvl === 10
    if (ch.ascension >= 3) return ch.specialLvl === 7
    return ch.specialLvl === 4
}

const isMaxLevels = (ch: Character): boolean => ch.magicLvl === KiokuConstants.maxMagicLvl &&
    ch.heartphialLvl === KiokuConstants.maxHeartphialLvl &&
    isMaxSpecialLvl(ch) && ch.kiokuLvl === KiokuConstants.maxKiokuLvl


const groupedByAscension = computed(() => {
    const groups: Character[][] = [[], [], [], [], [], [], [], []]

    for (const ch of allMembers.value) {
        const asc = ch.ascension
        const index = 5 - asc
        if (ch.rarity === 3 ||ch.rarity === 4 || ch.name === "Lux☆Magica") {
            groups[7].push(ch)
        } else if (ch.enabled) {
            groups[index].push(ch)
        } else {
            groups[6].push(ch)
        }
    }
    for (let i = 0; i < groups.length; i++) {
        if (i === 6) {
            groups[i].sort((a, b) => a.id - b.id)
            continue
        } else {
            groups[i].sort((a, b) => b.id - a.id)
        }
    }
    if (!show4stars.value) {
        groups.splice(7, 1)
    }

    return groups
})

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.name === "Lux☆Magica") { }
    else if (ch.obtain && ch.obtain !== "") {
        title += " -  Limited"
    } else if (ch.permaDate == "") {
        title += " -  Not added to permanent yet"
    }
    return title
}

const borderClass = (ch: Character): string => {
    if (ch.name === "Lux☆Magica") return "default-border"
    if (ch.obtain && ch.obtain !== "") return "limited-border"
    if (new Date() > new Date(ch.permaDate)) return "default-border"
    return "not-limited-border"

}

type EditableField = "magicLvl" | "heartphialLvl" | "specialLvl" | "dupes"

const editing = ref<{ id: number; field: EditableField } | null>(null)
const editValue = ref<number>(0)

const startEdit = async (ch: Character, field: EditableField, e: MouseEvent) => {
    editing.value = { id: ch.id, field }
    editValue.value = ch[field]

    await nextTick()

    const input = (e.currentTarget as HTMLElement).querySelector("input")
    input?.focus()
    input?.select()
}


const isEditing = (ch: Character, field: EditableField) =>
    editing.value?.id === ch.id && editing.value.field === field

const commitEdit = (ch: Character, field: EditableField) => {
    let max =
        field === "magicLvl"
            ? KiokuConstants.maxMagicLvl
            : field === "heartphialLvl"
                ? KiokuConstants.maxHeartphialLvl
                : KiokuConstants.maxSpecialLvl

    const value = Math.max(0, Math.min(editValue.value, max))

    store.updateChar({
        ...ch,
        [field]: value,
    })

    editing.value = null
}

const draggedChar = ref<Character | null>(null)
const dragOver = ref<number | null>(null)

const onDragStart = (ch: Character) => {
    draggedChar.value = ch
}

const onDrop = (targetIndex: number) => {

    if (!draggedChar.value) return

    const ch = draggedChar.value

    if (targetIndex === 6) {
        ch.enabled = false
    } else {
        ch.enabled = true
        ch.ascension = 5 - targetIndex
    }

    store.updateChar({ ...ch })
    draggedChar.value = null
}

const dragLeave = (e: DragEvent) => {
    if (!e.currentTarget || !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
        dragOver.value = null
    }
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
    const el = document.querySelector(".ascension-table") as HTMLElement
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
// --- MOBILE DRAG AND DROP ---
const touchDragged = ref<Character | null>(null)

const onTouchStart = (ch: Character, e: TouchEvent) => {
    touchDragged.value = ch
    draggedChar.value = ch

    e.preventDefault()
}

const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const row = element?.closest("tr.asc-row")

    if (!row) {
        dragOver.value = null
        return
    }

    const idx = Number(row.getAttribute("data-index"))
    dragOver.value = idx
}

const onTouchEnd = () => {
    if (dragOver.value != null) {
        onDrop(dragOver.value)
    }
    dragOver.value = null
    touchDragged.value = null
    draggedChar.value = null
}
</script>

<style scoped>
.ascension-list {
    max-width: 900px;
    margin: 0 auto;
    color: #ddd;
}

.ascension-table {
    width: 100%;
    border-collapse: collapse;
}

td {
    border: 1px solid #444;
    padding: 0.5rem;
    vertical-align: top;
}

.asc-cell {
    width: 85px;
    font-weight: bold;
    background-color: #333;
    font-size: 1.2rem;
    color: #eee;
    vertical-align: middle;
    box-sizing: border-box;
}

.characters-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 60px;
}

.character-img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid #666;
    display: block;
    transition: transform 0.15s ease;
}

.character-img:hover {
    transform: scale(1.08);
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

.asc-row.drag-over {
    background-color: rgba(255, 255, 255, 0.1);
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

.copy-btn:hover {
    background: #555;
}

.total-ascensions {
    margin-top: 1rem;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: #eee;
}

.extra-input {
    margin-top: 1rem;
    text-align: center;
    color: #eee;
    font-size: 1rem;
}

.extra-input input {
    margin-left: 0.5rem;
    padding: 0.2rem 0.4rem;
    width: 80px;
    background: #333;
    border: 1px solid #666;
    border-radius: 4px;
    color: #eee;
}

.character-img-wrapper {
    position: relative;
    display: inline-block;
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

.special-level-badge {
    left: 80%;
    bottom: 0;
}

.heart-level-badge {
    left: 20%;
    top: 0;
}

.dupe-badge {
    left: 80%;
    top: 0;
}

.magic-level-badge {
    left: 20%;
    bottom: 0;
}

.maxLvl {
    color: palegreen;
}

.notMaxLvl {
    color: pink;
}

.level-badge.editable {
    cursor: pointer;
}

.level-badge input {
    width: 32px;
    background: #111;
    color: #fff;
    border: 1px solid #666;
    border-radius: 6px;
    font-size: 0.6rem;
    text-align: center;
    padding: 1px;
}
</style>
