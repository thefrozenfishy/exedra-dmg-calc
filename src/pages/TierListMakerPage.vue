<template>
    <div class="setup-page tier-maker-page">
        <h1 class="page-title">Tier List Maker</h1>

        <div v-if="isReadonly && shared" class="viewing-banner">
            <span class="viewing-label">Shared list</span>
            <span class="viewing-name">{{ shared.list.name || 'Untitled list' }}</span>
            <span class="viewing-owner">by {{ shared.ownerName || 'a player' }}</span>
            <button class="save-copy-btn" @click="saveSharedCopy">Save a copy to my lists</button>
            <router-link :to="{ path: '/tier-list-maker' }" class="back-to-own" title="Back to your tier lists">
                ← My tier lists
            </router-link>
        </div>

        <section class="toolbar card" v-if="viewList">
            <div class="toolbar-left">
                <ImageActionsToolbar target=".tier-maker-board" filename="tier-list.png" :export-options="exportOpts"
                    :share-options="shareOptionsForTierList" :share-handler="generateTierListShareUrl"
                    share-label="Share list">
                </ImageActionsToolbar>
            </div>
            <span v-if="!isReadonly" class="sync-status" :class="`sync-status--${syncStatus}`">
                <template v-if="syncStatus === 'off'">
                    Saved on this device only · create or load a cloud profile (top of the page) to back up and
                    share lists
                </template>
                <template v-else-if="syncStatus === 'syncing'">Syncing…</template>
                <template v-else-if="syncStatus === 'error'">
                    Not synced yet · <button class="link-btn" @click="retrySync">retry</button>
                </template>
                <template v-else>Saved to the cloud</template>
            </span>
        </section>

        <section v-if="!isReadonly" class="card list-manager">
            <span class="filters-heading">Your lists</span>
            <button v-for="(l, index) in listOptions" :key="l.id" class="chip list-chip"
                :class="{ active: l.id === activeListId, 'list-chip-drag-over': dragOverListIndex === index }"
                draggable="true" @click="activeListId = l.id" @dragstart="onListDragStart(l.id, $event)"
                @dragover.prevent="onListDragOver(index)" @drop.prevent="onListDrop(index)"
                @dragend="resetListDragState">
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

        <section v-if="currentList && !isReadonly" class="card current-list-controls">
            <label class="field grow-field">
                <span class="field-label">List name</span>
                <input class="list-name-input" :value="currentList.name" placeholder="My Tier List"
                    :maxlength="MAX_NAME_LENGTH"
                    @change="updateListName(($event.target as HTMLInputElement).value)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()" />
            </label>
            <label class="chip" :class="{ active: currentList.shared, disabled: !cloudEnabled }"
                :title="cloudEnabled ? 'Anyone with the link can view this list. Only you can edit it.' : 'Create or load a cloud profile (top of the page) to share lists'">
                <input type="checkbox" :checked="!!currentList.shared" :disabled="!cloudEnabled"
                    @change="setListShared(($event.target as HTMLInputElement).checked)" /> Link sharing
            </label>
            <button class="icon-btn" title="Duplicate this list" aria-label="Duplicate this list"
                @click="duplicateList">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            </button>
            <button class="icon-btn" :class="{ 'icon-btn--danger': confirmingDelete }"
                :title="confirmingDelete ? 'Click again to confirm deletion' : 'Delete this list'"
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

        <template v-if="viewList">
            <section class="card tier-maker-board">
                <button v-if="!isReadonly" class="add-row-btn" :disabled="viewList.rows.length >= MAX_TIER_ROWS"
                    @click="addRow">+ Add tier</button>

                <div class="tier-rows-wrap">
                    <div class="tier-row" v-for="(row, rIdx) in viewList.rows" :key="row.id">
                        <div class="tier-row-label-cell" :style="{
                            background: row.color, color: labelTextColor(row.color), width: labelColWidth + 'px'
                        }">
                            <span class="row-count">{{ (viewList.placements[row.id] || []).length }}</span>
                            <textarea class="row-label-input" :ref="(el) => setLabelRef(row.id, el as Element)"
                                :value="row.label" placeholder="Tier name" rows="1" :readonly="isReadonly"
                                :maxlength="MAX_LABEL_LENGTH" @input="onLabelInput($event)"
                                @change="updateRowLabel(row.id, ($event.target as HTMLTextAreaElement).value)"
                                @keydown.enter.prevent="($event.target as HTMLTextAreaElement).blur()"></textarea>
                            <div v-if="!isReadonly" class="row-controls">
                                <button class="row-ctrl-btn" title="Move tier up" aria-label="Move tier up"
                                    :disabled="rIdx === 0" @click="moveRow(row.id, -1)">↑</button>
                                <button class="row-ctrl-btn" title="Move tier down" aria-label="Move tier down"
                                    :disabled="rIdx === viewList.rows.length - 1"
                                    @click="moveRow(row.id, 1)">↓</button>
                                <button class="row-ctrl-btn row-ctrl-btn--danger" title="Remove tier"
                                    aria-label="Remove tier" @click="removeRow(row.id)">×</button>
                                <label class="row-color-edit" title="Row colour">
                                    <input type="color" :value="row.color"
                                        @change="updateRowColor(row.id, ($event.target as HTMLInputElement).value)" />
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                        <path d="M2 2l7.586 7.586" />
                                        <circle cx="11" cy="11" r="2" />
                                    </svg>
                                </label>
                            </div>
                        </div>
                        <div class="tier-row-dropzone" :data-drop-zone="row.id"
                            :class="{ 'drag-over': dragOverZone === row.id }"
                            @dragover.prevent="onZoneDragOver(row.id, $event)" @dragleave="onZoneDragLeave($event)"
                            @drop.prevent="onZoneDrop(row.id)">
                            <template v-for="(charId, i) in (viewList.placements[row.id] || [])" :key="charId">
                                <span class="insertion-marker"
                                    v-if="dragOverZone === row.id && dragOverIndex === i"></span>
                                <div class="tier-chip" :data-char-id="charId"
                                    :class="{ dragging: draggedCharId === charId }" :draggable="!isReadonly"
                                    @dragstart="onChipDragStart(charId, row.id, $event)" @dragend="resetDragState"
                                    @touchstart="onChipTouchStart(charId, row.id, $event)"
                                    @touchmove="onChipTouchMove($event)" @touchend="onChipTouchEnd($event)">
                                    <img class="chip-img" :class="characterBorderClass(charById.get(charId))"
                                        :src="`/exedra-dmg-calc/kioku_images/${charId}_thumbnail.png`"
                                        :alt="charById.get(charId)?.name" :title="charById.get(charId)?.name" />
                                    <button v-if="!isReadonly" class="chip-remove" title="Send back to pool" aria-label="Send back to pool"
                                        @click.stop="removeFromRow(charId)">×</button>
                                </div>
                            </template>
                            <span class="insertion-marker"
                                v-if="dragOverZone === row.id && dragOverIndex === (viewList.placements[row.id] || []).length"></span>
                            <span v-if="!(viewList.placements[row.id] || []).length && !isReadonly" class="row-empty-hint">Drag
                                characters here</span>
                        </div>
                    </div>
                    <div class="tier-col-resizer" :style="{ left: (labelColWidth - 3) + 'px' }"
                        title="Drag to resize the name column" @pointerdown="onResizerPointerDown"></div>
                </div>

            </section>

            <template v-if="!isReadonly">
            <section class="card pool-section" data-drop-zone="pool" :class="{ 'drag-over': dragOverZone === 'pool' }"
                @dragover.prevent="onZoneDragOver(null, $event)" @dragleave="onZoneDragLeave($event)"
                @drop.prevent="onZoneDrop(null)">
                <div class="pool-heading-row">
                    <span class="filters-heading">Unranked ({{ filteredPool.length }})</span>
                    <label class="pool-sort-label">
                        <span>Sort</span>
                        <select v-model="poolSort" class="selector" aria-label="Sort unranked characters">
                            <option value="id">ID</option>
                            <option value="releaseDate">Release date</option>
                            <option value="character_en">Character name</option>
                            <option value="name">Kioku name</option>
                        </select>
                        <label class="chip sort-inverse-chip" :class="{ active: poolSortInverse }">
                            <input type="checkbox" v-model="poolSortInverse" /> Sort inverse
                        </label>
                    </label>
                    <button v-if="filteredPool.length" class="add-all-btn"
                        title="Add every shown character to the bottom tier" @click="addAllPoolToBottomRow">
                        + Add all to bottom tier
                    </button>
                </div>
                <div class="pool-chips">
                    <div v-for="ch in filteredPool" :key="ch.id" class="tier-chip pool-chip" :data-char-id="ch.id"
                        :class="{ dragging: draggedCharId === ch.id }" draggable="true"
                        @dragstart="onChipDragStart(ch.id, null, $event)" @dragend="resetDragState"
                        @touchstart="onChipTouchStart(ch.id, null, $event)" @touchmove="onChipTouchMove($event)"
                        @touchend="onChipTouchEnd($event)">
                        <img class="chip-img" :class="characterBorderClass(ch)"
                            :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name"
                            :title="ch.name" />
                    </div>
                    <p v-if="!filteredPool.length" class="pool-empty-hint">No characters match your filters.</p>
                </div>
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
                <div>
                    <button v-for="el in allElementValues" :key="el" class="chip element-chip"
                        :class="hiddenElements.includes(el) ? 'chip--hidden' : 'chip--visible'"
                        :title="hiddenElements.includes(el) ? `Show ${el}` : `Hide ${el}`" @click="toggleElement(el)">
                        <img :src="`/exedra-dmg-calc/elements/${el}.png`" :alt="el" />
                    </button>
                </div>
            </section>

            </template>

            <section class="card about-card">
                <span class="filters-heading">About</span>
                <p v-if="isReadonly">
                    This is a tier list shared by {{ shared?.ownerName || 'another player' }}, so it's view-only. Use
                    "Save a copy to my lists" to get an editable copy of your own, or the toolbar to export it as an
                    image.
                </p>
                <p v-else>
                    Drag characters from the pool into a tier, and drag between or within tiers to reorder them —
                    where you drop a character is exactly where it lands. Tap the × on a character to send it back
                    to the pool. Tap a tier's colour circle to change it, or edit its name directly. This is a
                    freeform list for your own opinions — it isn't tied to your account data. Lists are saved in
                    this browser, and backed up to the cloud when you have a cloud profile (see the top of the page). Turn on
                    "Link sharing" for a list and use the link button in the toolbar to share it: anyone with the link
                    can view it and save their own copy, but only you can edit it. You can keep as many lists as you
                    like using the switcher above.
                </p>
            </section>
        </template>

        <section v-else-if="isReadonly" class="card empty-state">
            <p v-if="sharedState === 'loading'">Loading shared tier list…</p>
            <template v-else>
                <p v-if="sharedState === 'error'">Couldn't load this tier list. Check your connection and try again.</p>
                <p v-else>This tier list doesn't exist, or its owner has stopped sharing it.</p>
                <button v-if="sharedState === 'error'" class="copy-btn" @click="openSharedFromRoute">Try again</button>
                <router-link :to="{ path: '/tier-list-maker' }" class="back-to-own">← My tier lists</router-link>
            </template>
        </section>

        <section v-else class="card empty-state">
            <p>You don't have any tier lists yet.</p>
            <button class="copy-btn" @click="createList">+ Create your first tier list</button>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue3-toastify"
