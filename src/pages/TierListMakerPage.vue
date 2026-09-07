<template>
    <div class="setup-page tier-maker-page">
        <h1 class="page-title">Tier List Maker</h1>

        <section class="toolbar card" v-if="currentList">
            <div class="toolbar-left">
                <ImageActionsToolbar target=".tier-maker-board" filename="tier-list.png" :export-options="exportOpts"
                    :share-options="shareOptionsForTierList" />
            </div>
        </section>

        <section class="card list-manager">
            <span class="filters-heading">Your lists</span>
            <button v-for="l in listOptions" :key="l.id" class="chip list-chip"
                :class="{ active: l.id === activeListId }" @click="activeListId = l.id">
                {{ l.name || 'Untitled list' }}
            </button>
            <button class="icon-btn icon-btn--accent" title="Create a new list" aria-label="Create a new list"
                @click="createList">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </section>

        <section v-if="currentList" class="card current-list-controls">
            <label class="field grow-field">
                <span class="field-label">List name</span>
                <input class="list-name-input" :value="currentList.name" placeholder="My Tier List"
                    @change="updateListName(($event.target as HTMLInputElement).value)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()" />
            </label>
            <button class="icon-btn" title="Duplicate this list" aria-label="Duplicate this list"
                @click="duplicateList">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            </button>
            <button class="icon-btn" :class="{ 'icon-btn--danger': confirmingDelete }" :title="confirmingDelete ? 'Click again to confirm deletion' : 'Delete this list'"
                :aria-label="confirmingDelete ? 'Click again to confirm deletion' : 'Delete this list'"
                @click="handleDeleteClick">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                <span v-if="confirmingDelete" class="delete-confirm-label">Confirm?</span>
            </button>
        </section>

        <template v-if="currentList">
            <section class="card tier-maker-board">
                <div class="tier-row" v-for="(row, rIdx) in currentList.rows" :key="row.id">
                    <div class="tier-row-header" :style="{ '--row-color': row.color }">
                        <label class="row-color-swatch" :style="{ background: row.color }" title="Row colour">
                            <input type="color" :value="row.color"
                                @change="updateRowColor(row.id, ($event.target as HTMLInputElement).value)" />
                        </label>
                        <input type="text" class="row-label-input" :value="row.label" placeholder="Tier name"
                            @change="updateRowLabel(row.id, ($event.target as HTMLInputElement).value)"
                            @keydown.enter="($event.target as HTMLInputElement).blur()" />
                        <span class="row-count">{{ (currentList.placements[row.id] || []).length }}</span>
                        <div class="row-controls">
                            <button class="row-ctrl-btn" title="Move tier up" aria-label="Move tier up"
                                :disabled="rIdx === 0" @click="moveRow(row.id, -1)">↑</button>
                            <button class="row-ctrl-btn" title="Move tier down" aria-label="Move tier down"
                                :disabled="rIdx === currentList.rows.length - 1"
                                @click="moveRow(row.id, 1)">↓</button>
                            <button class="row-ctrl-btn row-ctrl-btn--danger" title="Remove tier"
                                aria-label="Remove tier" @click="removeRow(row.id)">×</button>
                        </div>
                    </div>
                    <div class="tier-row-dropzone" :data-drop-zone="row.id"
                        :class="{ 'drag-over': dragOverZone === row.id }" @dragover.prevent="onZoneDragOver(row.id, $event)"
                        @dragleave="onZoneDragLeave($event)" @drop.prevent="onZoneDrop(row.id)">
                        <template v-for="(charId, i) in (currentList.placements[row.id] || [])" :key="charId">
                            <span class="insertion-marker" v-if="dragOverZone === row.id && dragOverIndex === i"></span>
                            <div class="tier-chip" :data-char-id="charId"
                                :class="{ dragging: draggedCharId === charId }" draggable="true"
                                @dragstart="onChipDragStart(charId, row.id, $event)" @dragend="resetDragState"
                                @touchstart="onChipTouchStart(charId, row.id, $event)"
                                @touchmove="onChipTouchMove($event)" @touchend="onChipTouchEnd($event)">
                                <img class="chip-img" :src="`/exedra-dmg-calc/kioku_images/${charId}_thumbnail.png`"
                                    :alt="charById.get(charId)?.name" :title="charById.get(charId)?.name" />
                                <button class="chip-remove" title="Send back to pool" aria-label="Send back to pool"
                                    @click.stop="removeFromRow(charId)">×</button>
                            </div>
                        </template>
                        <span class="insertion-marker"
                            v-if="dragOverZone === row.id && dragOverIndex === (currentList.placements[row.id] || []).length"></span>
                        <span v-if="!(currentList.placements[row.id] || []).length" class="row-empty-hint">Drag
                            characters here</span>
                    </div>
                </div>

                <button class="add-row-btn" @click="addRow">+ Add tier</button>
            </section>

            <section class="filters card">
                <span class="filters-heading">Pool</span>
                <div class="selector pool-search">
                    <input type="text" v-model="poolSearch" placeholder="Search characters…" />
                    <button v-if="poolSearch" class="clear-btn" title="Clear search" @click="poolSearch = ''">×</button>
                </div>
                <label class="chip" :class="{ active: poolShow5 }">
                    <input type="checkbox" v-model="poolShow5" /> ★★★★★
                </label>
                <label class="chip" :class="{ active: poolShow4 }">
                    <input type="checkbox" v-model="poolShow4" /> ★★★★
                </label>
                <label class="chip" :class="{ active: poolShow3 }">
                    <input type="checkbox" v-model="poolShow3" /> ★★★
                </label>
                <label class="chip" :class="{ active: poolShowStandards }">
                    <input type="checkbox" v-model="poolShowStandards" /> Standards
                </label>
                <label class="chip" :class="{ active: poolShowLimiteds }">
                    <input type="checkbox" v-model="poolShowLimiteds" /> Limiteds
                </label>
            </section>

            <section class="card element-filter-row">
                <button v-for="el in allElementValues" :key="el" class="chip element-chip"
                    :class="hiddenElements.includes(el) ? 'chip--hidden' : 'chip--visible'"
                    :title="hiddenElements.includes(el) ? `Show ${el}` : `Hide ${el}`" @click="toggleElement(el)">
                    <img :src="`/exedra-dmg-calc/elements/${el}.png`" :alt="el" />
                </button>
            </section>

            <section class="card pool-section" data-drop-zone="pool" :class="{ 'drag-over': dragOverZone === 'pool' }"
                @dragover.prevent="onZoneDragOver(null, $event)" @dragleave="onZoneDragLeave($event)"
                @drop.prevent="onZoneDrop(null)">
                <span class="filters-heading">Unranked ({{ filteredPool.length }})</span>
                <div class="pool-chips">
                    <div v-for="ch in filteredPool" :key="ch.id" class="tier-chip pool-chip" :data-char-id="ch.id"
                        :class="{ dragging: draggedCharId === ch.id }" draggable="true"
                        @dragstart="onChipDragStart(ch.id, null, $event)" @dragend="resetDragState"
                        @touchstart="onChipTouchStart(ch.id, null, $event)" @touchmove="onChipTouchMove($event)"
                        @touchend="onChipTouchEnd($event)">
                        <img class="chip-img" :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`"
                            :alt="ch.name" :title="ch.name" />
                    </div>
                    <p v-if="!filteredPool.length" class="pool-empty-hint">No characters match your filters.</p>
                </div>
            </section>

            <section class="card about-card">
                <span class="filters-heading">About</span>
                <p>
                    Drag characters from the pool into a tier, and drag between or within tiers to reorder them —
                    where you drop a character is exactly where it lands. Tap the × on a character to send it back
                    to the pool. Tap a tier's colour circle to change it, or edit its name directly. This is a
                    freeform list for your own opinions — it isn't tied to your account data. Everything is saved
                    to this browser, and you can keep as many lists as you like using the switcher above.
                </p>
            </section>
        </template>

        <section v-else class="card empty-state">
            <p>You don't have any tier lists yet.</p>
            <button class="copy-btn" @click="createList">+ Create your first tier list</button>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from "vue"
import { toast } from "vue3-toastify"
import { useCharacterStore } from "../store/characterStore"
import { useSetting } from "../store/settingsStore"
import { Character } from "../types/KiokuTypes"
import { KiokuElement } from "../types/enums"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"

interface TierRow {
    id: string
    label: string
    color: string
}

interface SavedTierList {
    id: string
    name: string
    rows: TierRow[]
    placements: Record<string, number[]>
    createdAt: number
    updatedAt: number
}

const store = useCharacterStore()

const charById = computed(() => new Map(store.characters.map(c => [c.id, c] as const)))

// ── Persisted lists ──
const tierLists = useSetting<Record<string, SavedTierList>>("tierMakerLists", {})
const activeListId = useSetting<string>("tierMakerActiveListId", "")

const listOptions = computed(() =>
    Object.values(tierLists.value).sort((a, b) => a.createdAt - b.createdAt)
)

const currentList = computed<SavedTierList | null>(() =>
    activeListId.value ? tierLists.value[activeListId.value] ?? null : null
)

onMounted(() => {
    if (!currentList.value && listOptions.value.length) {
        activeListId.value = listOptions.value[0].id
    }
})

function saveList(list: SavedTierList) {
    tierLists.value = { ...tierLists.value, [list.id]: { ...list, updatedAt: Date.now() } }
}

const defaultTierPalette: { label: string; color: string }[] = [
    { label: "S", color: "#ff6b6b" },
    { label: "A", color: "#ffa94d" },
    { label: "B", color: "#ffd43b" },
    { label: "C", color: "#94d82d" },
    { label: "D", color: "#4dabf7" },
    { label: "F", color: "#9775fa" },
]
const extraRowColors = ["#ff8787", "#ffa94d", "#ffd43b", "#94d82d", "#63e6be", "#4dabf7", "#748ffc", "#9775fa", "#f783ac"]

function createDefaultRows(): TierRow[] {
    return defaultTierPalette.map(p => ({ id: crypto.randomUUID(), label: p.label, color: p.color }))
}

function createList() {
    const rows = createDefaultRows()
    const list: SavedTierList = {
        id: crypto.randomUUID(),
        name: `Tier List ${listOptions.value.length + 1}`,
        rows,
        placements: Object.fromEntries(rows.map(r => [r.id, []])),
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
    tierLists.value = { ...tierLists.value, [list.id]: list }
    activeListId.value = list.id
    toast.success("New list created!", { position: toast.POSITION.TOP_RIGHT, icon: false })
}

function duplicateList() {
    if (!currentList.value) return
    const src = currentList.value
    const copy: SavedTierList = {
        id: crypto.randomUUID(),
        name: `${src.name} (copy)`,
        rows: src.rows.map(r => ({ ...r })),
        placements: Object.fromEntries(Object.entries(src.placements).map(([k, v]) => [k, [...v]])),
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
    tierLists.value = { ...tierLists.value, [copy.id]: copy }
    activeListId.value = copy.id
    toast.success("List duplicated!", { position: toast.POSITION.TOP_RIGHT, icon: false })
}

const confirmingDelete = ref(false)
let confirmDeleteTimeout: ReturnType<typeof setTimeout> | null = null

function handleDeleteClick() {
    if (!currentList.value) return
    if (!confirmingDelete.value) {
        confirmingDelete.value = true
        confirmDeleteTimeout = setTimeout(() => { confirmingDelete.value = false }, 4000)
        return
    }
    if (confirmDeleteTimeout) clearTimeout(confirmDeleteTimeout)
    confirmingDelete.value = false

    const { [currentList.value.id]: _removed, ...rest } = tierLists.value
    tierLists.value = rest
    activeListId.value = Object.values(rest).sort((a, b) => a.createdAt - b.createdAt)[0]?.id ?? ""
    toast.success("List deleted", { position: toast.POSITION.TOP_RIGHT, icon: false })
}

function updateListName(name: string) {
    if (!currentList.value) return
    saveList({ ...currentList.value, name })
}

// ── Row CRUD ──
function addRow() {
    if (!currentList.value) return
    const list = currentList.value
    const newRow: TierRow = {
        id: crypto.randomUUID(),
        label: "New Tier",
        color: extraRowColors[list.rows.length % extraRowColors.length],
    }
    saveList({
        ...list,
        rows: [...list.rows, newRow],
        placements: { ...list.placements, [newRow.id]: [] },
    })
}

function removeRow(rowId: string) {
    if (!currentList.value) return
    const list = currentList.value
    const { [rowId]: _removed, ...restPlacements } = list.placements
    saveList({
        ...list,
        rows: list.rows.filter(r => r.id !== rowId),
        placements: restPlacements,
    })
}

function moveRow(rowId: string, dir: -1 | 1) {
    if (!currentList.value) return
    const rows = [...currentList.value.rows]
    const idx = rows.findIndex(r => r.id === rowId)
    const newIdx = idx + dir
    if (idx === -1 || newIdx < 0 || newIdx >= rows.length) return
    ;[rows[idx], rows[newIdx]] = [rows[newIdx], rows[idx]]
    saveList({ ...currentList.value, rows })
}

function updateRowLabel(rowId: string, label: string) {
    if (!currentList.value) return
    saveList({ ...currentList.value, rows: currentList.value.rows.map(r => r.id === rowId ? { ...r, label } : r) })
}

function updateRowColor(rowId: string, color: string) {
    if (!currentList.value) return
    saveList({ ...currentList.value, rows: currentList.value.rows.map(r => r.id === rowId ? { ...r, color } : r) })
}

// ── Placement helpers ──
function withoutCharacter(list: SavedTierList, charId: number): Record<string, number[]> {
    const next: Record<string, number[]> = {}
    for (const row of list.rows) {
        next[row.id] = (list.placements[row.id] ?? []).filter(id => id !== charId)
    }
    return next
}

function removeFromRow(charId: number) {
    if (!currentList.value) return
    saveList({ ...currentList.value, placements: withoutCharacter(currentList.value, charId) })
}

const placedIds = computed(() => new Set(Object.values(currentList.value?.placements ?? {}).flat()))

// ── Pool filters ──
const poolSearch = ref("")
const poolShow5 = useSetting("tierMakerShow5", true)
const poolShow4 = useSetting("tierMakerShow4", true)
const poolShow3 = useSetting("tierMakerShow3", true)
const poolShowStandards = useSetting("tierMakerShowStandards", true)
const poolShowLimiteds = useSetting("tierMakerShowLimiteds", true)
const hiddenElements = useSetting<KiokuElement[]>("tierMakerHiddenElements", [])

const allElementValues = computed(() => Object.values(KiokuElement))

function toggleElement(el: KiokuElement) {
    hiddenElements.value = hiddenElements.value.includes(el)
        ? hiddenElements.value.filter(e => e !== el)
        : [...hiddenElements.value, el]
}

function matchesFilters(c: Character): boolean {
    if (c.rarity === 5 && !poolShow5.value) return false
    if (c.rarity === 4 && !poolShow4.value) return false
    if (c.rarity === 3 && !poolShow3.value) return false
    if (hiddenElements.value.includes(c.element)) return false
    if (!poolShowLimiteds.value && !c.isStandardChar) return false
    if (!poolShowStandards.value && c.isStandardChar) return false
    const q = poolSearch.value.trim().toLowerCase()
    if (q && !c.name.toLowerCase().includes(q) && !(c.character_en ?? "").toLowerCase().includes(q)) return false
    return true
}

const filteredPool = computed(() =>
    store.characters
        .filter(c => !placedIds.value.has(c.id))
        .filter(matchesFilters)
        .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name))
)

// ── Drag & drop (mouse / pointer) ──
const draggedCharId = ref<number | null>(null)
const draggedFromRowId = ref<string | null>(null)
const dragOverZone = ref<string | null>(null) // row id, or 'pool'
const dragOverIndex = ref<number | null>(null)

function computeInsertionIndex(container: HTMLElement, x: number, y: number, excludeId: number | null): number {
    const chips = Array.from(container.querySelectorAll<HTMLElement>(".tier-chip"))
        .filter(el => excludeId == null || Number(el.dataset.charId) !== excludeId)
    for (let i = 0; i < chips.length; i++) {
        const rect = chips[i].getBoundingClientRect()
        if (y < rect.bottom && x < rect.left + rect.width / 2) return i
    }
    return chips.length
}

function onChipDragStart(charId: number, fromRowId: string | null, e: DragEvent) {
    if (!currentList.value) return
    draggedCharId.value = charId
    draggedFromRowId.value = fromRowId
    if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", String(charId))
        e.dataTransfer.effectAllowed = "move"
    }
}

function onZoneDragOver(rowId: string | null, e: DragEvent) {
    if (draggedCharId.value == null) return
    dragOverZone.value = rowId ?? "pool"
    dragOverIndex.value = computeInsertionIndex(e.currentTarget as HTMLElement, e.clientX, e.clientY, draggedCharId.value)
}

function onZoneDragLeave(e: DragEvent) {
    const related = e.relatedTarget as Node | null
    const current = e.currentTarget as HTMLElement
    if (!related || !current.contains(related)) {
        dragOverZone.value = null
        dragOverIndex.value = null
    }
}

function onZoneDrop(rowId: string | null) {
    if (!currentList.value || draggedCharId.value == null) {
        resetDragState()
        return
    }
    const list = currentList.value
    const charId = draggedCharId.value
    const nextPlacements = withoutCharacter(list, charId)
    if (rowId) {
        const idx = dragOverIndex.value ?? nextPlacements[rowId].length
        nextPlacements[rowId] = [...nextPlacements[rowId]]
        nextPlacements[rowId].splice(idx, 0, charId)
    }
    saveList({ ...list, placements: nextPlacements })
    resetDragState()
}

function resetDragState() {
    draggedCharId.value = null
    draggedFromRowId.value = null
    dragOverZone.value = null
    dragOverIndex.value = null
}

// ── Drag & drop (touch) ──
const isTouchDragging = ref(false)
const touchStartPos = ref<{ x: number; y: number } | null>(null)
const touchHoldTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const HOLD_DURATION = 350
const MOVE_CANCEL_THRESHOLD = 8

function onChipTouchStart(charId: number, fromRowId: string | null, e: TouchEvent) {
    if (!currentList.value) return
    touchStartPos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    touchHoldTimer.value = setTimeout(() => {
        draggedCharId.value = charId
        draggedFromRowId.value = fromRowId
        isTouchDragging.value = true
        if (navigator.vibrate) navigator.vibrate(30)
    }, HOLD_DURATION)
}

function onChipTouchMove(e: TouchEvent) {
    if (!touchStartPos.value) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartPos.value.x
    const dy = touch.clientY - touchStartPos.value.y

    if (!isTouchDragging.value) {
        if (Math.sqrt(dx * dx + dy * dy) > MOVE_CANCEL_THRESHOLD && touchHoldTimer.value) {
            clearTimeout(touchHoldTimer.value)
            touchHoldTimer.value = null
        }
        return
    }

    e.preventDefault()
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const zoneEl = el?.closest("[data-drop-zone]") as HTMLElement | null
    if (zoneEl) {
        dragOverZone.value = zoneEl.dataset.dropZone ?? null
        dragOverIndex.value = computeInsertionIndex(zoneEl, touch.clientX, touch.clientY, draggedCharId.value)
    } else {
        dragOverZone.value = null
        dragOverIndex.value = null
    }
}

function onChipTouchEnd(e: TouchEvent) {
    if (touchHoldTimer.value) {
        clearTimeout(touchHoldTimer.value)
        touchHoldTimer.value = null
    }
    if (isTouchDragging.value) {
        e.preventDefault()
        const rowId = dragOverZone.value && dragOverZone.value !== "pool" ? dragOverZone.value : (dragOverZone.value === "pool" ? null : undefined)
        if (rowId !== undefined) {
            onZoneDrop(rowId)
        } else {
            resetDragState()
        }
    }
    isTouchDragging.value = false
    touchStartPos.value = null
}

onUnmounted(() => {
    if (touchHoldTimer.value) clearTimeout(touchHoldTimer.value)
    if (confirmDeleteTimeout) clearTimeout(confirmDeleteTimeout)
})

// ── Export ──
const exportOpts = { exportClass: "exporting" }
const shareOptionsForTierList = () => ({
    title: `${currentList.value?.name || "My"} Tier List`,
})
</script>

<style scoped>
.setup-page {
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
    gap: 0.5rem;
}

.toolbar {
    justify-content: space-between;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
    background: transparent;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    user-select: none;
    font-family: inherit;
}

.chip input {
    display: none;
}

.chip.active {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.list-chip {
    font-weight: 600;
}

/* ── List manager ── */
.current-list-controls {
    justify-content: flex-start;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.grow-field {
    flex: 1 1 220px;
}

.field-label {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    opacity: 0.7;
}

.list-name-input {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    padding: 0.4rem 0.6rem;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
}

.list-name-input:focus {
    outline: none;
    border-color: rgba(255, 209, 110, 0.4);
    box-shadow: 0 0 0 3px rgba(255, 209, 110, 0.12);
}

.icon-btn--danger {
    background: rgba(255, 155, 143, 0.12);
    border-color: rgba(255, 155, 143, 0.4);
    color: var(--danger);
}

.delete-confirm-label {
    font-size: 0.6rem;
    margin-left: 0.2rem;
}

.empty-state {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
}

/* ── Tier board ── */
.tier-maker-board {
    flex-direction: column;
    align-items: stretch;
    gap: 0.6rem;
    padding: 0.75rem;
}

.tier-row {
    border: 1px solid var(--border);
    border-left: 6px solid var(--row-color, var(--accent));
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
}

.tier-row-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--border);
}

.row-color-swatch {
    position: relative;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}

.row-color-swatch input[type="color"] {
    position: absolute;
    inset: -6px;
    width: calc(100% + 12px);
    height: calc(100% + 12px);
    border: none;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

.row-label-input {
    flex: 1 1 auto;
    min-width: 60px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text);
    font-weight: 700;
    font-size: 1rem;
    font-family: inherit;
    padding: 0.25rem 0.4rem;
}

.row-label-input:hover {
    border-color: rgba(255, 255, 255, 0.1);
}

.row-label-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 209, 110, 0.4);
}

.row-count {
    font-size: 0.75rem;
    color: var(--muted);
    flex-shrink: 0;
    min-width: 1.2rem;
    text-align: right;
}

.row-controls {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
}

.row-ctrl-btn {
    width: 26px;
    height: 26px;
    padding: 0;
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text);
}

.row-ctrl-btn--danger:hover:not(:disabled) {
    background: rgba(255, 155, 143, 0.18);
    border-color: rgba(255, 155, 143, 0.4);
    color: var(--danger);
}

.tier-row-dropzone {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem;
    min-height: 68px;
    transition: background 0.12s;
}

.tier-row-dropzone.drag-over {
    background: var(--accent-glow);
}

.row-empty-hint {
    color: var(--muted);
    font-size: 0.82rem;
    font-style: italic;
    opacity: 0.7;
    padding: 0 0.25rem;
}

.add-row-btn {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.06);
    border: 1px dashed var(--border-strong);
    color: var(--accent);
    border-radius: var(--radius-sm);
    padding: 0.5rem 1rem;
}

.add-row-btn:hover {
    background: var(--accent-glow);
}

/* ── Chips ── */
.tier-chip {
    position: relative;
    cursor: grab;
    touch-action: none;
}

.tier-chip.dragging {
    opacity: 0.35;
}

.chip-img {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 50%;
    display: block;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: var(--panel-strong);
}

.chip-remove {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    padding: 0;
    border-radius: 50%;
    background: var(--danger);
    color: #2a1a17;
    border: 1px solid rgba(0, 0, 0, 0.2);
    font-size: 0.75rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.12s;
}

.tier-chip:hover .chip-remove {
    opacity: 1;
}

.insertion-marker {
    width: 3px;
    align-self: stretch;
    min-height: 52px;
    border-radius: 2px;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
}

/* ── Pool ── */
.pool-search {
    display: flex;
    align-items: center;
}

.pool-search input {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    padding: 0.35rem 1.8rem 0.35rem 0.55rem;
    font-family: inherit;
}

.element-filter-row {
    gap: 0.4rem;
}

.element-chip {
    padding: 3px;
    opacity: 0.55;
}

.element-chip.chip--visible {
    opacity: 1;
    background: var(--accent-glow);
    border-color: var(--border-strong);
}

.element-chip img {
    width: 22px;
    height: 22px;
    display: block;
}

.pool-section {
    flex-direction: column;
    align-items: stretch;
    transition: background 0.12s;
}

.pool-section.drag-over {
    background: var(--accent-glow);
}

.pool-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.4rem;
    min-height: 60px;
}

.pool-chip .chip-img {
    width: 48px;
    height: 48px;
}

.pool-empty-hint {
    color: var(--muted);
    font-size: 0.85rem;
    margin: 0.25rem;
}

/* ── About ── */
.about-card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
}

.about-card p {
    margin: 0.3rem 0 0;
    font-size: 0.85rem;
    color: var(--muted);
    line-height: 1.5;
}

/* ── Export snapshot tweaks ── */
.exporting .chip-remove,
.exporting .row-controls,
.exporting .row-color-swatch input[type="color"] {
    display: none;
}

.exporting .row-label-input {
    border-color: transparent !important;
    background: transparent !important;
}

@media (max-width: 480px) {
    .chip-img {
        width: 44px;
        height: 44px;
    }

    .pool-chip .chip-img {
        width: 40px;
        height: 40px;
    }

    .tier-row-header {
        flex-wrap: wrap;
    }
}
</style>
