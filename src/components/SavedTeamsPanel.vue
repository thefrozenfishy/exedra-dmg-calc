<template>
    <div class="saved-teams">
        <div v-if="saved.isSharedView.value" class="viewing-banner">
            <template v-if="saved.shared.value">
                <span class="viewing-label">Shared team</span>
                <span class="viewing-name">{{ saved.shared.value.team.name || 'Untitled team' }}</span>
                <span class="viewing-owner">by {{ saved.shared.value.ownerName || 'a player' }}</span>
                <span v-if="saved.sharedDescription.value" class="viewing-owner shared-description">{{
                    saved.sharedDescription.value }}</span>
                <div class="shared-preview">
                    <div v-for="row in sharedRows" :key="row.label" class="shared-preview-row">
                        <span v-if="row.label" class="shared-preview-label">{{ row.label }}</span>
                        <template v-for="(slot, i) in row.slots" :key="i">
                            <img v-if="slot.main" class="shared-preview-img"
                                :src="`/exedra-dmg-calc/kioku_images/${slot.main.id}_thumbnail.png`"
                                :alt="nameOf(slot.main.id)"
                                :title="`${nameOf(slot.main.id)}${slot.support ? ` + ${nameOf(slot.support.id)}` : ''}`" />
                            <span v-else class="shared-preview-empty" title="Empty slot"></span>
                        </template>
                    </div>
                </div>
                <button class="save-copy-btn" @click="saved.loadSharedTeam"
                    title="Load this team into the simulator without saving it">Load into simulator</button>
                <button class="save-copy-btn" @click="saved.saveSharedCopy">Save a copy to my teams</button>
            </template>
            <template v-else>
                <span class="viewing-label">Shared team</span>
                <span v-if="saved.sharedState.value === 'loading'" class="viewing-owner">Loading…</span>
                <span v-else-if="saved.sharedState.value === 'error'" class="viewing-owner">
                    Couldn't load this team. Check your connection and
                    <button class="link-btn" @click="saved.openSharedFromRoute">try again</button>.
                </span>
                <span v-else class="viewing-owner">This team doesn't exist, or its owner has stopped sharing it.</span>
            </template>
            <button class="back-to-own" @click="saved.leaveSharedView">← My teams</button>
        </div>

        <section class="card list-manager">
            <span class="filters-heading">Your teams</span>
            <button v-for="(t, index) in saved.teamOptions.value" :key="t.id" class="chip list-chip"
                :class="{ active: t.id === saved.activeTeamId.value, 'list-chip-drag-over': dragOverIndex === index }"
                draggable="true" @click="saved.selectTeam(t.id)" @dragstart="onDragStart(t.id, $event)"
                @dragover.prevent="onDragOver(index)" @drop.prevent="onDrop(index)" @dragend="resetDrag">
                {{ t.name || 'Untitled team' }}
            </button>
            <button class="icon-btn icon-btn--accent" title="Save the current setup as a new team"
                aria-label="Save the current setup as a new team" @click="saved.saveCurrentAsNew">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>
            <span v-if="saved.hasUnsavedSetup.value" class="hint">
                The current setup isn't saved. Press + to save it as a team.
            </span>
            <span v-else-if="!saved.teamOptions.value.length" class="hint">
                Press + to save the current setup as a team.
            </span>
            <span class="sync-status" :class="`sync-status--${saved.syncStatus.value}`">
                <template v-if="saved.syncStatus.value === 'off'">
                    Saved on this device only · create or load a cloud profile (top of the page) to back up and
                    share teams
                </template>
                <template v-else-if="saved.syncStatus.value === 'syncing'">Syncing…</template>
                <template v-else-if="saved.syncStatus.value === 'error'">
                    Not synced yet · <button class="link-btn" @click="saved.retrySync">retry</button>
                </template>
                <template v-else>Saved to the cloud</template>
            </span>
        </section>

        <section v-if="current" class="card current-list-controls">
            <label class="field grow-field">
                <span class="field-label">Team name</span>
                <input class="list-name-input" :value="current.name" placeholder="My Team" :maxlength="MAX_NAME_LENGTH"
                    @change="saved.renameTeam(($event.target as HTMLInputElement).value)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()" />
            </label>
            <label class="chip" :class="{ active: current.shared, disabled: !saved.cloudEnabled }"
                :title="saved.cloudEnabled ? 'Anyone with the link can view this team and copy it. Only you can edit it.' : 'Create or load a cloud profile (top of the page) to share teams'">
                <input type="checkbox" :checked="!!current.shared" :disabled="!saved.cloudEnabled"
                    @change="saved.setTeamShared(($event.target as HTMLInputElement).checked)" /> Link sharing
            </label>
            <button class="icon-btn" title="Duplicate this team" aria-label="Duplicate this team"
                @click="saved.duplicateTeam">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            </button>
            <button class="icon-btn" :class="{ 'icon-btn--danger': confirmingDelete }"
                :title="confirmingDelete ? 'Click again to confirm deletion' : 'Delete this saved team (the simulator keeps showing it)'"
                :aria-label="confirmingDelete ? 'Click again to confirm deletion' : 'Delete this saved team'"
                @click="handleDeleteClick">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                <span v-if="confirmingDelete" class="delete-confirm-label">Confirm?</span>
            </button>
            <span class="hint">{{ saved.saveHint }}</span>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue"