import { useCharacterStore } from "../store/characterStore"
import { useSetting } from "../store/settingsStore"
import { Character } from "../types/KiokuTypes"
import { KiokuElement } from "../types/enums"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
import { useTierListSync } from "../store/tierListSync"
import { loadSharedTierList, getFriendCode } from "../store/cloud"
import { refreshSharePreview, prettyShareId, latestPrettyUrl, generateShareLink } from "../utils/image"
import { MAX_LABEL_LENGTH, MAX_NAME_LENGTH, MAX_TIER_ROWS, clampName, isUuid } from "../utils/tierList"
import type { SavedTierList, SharedTierList, TierRow } from "../types/TierListTypes"

const store = useCharacterStore()

const charById = computed(() => new Map(store.characters.map(c => [c.id, c] as const)))

function labelTextColor(hex: string): string {
    const c = (hex || "").replace("#", "")
    if (c.length !== 6) return "#ffffff"
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? "#1a1a1a" : "#ffffff"
}

// ── Persisted lists ──
const tierLists = useSetting<Record<string, SavedTierList>>("tierMakerLists", {})
const activeListId = useSetting<string>("tierMakerActiveListId", "")
const listOrder = useSetting<string[]>("tierMakerListOrder", [])

const listOptions = computed(() => {
    const byId = tierLists.value
    const seen = new Set<string>()
    const ordered: SavedTierList[] = []

    for (const id of listOrder.value) {
        const list = byId[id]
        if (list) {
            ordered.push(list)
            seen.add(id)
        }
    }

    Object.values(byId)
        .filter(list => !seen.has(list.id))
        .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
        .forEach(list => ordered.push(list))

    return ordered
})

