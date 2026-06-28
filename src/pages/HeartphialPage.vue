<template>
    <div class="setup-page">
        <h1 class="page-title">Heartphial Progress</h1>
        <p class="page-subtitle">Track Heartphial EXP across all your Kioku.</p>

        <section class="toolbar card">
            <div class="toolbar-left">
                <ImageActionsToolbar target=".heartphial-list" filename="heartphial_exp.png"
                    :export-options="exportOpts" :share-options="shareOptions" />
            </div>
            <div class="toolbar-right rarity-toggles">
                <label class="chip" :class="{ active: show4stars }">
                    <input type="checkbox" v-model="show4stars" /> ★★★★
                </label>
                <label class="chip" :class="{ active: show3stars }">
                    <input type="checkbox" v-model="show3stars" /> ★★★
                </label>
            </div>
        </section>

        <section class="filters card">
            <span class="filters-heading">Filters</span>

            <label class="chip" :class="{ active: !showUnowned }">
                <input type="checkbox" :checked="!showUnowned"
                    @change="showUnowned = !($event.target as HTMLInputElement).checked" />
                Hide unowned
            </label>

            <label class="chip" :class="{ active: !showCompleted }">
                <input type="checkbox" :checked="!showCompleted"
                    @change="showCompleted = !($event.target as HTMLInputElement).checked" />
                Hide completed
            </label>

            <div class="filter-group">
                <span class="filter-group-label">Sort by</span>
                <label class="chip" :class="{ active: sortBy === 'id' }">
                    <input type="radio" name="sort" value="id" v-model="sortBy" /> Default
                </label>
                <label class="chip" :class="{ active: sortBy === 'exp' }">
                    <input type="radio" name="sort" value="exp" v-model="sortBy" /> EXP remaining
                </label>
            </div>

            <div class="filter-group">
                <span class="filter-group-label">Segment by</span>
                <label class="chip" :class="{ active: segmentBy === 'none' }">
                    <input type="radio" name="segment" value="none" v-model="segmentBy" /> None
                </label>
                <label class="chip" :class="{ active: segmentBy === 'element' }">
                    <input type="radio" name="segment" value="element" v-model="segmentBy" /> Element
                </label>
                <label class="chip" :class="{ active: segmentBy === 'role' }">
                    <input type="radio" name="segment" value="role" v-model="segmentBy" /> Role
                </label>
            </div>
        </section>

        <div class="heartphial-list">
            <div v-if="rows.length === 0" class="empty-state">
                Nothing to show — try enabling a rarity above, or "Hide completed" if everyone's maxed.
            </div>

            <template v-if="segmentBy !== 'none'">
                <div v-for="group in groupedRows" :key="group.name" class="role-section">
                    <button class="role-header" @click="toggleGroup(group.name)"
                        :aria-expanded="!collapsedGroups[group.name]">
                        <span class="role-chevron" :class="{ rotated: collapsedGroups[group.name] }">▾</span>
                        <span class="role-name">{{ group.name }}</span>
                        <span class="role-count">
                            {{ group.ownedRemaining }} remaining · {{ group.ownedTotal }} total
                        </span>
                    </button>

                    <div v-show="!collapsedGroups[group.name]" class="role-body">
                        <HeartphialRowItem v-for="row in group.visible" :key="rowKey(row)" :row="row"
                            :max-level="maxLevel" :progress-percent="progressPercent(row)" :format-exp="formatExp"
                            @update-level="level => updateLevel(row, level)" />
                    </div>
                </div>
            </template>

            <template v-else>
                <HeartphialRowItem v-for="row in rows" :key="rowKey(row)" :row="row" :max-level="maxLevel"
                    :progress-percent="progressPercent(row)" :format-exp="formatExp"
                    @update-level="level => updateLevel(row, level)" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { KiokuConstants } from "../types/KiokuTypes"
import { useSetting } from "../store/settingsStore"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
import HeartphialRowItem from "../components/HeartphialRowItem.vue"
import {
    getHeartphialRows,
    sortHeartphialRows,
    type HeartphialRow,
    type HeartphialSegmentMode,
} from "../models/HeartphialExp"

const store = useCharacterStore()

const show4stars = useSetting("show4stars", false)
const show3stars = useSetting("show3stars", false)
const showUnowned = useSetting("showUnowned", true)
const showCompleted = useSetting("showHeartphialCompleted", true)
const segmentBy = useSetting<HeartphialSegmentMode>("heartphilSegmentBy", "none")
const sortBy = useSetting<'id' | 'exp'>("heartphialSortBy", "exp")

const maxLevel = KiokuConstants.maxHeartphialLvl

