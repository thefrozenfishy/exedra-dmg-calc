<template>
    <div class="ascension-list">
        <button class="copy-btn" @click="copyAscensionList">Copy to clipboard</button>
        <button class="copy-btn" @click="downloadAscensionList">Download</button>

        <table class="ascension-table">
            <tbody>
                <tr :data-index="index" :class="{ 'drag-over': dragOver === index }"
                    @dragover.prevent="dragOver = index" @dragleave="dragLeave" @drop="onDrop(index)"
                    v-for="(chars, index) in groupedByAscension" :key="index" class="asc-row">

                    <td class="asc-cell">{{ index === 6 ? "Not Owned" : `A${5 - index}` }}</td>

                    <td class="characters-cell">
                        <div v-for="ch in chars" :key="ch.id" class="character-card" draggable="true"
                            @dragstart="onDragStart(ch)" @touchstart="onTouchStart(ch, $event)" @touchmove="onTouchMove"
                            @touchend="onTouchEnd">
                            <div class="character-img-wrapper">
                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                    <img class="character-img" :class="ch.obtain !== ''
                                        ? 'limited-border'
                                        : new Date() > new Date(ch.permaDate)
                                            ? 'default-border'
                                            : 'not-limited-border'"
                                        :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name"
                                        :title="makeTitle(ch)" />
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="extra-input">
            +500s collected:
            <input type="number" v-model.number="extraCollected" />
        </div>
        <div class="total-ascensions">
            <div>
                Total SSRs collected: {{ totalAscensions + extraCollected }}
            </div>
            <div>
                Total limiteds collected: {{ totalLimiteds }}
            </div>
            <div>
                Probability of hitting non A5 on standard pull:
                {{ standardPool.length - ownedA5StandardPool.length }} / {{ standardPool.length }} |
                {{ round((standardPool.length - ownedA5StandardPool.length) / standardPool.length * 100) }}%
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character } from "../types/KiokuTypes"
import html2canvas from "html2canvas"
import { toast } from "vue3-toastify"
import { useSetting } from "../store/settingsStore"

const store = useCharacterStore()
const members = computed(() => store.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica"))
const totalAscensions = computed(() => members.value.filter(ch => ch.enabled).reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalLimiteds = computed(() => members.value.filter(ch => ch.enabled).filter(ch => ch.obtain !== "").reduce((sum, ch) => sum + ch.ascension + 1, 0))
const standardPool = computed(() => members.value.filter(ch => new Date() > new Date(ch.permaDate)))
const ownedA5StandardPool = computed(() => standardPool.value.filter(ch => ch.enabled && ch.ascension === 5))
const extraCollected = useSetting("extraCollected", 0)

const round = (nr: number) => nr.toFixed(2)

const groupedByAscension = computed(() => {
    const groups: Character[][] = [[], [], [], [], [], [], []]

    for (const ch of members.value) {
        const asc = ch.ascension
        const index = 5 - asc
        if (ch.enabled) {
            if (index >= 0 && index < 6) {
                groups[index].push(ch)
            }
        } else {
            groups[6].push(ch)
        }
    }
    for (const group of groups) {
        group.sort((a, b) => a.id - b.id)
    }

    return groups
})

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.obtain && ch.obtain !== "") {
        title += " -  Limited"
    } else if (ch.permaDate == "") {
        title += " -  Not added to permanent yet"
    }
    return title
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
    border: 2px solid blue;
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
</style>