const currentList = computed<SavedTierList | null>(() =>
    activeListId.value ? tierLists.value[activeListId.value] ?? null : null
)

// ── Cloud sync + shared (read-only) view ──

const route = useRoute()
const router = useRouter()
const sync = useTierListSync(tierLists, listOrder)
const syncStatus = sync.status
const cloudEnabled = sync.active()

// `?list=<id>` opens a list by link. If it's one of my own lists it just opens for editing; otherwise
// it's someone else's shared list, shown read-only (`isReadonly`).
const sharedListId = computed(() => {
    const id = route.query.list
    return isUuid(id) ? id.toLowerCase() : null
})
const isReadonly = computed(() => !!sharedListId.value && !tierLists.value[sharedListId.value])
const shared = ref<SharedTierList | null>(null)
const sharedState = ref<"loading" | "notfound" | "error">("loading")

/** What the board shows: the shared list when viewing one, otherwise the active list of my own. */
const viewList = computed<SavedTierList | null>(() =>
    isReadonly.value ? shared.value?.list ?? null : currentList.value
)

async function openSharedFromRoute() {
    shared.value = null
    const id = sharedListId.value
    if (!id) return
    if (tierLists.value[id]) {
        activeListId.value = id
        return
    }
    sharedState.value = "loading"
    try {
        const result = await loadSharedTierList(id)
        if (sharedListId.value !== id) return // navigated elsewhere while loading
        if (!result) {
            sharedState.value = "notfound"
            return
        }
        shared.value = result
        await nextTick()
        resizeAllLabelTextareas()
    } catch (err) {
        console.error("Failed to load shared tier list:", err)
        if (sharedListId.value === id) sharedState.value = "error"
    }
}