const rows = computed<HeartphialRow[]>(() => {
    const built = getHeartphialRows(store.characters, {
        segmentBy: segmentBy.value,
        includeUnowned: showUnowned.value,
        include3Star: show3stars.value,
        include4Star: show4stars.value,
    })
    const filtered = showCompleted.value ? built : built.filter(r => !r.isMaxed)

    if (sortBy.value === 'exp') return sortHeartphialRows(filtered)

    // Default: sort by the lowest character.id among each row's styles
    return filtered.slice().sort((a, b) => {
        const aId = Math.min(...a.styles.map(s => s.id))
        const bId = Math.min(...b.styles.map(s => s.id))
        return aId - bId
    })
})

const ELEMENT_ORDER = ["Flame", "Aqua", "Forest", "Light", "Dark", "Void"]
const ROLE_ORDER = ["Attacker", "Buffer", "Debuffer", "Healer", "Breaker", "Defender"]

// All owned rows regardless of showCompleted — used for accurate header counts
const allOwnedRows = computed<HeartphialRow[]>(() => {
    const built = getHeartphialRows(store.characters, {
        segmentBy: segmentBy.value,
        includeUnowned: false,
        include3Star: show3stars.value,
        include4Star: show4stars.value,
    })
    if (sortBy.value === 'exp') return sortHeartphialRows(built)
    return built.slice().sort((a, b) =>
        Math.min(...a.styles.map(s => s.id)) - Math.min(...b.styles.map(s => s.id))
    )
})

// Group rows by segment, ordered by enum, with owned totals always from allOwnedRows
type GroupEntry = { name: string; visible: HeartphialRow[]; ownedTotal: number; ownedRemaining: number }
const groupedRows = computed<GroupEntry[]>(() => {
    const order = segmentBy.value === 'element' ? ELEMENT_ORDER
        : segmentBy.value === 'role' ? ROLE_ORDER
            : []

    const visibleByGroup: Record<string, HeartphialRow[]> = {}
    for (const row of rows.value) {
        const key = row.segment ?? "Other"
        if (!visibleByGroup[key]) visibleByGroup[key] = []
        visibleByGroup[key].push(row)
    }

    const ownedByGroup: Record<string, HeartphialRow[]> = {}
    for (const row of allOwnedRows.value) {
        const key = row.segment ?? "Other"
        if (!ownedByGroup[key]) ownedByGroup[key] = []
        ownedByGroup[key].push(row)
    }

    const allKeys = [...new Set([...Object.keys(visibleByGroup), ...Object.keys(ownedByGroup)])]
    return allKeys
        .sort((a, b) => {
            const ai = order.indexOf(a), bi = order.indexOf(b)
            if (ai === -1 && bi === -1) return a.localeCompare(b)
            if (ai === -1) return 1
            if (bi === -1) return -1
            return ai - bi
        })
        .filter(name => (visibleByGroup[name]?.length ?? 0) > 0)
        .map(name => {
            const owned = ownedByGroup[name] ?? []
            return {
                name,
                visible: visibleByGroup[name] ?? [],
                ownedTotal: owned.length,
                ownedRemaining: owned.filter(r => !r.isMaxed).length,
            }
        })
})

// Collapsible groups
const collapsedGroups = reactive<Record<string, boolean>>({})
function toggleGroup(name: string) {
    collapsedGroups[name] = !collapsedGroups[name]
}

const rowKey = (row: HeartphialRow) => `${row.heartphial}__${row.segment ?? ""}`

// Update heartphialLvl on every character sharing this heartphial row
function updateLevel(row: HeartphialRow, level: number) {
    row.styles.forEach(style => {
        const char = store.characters.find(c => c.id === style.id)
        if (char) store.updateChar({ ...char, heartphialLvl: level })
    })
}

const progressPercent = (row: HeartphialRow) =>
    row.maxExp > 0 ? Math.min(100, (row.currentExp / row.maxExp) * 100) : 100

const formatExp = (n: number) => n.toLocaleString()

const exportOpts = { exportClass: "exporting" }
const shareOptions = () => ({
    title: "Heartphial Exp Progress",
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
    margin: 0 0 0.25rem;
    color: var(--text);
}

.page-subtitle {
    font-size: 0.85rem;
    color: var(--muted);
    margin: 0 0 1.25rem;
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
    background: rgba(246, 212, 133, 0.1);
    border-color: var(--border-strong);
    color: var(--accent);
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

.heartphial-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
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

.role-name {
    flex: 1;
    color: var(--accent-soft);
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
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.empty-state {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--muted);
    opacity: 0.7;
    font-size: 0.9rem;
}
</style>