import type { SavedTeams } from "../store/savedTeams"
import { MAX_NAME_LENGTH } from "../utils/tierList"

const props = defineProps<{ saved: SavedTeams }>()

const current = computed(() => props.saved.currentTeam.value)

const nameOf = (id: number) => props.saved.catalog.value.get(id)?.name ?? "Unknown"

// PvP teams are stored as [enemy, ally]; show the allied team first, like the page does.
const sharedRows = computed(() => {
    const slots = props.saved.shared.value?.team.slots ?? []
    if (props.saved.kind === "pvp") {
        return [
            { label: "Ally", slots: slots[1] ?? [] },
            { label: "Enemy", slots: slots[0] ?? [] },
        ]
    }
    return [{ label: "", slots: slots[0] ?? [] }]
})

// ── Delete (click twice) ──
const confirmingDelete = ref(false)
let confirmTimeout: ReturnType<typeof setTimeout> | null = null

function handleDeleteClick() {
    if (!confirmingDelete.value) {
        confirmingDelete.value = true
        confirmTimeout = setTimeout(() => { confirmingDelete.value = false }, 4000)
        return
    }
    if (confirmTimeout) clearTimeout(confirmTimeout)
    confirmingDelete.value = false
    props.saved.deleteTeam()
}

onUnmounted(() => {
    if (confirmTimeout) clearTimeout(confirmTimeout)
})

// ── Reordering by drag ──
const draggedId = ref<string | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(id: string, e: DragEvent) {
    draggedId.value = id
    if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", id)
        e.dataTransfer.effectAllowed = "move"
    }
}

function onDragOver(index: number) {
    if (draggedId.value != null) dragOverIndex.value = index
}

function onDrop(targetIndex: number) {
    const id = draggedId.value
    const ids = props.saved.teamOptions.value.map(t => t.id)
    const from = id ? ids.indexOf(id) : -1
    if (id && from !== -1) {
        ids.splice(from, 1)
        ids.splice(Math.max(0, Math.min(targetIndex, ids.length)), 0, id)
        props.saved.reorderTeams(ids)
    }
    resetDrag()
}

function resetDrag() {
    draggedId.value = null
    dragOverIndex.value = null
}
</script>

<style scoped>
.saved-teams {
    width: 100%;
    margin-bottom: 1rem;
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

.chip.disabled {
    opacity: 0.5;
    cursor: default;
}

.list-chip {
    font-weight: 600;
}

.list-chip-drag-over {
    border-color: var(--accent);
    background: var(--accent-glow);
}

.hint {
    font-size: 0.75rem;
    color: var(--muted);
}

.sync-status {
    font-size: 0.75rem;
    color: var(--muted);
    margin-left: auto;
}

.sync-status--error {
    color: var(--danger);
}

.link-btn {
    color: var(--accent-soft);
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
}

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

.viewing-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.6rem;
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

.shared-description {
    flex-basis: 100%;
    text-align: left;
}

.shared-preview {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex-basis: 100%;
}

.shared-preview-row {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
}

.shared-preview-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    width: 3.2rem;
}

.shared-preview-img,
.shared-preview-empty {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--border);
    object-fit: cover;
}

.shared-preview-empty {
    display: inline-block;
    background: rgba(255, 255, 255, 0.04);
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
</style>