watch(sharedListId, openSharedFromRoute)

function normalizeListOrder() {
    const existingIds = new Set(Object.keys(tierLists.value))
    const seen = new Set<string>()
    const next: string[] = []

    for (const id of listOrder.value) {
        if (!existingIds.has(id) || seen.has(id)) continue
        seen.add(id)
        next.push(id)
    }

    Object.values(tierLists.value)
        .filter(list => !seen.has(list.id))
        .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
        .forEach(list => next.push(list.id))

    if (next.length !== listOrder.value.length || next.some((id, i) => id !== listOrder.value[i])) {
        listOrder.value = next
    }
}

function ensureActiveList() {
    normalizeListOrder()
    if (!currentList.value && listOptions.value.length) {
        activeListId.value = listOptions.value[0].id
    }
}

onMounted(async () => {
    ensureActiveList()
    nextTick(resizeAllLabelTextareas)

    // The local lists show immediately; the cloud merge lands a moment later.
    const pulling = sync.pull().then(() => {
        ensureActiveList()
        nextTick(resizeAllLabelTextareas)
    })
    // Opening my own share link should land on the synced list, so wait for the merge in that case.
    if (sharedListId.value) await pulling
    await openSharedFromRoute()
})

function saveList(list: SavedTierList) {
    tierLists.value = { ...tierLists.value, [list.id]: { ...list, updatedAt: Date.now() } }
}

const draggedListId = ref<string | null>(null)
const dragOverListIndex = ref<number | null>(null)

function onListDragStart(listId: string, e: DragEvent) {
    draggedListId.value = listId
    if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", listId)
        e.dataTransfer.effectAllowed = "move"
    }
}

function onListDragOver(index: number) {
    if (draggedListId.value == null) return
    dragOverListIndex.value = index
}

function onListDrop(targetIndex: number) {
    const draggedId = draggedListId.value
    if (!draggedId) return resetListDragState()

    const ids = listOptions.value.map(list => list.id)
    const fromIndex = ids.indexOf(draggedId)
    if (fromIndex === -1) return resetListDragState()

    ids.splice(fromIndex, 1)
    ids.splice(Math.max(0, Math.min(targetIndex, ids.length)), 0, draggedId)
    listOrder.value = ids
    resetListDragState()
}

function resetListDragState() {
    draggedListId.value = null
    dragOverListIndex.value = null
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

function addList(list: SavedTierList) {
    tierLists.value = { ...tierLists.value, [list.id]: list }
    listOrder.value = [...listOrder.value.filter(id => id !== list.id), list.id]
    activeListId.value = list.id
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
    addList(list)
    toast.success("New list created!", { position: toast.POSITION.TOP_RIGHT, icon: false })
}

function duplicateList() {
    if (!currentList.value) return
    const src = currentList.value
    const copy: SavedTierList = {
        id: crypto.randomUUID(),
        name: clampName(`${src.name} (copy)`),
        rows: src.rows.map(r => ({ ...r })),
        placements: Object.fromEntries(Object.entries(src.placements).map(([k, v]) => [k, [...v]])),
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
    addList(copy)
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

    const deletedId = currentList.value.id
    const { [deletedId]: _removed, ...rest } = tierLists.value
    tierLists.value = rest
    listOrder.value = listOrder.value.filter(id => id !== deletedId)
    activeListId.value = listOrder.value[0] ?? Object.values(rest).sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))[0]?.id ?? ""
    void sync.remove(deletedId)
    toast.success("List deleted", { position: toast.POSITION.TOP_RIGHT, icon: false })
}

function updateListName(name: string) {
    if (!currentList.value) return
    saveList({ ...currentList.value, name: clampName(name) })
}

// ── Row CRUD ──
function addRow() {
    if (!currentList.value) return
    const list = currentList.value
    if (list.rows.length >= MAX_TIER_ROWS) return
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

// ── Label column resize ──
const labelColWidth = useSetting<number>("tierMakerLabelColWidth", 96)
let resizeStartX = 0
let resizeStartWidth = 96

function onResizerPointerDown(e: PointerEvent) {
    e.preventDefault()
    resizeStartX = e.clientX
    resizeStartWidth = labelColWidth.value
    window.addEventListener("pointermove", onResizerPointerMove)
    window.addEventListener("pointerup", onResizerPointerUp)
}

function onResizerPointerMove(e: PointerEvent) {
    const delta = e.clientX - resizeStartX
    labelColWidth.value = Math.min(240, Math.max(64, Math.round(resizeStartWidth + delta)))
}

function onResizerPointerUp() {
    window.removeEventListener("pointermove", onResizerPointerMove)
    window.removeEventListener("pointerup", onResizerPointerUp)
}

onUnmounted(() => {
    window.removeEventListener("pointermove", onResizerPointerMove)
    window.removeEventListener("pointerup", onResizerPointerUp)
})

// ── Label textarea auto-resize ──
const labelTextareas = new Map<string, HTMLTextAreaElement>()

function setLabelRef(rowId: string, el: Element | null) {
    if (el) labelTextareas.set(rowId, el as HTMLTextAreaElement)
    else labelTextareas.delete(rowId)
}

function resizeLabelTextarea(el: HTMLTextAreaElement) {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
}

function resizeAllLabelTextareas() {
    labelTextareas.forEach(el => resizeLabelTextarea(el))
}

function onLabelInput(e: Event) {
    resizeLabelTextarea(e.target as HTMLTextAreaElement)
}

watch(() => viewList.value?.id, () => nextTick(resizeAllLabelTextareas))
watch(labelColWidth, () => nextTick(resizeAllLabelTextareas))

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

function addAllPoolToBottomRow() {
    if (!currentList.value || !currentList.value.rows.length) return
    const list = currentList.value
    const bottomRow = list.rows[list.rows.length - 1]
    const idsToAdd = filteredPool.value.map(c => c.id)
    if (!idsToAdd.length) return
    const nextPlacements = { ...list.placements }
    nextPlacements[bottomRow.id] = [...(nextPlacements[bottomRow.id] || []), ...idsToAdd]
    saveList({ ...list, placements: nextPlacements })
    toast.success(`Added ${idsToAdd.length} to "${bottomRow.label || 'bottom tier'}"`,
        { position: toast.POSITION.TOP_RIGHT, icon: false })
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
const poolSort = useSetting<"id" | "releaseDate" | "character_en" | "name">("tierMakerPoolSort", "id")
const poolSortInverse = useSetting("tierMakerPoolSortInverse", false)

function characterBorderClass(ch?: Character): string {
    return ch?.obtain && !ch.isStandardChar ? "limited-border" : "default-border"
}

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

function comparePoolCharacters(a: Character, b: Character): number {
    let result = 0

    switch (poolSort.value) {
        case "releaseDate":
            result = (a.releaseDate || "").localeCompare(b.releaseDate || "")
            break
        case "character_en":
            result = (a.character_en || "").localeCompare(b.character_en || "")
            break
        case "name":
            result = a.name.localeCompare(b.name)
            break
        case "id":
        default:
            result = a.id - b.id
            break
    }

    result = result || a.id - b.id
    return poolSortInverse.value ? -result : result
}

const filteredPool = computed(() =>
    store.characters
        .filter(c => !placedIds.value.has(c.id))
        .filter(matchesFilters)
        .sort(comparePoolCharacters)
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
    if (!currentList.value || isReadonly.value) return
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
    if (!currentList.value || isReadonly.value) return
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
const listUrl = (id: string) => `${window.location.origin}/exedra-dmg-calc/#/tier-list-maker?list=${id}`

const shareOptionsForTierList = () => {
    const list = viewList.value
    return {
        title: `${list?.name || "My"} Tier List`,
        // The shared image page can link back to the list itself, when the list has a link.
        backUrl: list && (isReadonly.value || list.shared) ? listUrl(list.id) : undefined,
    }
}

// ── Sharing ──

function setListShared(value: boolean) {
    if (!currentList.value || !cloudEnabled) return
    saveList({ ...currentList.value, shared: value })
}

async function generateTierListShareUrl(): Promise<string> {
    const list = viewList.value
    if (!list) throw new Error("No list to share")

    if (isReadonly.value) {
        // Viewer: don't write anything. Reconstruct the SAME deterministic slug the owner's
        // client would have computed, from data get_shared_tier_list already gave us.
        const friendCode = shared.value?.ownerFriendId
        return friendCode ? await latestPrettyUrl(prettyShareId(friendCode, list.name)) : listUrl(list.id)
    }

    if (!cloudEnabled) {
        // Not synced, so the list has nowhere to live and no friend code to build a pretty link from.
        // Fall back to the legacy one-shot snapshot link (random id, a frozen image of the board as it is
        // right now).
        return await generateShareLink(".tier-maker-board", exportOpts, shareOptionsForTierList())
    }
    if (!list.shared) setListShared(true)
    // The link only works once the server has the list with sharing switched on.
    await sync.flush()
    if (!sync.isSynced(list.id) || !tierLists.value[list.id]?.shared) {
        throw new Error("Couldn't upload this list. Check your connection and try again.")
    }

    // List is confirmed synced+shared -- now make sure a fresh preview exists
    // before handing out a URL that promises one.
    const friendCode = await getFriendCode()
    if (!friendCode) throw new Error("Couldn't resolve your friend code.")
    const shareId = prettyShareId(friendCode, list.name)
    return await refreshSharePreview(".tier-maker-board", shareId, {
        ...shareOptionsForTierList(),
        redirectHumans: true,
    })
}

function saveSharedCopy() {
    const src = shared.value?.list
    if (!src) return
    const now = Date.now()
    addList({
        id: crypto.randomUUID(),
        name: clampName(`${src.name || "Untitled list"} (copy)`),
        rows: src.rows.map(r => ({ ...r })),
        placements: Object.fromEntries(Object.entries(src.placements).map(([k, v]) => [k, [...v]])),
        createdAt: now,
        updatedAt: now,
    })
    router.replace({ path: route.path }) // leave the shared view; the copy is now the active list
    toast.success("Saved to your lists!", { position: toast.POSITION.TOP_RIGHT, icon: false })
}

function retrySync() {
    void sync.pull()
}
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

.sort-inverse-chip {
    width: 10rem;
    justify-content: center;
}

.chip.active {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.list-chip {
    font-weight: 600;
}

.list-chip-drag-over {
    border-color: var(--accent);
    background: var(--accent-glow);
}

.pool-sort-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--muted);
    font-size: 0.75rem;
}

.pool-sort-label .selector {
    padding: 0.3rem 1rem;
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
    gap: 0;
    padding: 0.75rem;
}

.tier-rows-wrap {
    position: relative;
}

.tier-row {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
}

.tier-row+.tier-row {
    border-top: none;
}

.tier-row:first-child {
    border-top-left-radius: var(--radius-sm);
    border-top-right-radius: var(--radius-sm);
}

.tier-row:last-child {
    border-bottom-left-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
}

/* ── Label column ── */
.tier-row-label-cell {
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.55rem 0.4rem 0.4rem;
    box-sizing: border-box;
    text-align: center;
}

.row-count {
    position: absolute;
    top: 6px;
    left: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    opacity: 0.75;
}

.row-label-input {
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: inherit;
    font-weight: 800;
    font-size: 1rem;
    font-family: inherit;
    text-align: center;
    padding: 0.2rem 0.3rem;
    resize: none;
    overflow: hidden;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    line-height: 1.25;
}

.row-label-input:hover {
    border-color: rgba(0, 0, 0, 0.15);
}

.row-label-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.4);
}

.row-controls {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: center;
}

.row-ctrl-btn {
    width: 18px;
    height: 18px;
    padding: 0;
    border-radius: 6px;
    font-size: 0.65rem;
    line-height: 1;
    background: rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: inherit;
}

.row-ctrl-btn--danger:hover:not(:disabled) {
    background: rgba(255, 90, 70, 0.35);
    border-color: rgba(255, 90, 70, 0.6);
}

.row-color-edit {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.28);
    cursor: pointer;
    opacity: 0.65;
    transition: opacity 0.12s;
    flex-shrink: 0;
}

.row-color-edit:hover {
    opacity: 1;
}

.row-color-edit svg {
    width: 10px;
    height: 10px;
}

.row-color-edit input[type="color"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

/* ── Column resizer ── */
.tier-col-resizer {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    touch-action: none;
    z-index: 2;
}

.tier-col-resizer::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 2px;
    width: 2px;
    border-radius: 2px;
    background: transparent;
    transition: background 0.12s;
}

.tier-col-resizer:hover::after,
.tier-col-resizer:active::after {
    background: var(--accent);
}

/* ── Content column ── */
.tier-row-dropzone {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem;
    min-height: 84px;
    flex: 1 1 auto;
    min-width: 0;
    border-left: 1px solid var(--border);
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
    margin-top: 0.6rem;
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
    width: 68px;
    height: 68px;
    object-fit: cover;
    border-radius: 50%;
    display: block;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: var(--panel-strong);
}

.chip-img.limited-border {
    border-color: red !important;
}

.chip-img.default-border {
    border-color: rgba(255, 255, 255, 0.18);
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
    min-height: 68px;
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

.element-chip {
    padding: 3px;
    opacity: 0.55;
    margin: auto 0.15rem;
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
    width: 60px;
    height: 60px;
}

.pool-empty-hint {
    color: var(--muted);
    font-size: 0.85rem;
    margin: 0.25rem;
}

.pool-heading-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
}

.add-all-btn {
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
}

.add-all-btn:hover {
    background: var(--accent-glow-strong);
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
.exporting .row-color-edit,
.exporting .tier-col-resizer {
    display: none;
}

.exporting .row-label-input {
    border-color: transparent !important;
    background: transparent !important;
}

@media (max-width: 480px) {
    .chip-img {
        width: 52px;
        height: 52px;
    }

    .pool-chip .chip-img {
        width: 46px;
        height: 46px;
    }

    .tier-row-label-cell {
        max-width: 45vw;
        padding: 0.4rem 0.3rem;
    }

    .row-label-input {
        font-size: 0.88rem;
    }
}

/* ── Cloud sync status + shared (read-only) view ── */
.sync-status {
    font-size: 0.75rem;
    color: var(--muted);
}

.sync-status a,
.link-btn {
    color: var(--accent-soft);
}

.link-btn {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
}

.sync-status--error {
    color: var(--danger);
}

.chip.disabled {
    opacity: 0.5;
    cursor: default;
}

.viewing-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding: 0.6rem 0.9rem;
    border-radius: var(--radius-sm);
    background: var(--panel);
    border: 1px solid var(--border-strong);
}

.viewing-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--accent-soft);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
}

.viewing-name {
    font-weight: 700;
    color: var(--text);
}

.viewing-owner {
    font-size: 0.85rem;
    color: var(--muted);
}

.save-copy-btn,
.back-to-own {
    padding: 0.3rem 0.75rem;
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    color: var(--accent-soft);
    font-size: 0.82rem;
    font-weight: 600;
    font-family: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
}

.save-copy-btn:hover,
.back-to-own:hover {
    background: var(--accent-glow-strong);
}

.viewing-banner .back-to-own {
    margin-left: auto;
}

.row-label-input[readonly] {
    cursor: default;
}

.row-label-input[readonly]:hover,
.row-label-input[readonly]:focus {
    background: transparent;
    border-color: transparent;
}
</style>
