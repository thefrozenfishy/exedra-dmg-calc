<template>
    <div class="setup-page kanban-page">
        <h1 class="page-title">Kanban Board</h1>

        <form class="card add-card" @submit.prevent="addTask">
            <input v-model="newTitle" class="add-title" placeholder="Add a card…" maxlength="500" />
            <div class="cat-toggle" role="radiogroup" aria-label="Category">
                <button type="button" class="cat-btn cat-bug" :class="{ on: newCategory === 'bug' }"
                    @click="newCategory = 'bug'">Bug</button>
                <button type="button" class="cat-btn cat-feature" :class="{ on: newCategory === 'feature' }"
                    @click="newCategory = 'feature'">Feature</button>
            </div>
            <input v-model="newTags" class="add-tags" placeholder="tags, comma separated" />
            <button type="submit" class="add-btn" :disabled="!canAdd">Add</button>
            <textarea v-model="newDescription" class="add-description" rows="3" maxlength="5000"
                placeholder="Description (required): what's wrong / what should it do? Ctrl+Enter to add"
                @keydown.enter.ctrl.prevent="addTask" @keydown.enter.meta.prevent="addTask" />
        </form>

        <section class="card filters">
            <span class="filters-heading">Filter by tag</span>
            <span v-if="!allTags.length" class="dim">No tags yet</span>
            <span v-for="[tag, count] in allTags" :key="tag" class="chip"
                :class="{ active: selectedTags.some(t => t.toLowerCase() === tag.toLowerCase()) }"
                @click="toggleTag(tag)">#{{ tag }} · {{ count }}</span>
            <button v-if="selectedTags.length" class="ghost-btn" @click="selectedTags = []">Clear filter</button>
            <span class="spacer" />
            <span class="dim small">{{ statusLine }}</span>
            <button class="ghost-btn" :disabled="loading" @click="reload()">↻ Refresh</button>
        </section>

        <p v-if="error" class="error-message">{{ error }}</p>

        <div class="board">
            <section v-for="lane in KANBAN_STATUSES" :key="lane.key" class="lane" :class="[`lane-${lane.key}`, { 'drop-target': laneHover === lane.key }]"
                @dragover="onLaneDragOver($event, lane.key)" @dragleave="onLaneDragLeave($event, lane.key)"
                @drop="onLaneDrop($event, lane.key)">
                <header class="lane-head">
                    <span class="lane-dot" />
                    <h2>{{ lane.label }}</h2>
                    <span class="lane-count">{{ laneTasks(lane.key).length }}</span>
                </header>
                <div class="lane-body">
                    <KanbanCard v-for="task in visibleLaneTasks(lane.key)" :key="task.id" :task="task" />
                    <p v-if="!laneTasks(lane.key).length" class="lane-empty">
                        {{ selectedTags.length ? 'No matching cards' : 'Drop cards here' }}
                    </p>
                </div>
                <button v-if="laneTasks(lane.key).length > LANE_PREVIEW" class="lane-more"
                    @click="toggleLane(lane.key)">
                    {{ expandedLanes.has(lane.key)
                        ? 'Show less'
                        : `Show all (${laneTasks(lane.key).length - LANE_PREVIEW} more)` }}
                </button>
            </section>
        </div>

        <p class="hint dim small">
            Double-click a title to edit it. Drag a card between lanes to change its status, or onto another card to
            make it a child (admins: drop on a card's top or bottom edge to put it above or below that card). Children
            keep their own status and show inside their parent. You can only edit, move or
            delete your own cards (admins can change all of them); anyone can comment.
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from "vue"
import KanbanCard from "../components/kanban/KanbanCard.vue"
import { KANBAN_CTX, mergeTags } from "../components/kanban/kanbanContext"
import { isAdmin } from "../utils/betaSettings"
import { addKanbanComment, addKanbanTask, deleteKanbanComment, deleteKanbanTask, loadKanbanBoard, updateKanbanTask } from "../store/cloud"
import { KANBAN_STATUSES, type KanbanCategory, type KanbanComment, type KanbanStatus, type KanbanTask, type KanbanTaskPatch } from "../types/KanbanTypes"

const tasks = ref<KanbanTask[]>([])
const comments = ref<KanbanComment[]>([])
const loading = ref(false)
const error = ref("")
const lastLoaded = ref<Date | null>(null)

const tasksById = computed(() => new Map(tasks.value.map(t => [t.id, t])))

const childrenMap = computed(() => {
    const map = new Map<string, KanbanTask[]>()
    for (const t of tasks.value) {
        // A child whose parent is missing (deleted elsewhere) is treated as top level.
        if (!t.parentId || !tasksById.value.has(t.parentId)) continue
        const list = map.get(t.parentId) ?? []
        list.push(t)
        map.set(t.parentId, list)
    }
    for (const list of map.values()) list.sort(byOrder)
    return map
})

function byOrder(a: KanbanTask, b: KanbanTask) {
    return a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)
}

const childrenOf = (id: string) => childrenMap.value.get(id) ?? []
const isTopLevel = (t: KanbanTask) => !t.parentId || !tasksById.value.has(t.parentId)

function isDescendant(ancestorId: string, maybeDescendantId: string): boolean {
    let cur = tasksById.value.get(maybeDescendantId)
    for (let guard = 0; cur?.parentId && guard < 100; guard++) {
        if (cur.parentId === ancestorId) return true
        cur = tasksById.value.get(cur.parentId)
    }
    return false
}

const canNest = (childId: string, parentId: string) =>
    childId !== parentId && !isDescendant(childId, parentId) && tasksById.value.get(childId)?.parentId !== parentId

// ── admin priority ordering ──
const canReorder = (dragId: string, targetId: string) =>
    isAdmin() && dragId !== targetId && !isDescendant(dragId, targetId) && !!tasksById.value.get(dragId)?.canEdit

/** Cards that share a list with `task`: same lane for top-level cards, same parent for children. */
function siblingsOf(task: KanbanTask, excludeId: string) {
    return tasks.value
        .filter(t => t.id !== excludeId && (isTopLevel(task)
            ? isTopLevel(t) && t.status === task.status
            : t.parentId === task.parentId))
        .sort(byOrder)
}

function placeRelative(dragId: string, targetId: string, where: "before" | "after") {
    const dragged = tasksById.value.get(dragId)
    const target = tasksById.value.get(targetId)
    if (!dragged || !target || !canReorder(dragId, targetId)) return

    const siblings = siblingsOf(target, dragId)
    const i = siblings.findIndex(t => t.id === targetId)
    const neighbour = where === "before" ? siblings[i - 1] : siblings[i + 1]
    const step = where === "before" ? -1000 : 1000
    let sortOrder = neighbour ? (neighbour.sortOrder + target.sortOrder) / 2 : target.sortOrder + step
    // Neighbours with equal orders leave no gap: fall back to just past the target.
    if (sortOrder === target.sortOrder) sortOrder = target.sortOrder + step / 1e6

    const patch: KanbanTaskPatch = { sortOrder }
    const parentId = isTopLevel(target) ? null : target.parentId
    if ((dragged.parentId ?? null) !== parentId) patch.parentId = parentId
    if (isTopLevel(target) && dragged.status !== target.status) patch.status = target.status
    update(dragId, patch)
}

const parentOptions = (childId: string) =>
    tasks.value.filter(t => t.id !== childId && !isDescendant(childId, t.id)).sort(byOrder)

// ── tag filter (a card shows when it, or any of its descendants, has any selected tag) ──
const selectedTags = ref<string[]>([])

function toggleTag(tag: string) {
    const lower = tag.toLowerCase()
    selectedTags.value = selectedTags.value.some(t => t.toLowerCase() === lower)
        ? selectedTags.value.filter(t => t.toLowerCase() !== lower)
        : [...selectedTags.value, tag]
}

function matchesFilter(task: KanbanTask) {
    if (!selectedTags.value.length) return true
    const wanted = new Set(selectedTags.value.map(t => t.toLowerCase()))
    return task.tags.some(t => wanted.has(t.toLowerCase()))
}

function subtreeMatches(task: KanbanTask, depth = 0): boolean {
    return matchesFilter(task) || (depth < 50 && childrenOf(task.id).some(c => subtreeMatches(c, depth + 1)))
}

const allTags = computed(() => {
    const counts = new Map<string, [string, number]>()
    for (const t of tasks.value) for (const tag of t.tags) {
        const key = tag.toLowerCase()
        const entry = counts.get(key)
        counts.set(key, entry ? [entry[0], entry[1] + 1] : [tag, 1])
    }
    return [...counts.values()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

const laneTasks = (status: KanbanStatus) =>
    tasks.value.filter(t => t.status === status && isTopLevel(t) && subtreeMatches(t)).sort(byOrder)

// Only the first few cards of each lane show until its "Show all" bar is clicked.
const LANE_PREVIEW = 5
const expandedLanes = ref(new Set<KanbanStatus>())
function toggleLane(status: KanbanStatus) {
    const next = new Set(expandedLanes.value)
    if (!next.delete(status)) next.add(status)
    expandedLanes.value = next
}
const visibleLaneTasks = (status: KanbanStatus) => {
    const all = laneTasks(status)
    return expandedLanes.value.has(status) ? all : all.slice(0, LANE_PREVIEW)
}

// ── data ──
async function reload(silent = false) {
    if (loading.value) return
    loading.value = true
    try {
        const board = await loadKanbanBoard()
        tasks.value = board.tasks
        comments.value = board.comments
        lastLoaded.value = new Date()
        if (!silent) error.value = ""
    } catch (err: any) {
        console.error("Failed loading kanban tasks", err)
        error.value = `Could not load the board: ${err?.message ?? err}`
    } finally {
        loading.value = false
    }
}

const statusLine = computed(() => {
    if (loading.value) return "Loading…"
    if (!lastLoaded.value) return ""
    return `${tasks.value.length} tasks · updated ${lastLoaded.value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
})

function replaceLocal(task: KanbanTask) {
    const i = tasks.value.findIndex(t => t.id === task.id)
    if (i >= 0) tasks.value.splice(i, 1, task)
    else tasks.value.push(task)
}

async function update(id: string, patch: KanbanTaskPatch) {
    const before = tasksById.value.get(id)
    if (!before?.canEdit) return
    replaceLocal({ ...before, ...patch }) // optimistic
    try {
        replaceLocal(await updateKanbanTask(id, patch, before))
        error.value = ""
    } catch (err: any) {
        console.error("Failed updating kanban task", err)
        const current = tasksById.value.get(id)
        if (current) replaceLocal(before)
        error.value = `Could not save the change: ${err?.message ?? err}`
    }
}

async function remove(id: string) {
    if (!tasksById.value.get(id)?.canEdit) return
    const snapshot = tasks.value.slice()
    // Children are promoted to top level, matching ON DELETE SET NULL.
    tasks.value = tasks.value.filter(t => t.id !== id).map(t => (t.parentId === id ? { ...t, parentId: null } : t))
    try {
        await deleteKanbanTask(id)
        comments.value = comments.value.filter(c => c.taskId !== id)
        error.value = ""
    } catch (err: any) {
        console.error("Failed deleting kanban task", err)
        tasks.value = snapshot
        error.value = `Could not delete the task: ${err?.message ?? err}`
    }
}

async function addChild(parentId: string, title: string) {
    const parent = tasksById.value.get(parentId)
    try {
        replaceLocal(await addKanbanTask({
            title,
            parentId,
            category: parent?.category ?? "feature",
            status: "todo",
            tags: [],
            sortOrder: Date.now(),
        }))
        error.value = ""
    } catch (err: any) {
        console.error("Failed adding kanban child task", err)
        error.value = `Could not add the task: ${err?.message ?? err}`
    }
}

// ── comments ──
const commentsByTask = computed(() => {
    const map = new Map<string, KanbanComment[]>()
    for (const c of comments.value) {
        const list = map.get(c.taskId) ?? []
        list.push(c)
        map.set(c.taskId, list)
    }
    return map
})
const commentsOf = (taskId: string) => commentsByTask.value.get(taskId) ?? []

async function addComment(taskId: string, body: string) {
    try {
        comments.value = [...comments.value, await addKanbanComment(taskId, body)]
        error.value = ""
        return true
    } catch (err: any) {
        console.error("Failed adding kanban comment", err)
        error.value = `Could not post the comment: ${err?.message ?? err}`
        return false
    }
}

async function removeComment(commentId: string) {
    const snapshot = comments.value
    comments.value = comments.value.filter(c => c.id !== commentId)
    try {
        await deleteKanbanComment(commentId)
        error.value = ""
    } catch (err: any) {
        console.error("Failed deleting kanban comment", err)
        comments.value = snapshot
        error.value = `Could not delete the comment: ${err?.message ?? err}`
    }
}

// ── add form ──
const newTitle = ref("")
const newCategory = ref<KanbanCategory>("feature")
const newTags = ref("")
const newDescription = ref("")
const adding = ref(false)
const canAdd = computed(() => !!newTitle.value.trim() && !!newDescription.value.trim() && !adding.value)

async function addTask() {
    const title = newTitle.value.trim()
    const description = newDescription.value.trim()
    if (!title || !description || adding.value) return
    adding.value = true
    try {
        replaceLocal(await addKanbanTask({
            title,
            description,
            category: newCategory.value,
            status: "todo",
            tags: mergeTags([], newTags.value),
            sortOrder: Date.now(),
        }))
        newTitle.value = ""
        newTags.value = ""
        newDescription.value = ""
        error.value = ""
    } catch (err: any) {
        console.error("Failed adding kanban task", err)
        error.value = `Could not add the task: ${err?.message ?? err}`
    } finally {
        adding.value = false
    }
}

// ── lane drag & drop: dropping on a lane sets the status and makes the card top level ──
const dragId = ref<string | null>(null)
const laneHover = ref<KanbanStatus | null>(null)

function onLaneDragOver(e: DragEvent, status: KanbanStatus) {
    if (!dragId.value || !tasksById.value.get(dragId.value)?.canEdit) return
    e.preventDefault()
    laneHover.value = status
}
function onLaneDragLeave(e: DragEvent, status: KanbanStatus) {
    const lane = e.currentTarget as HTMLElement
    if (laneHover.value === status && !lane.contains(e.relatedTarget as Node | null)) laneHover.value = null
}
function onLaneDrop(e: DragEvent, status: KanbanStatus) {
    laneHover.value = null
    const id = dragId.value
    dragId.value = null
    if (!id) return
    e.preventDefault()
    const task = tasksById.value.get(id)
    if (!task?.canEdit) return
    const patch: KanbanTaskPatch = {}
    if (task.status !== status) patch.status = status
    if (task.parentId) patch.parentId = null
    if (task.status !== status || task.parentId) patch.sortOrder = Date.now()
    if (Object.keys(patch).length) update(id, patch)
}

provide(KANBAN_CTX, {
    tasksById, childrenOf, parentOptions, canNest, canReorder, placeRelative, update, remove, addChild,
    commentsOf, addComment, removeComment,
    selectedTags, toggleTag, matchesFilter, dragId,
})

// Others edit the same board: refresh on focus and every 30s while the tab is visible.
let timer: ReturnType<typeof setInterval> | undefined
const onFocus = () => reload(true)
onMounted(() => {
    reload()
    window.addEventListener("focus", onFocus)
    timer = setInterval(() => {
        if (document.visibilityState === "visible" && !dragId.value) reload(true)
    }, 30_000)
})
onBeforeUnmount(() => {
    window.removeEventListener("focus", onFocus)
    clearInterval(timer)
})
</script>

<style scoped>
.setup-page { padding: 0 0 4rem; }

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

input {
    font: inherit;
    color: var(--text);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.45rem 0.65rem;
}
input:focus { outline: none; border-color: var(--accent-strong); }

.add-title { flex: 1 1 20rem; min-width: 12rem; }
.add-tags { flex: 0 1 14rem; }
.add-description {
    flex: 1 1 100%;
    font: inherit;
    color: var(--text);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.45rem 0.65rem;
    resize: vertical;
    min-height: 3.5rem;
}
.add-description:focus { outline: none; border-color: var(--accent-strong); }

.cat-toggle { display: inline-flex; gap: 0.25rem; }
.cat-btn {
    --cat: #4cd68a;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
}
.cat-btn.cat-bug { --cat: #ff6b5e; }
.cat-btn.on {
    border-color: var(--cat);
    color: var(--cat);
    background: color-mix(in srgb, var(--cat) 18%, transparent);
}

button {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.8rem;
    cursor: pointer;
}
button:disabled { opacity: 0.5; cursor: default; }
.add-btn { background: var(--accent-glow-strong); border-color: var(--border-strong); color: var(--accent); font-weight: 600; }
.ghost-btn { background: transparent; }

.filters-heading {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    opacity: 0.7;
}
.chip {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--muted);
    user-select: none;
}
.chip.active { background: var(--accent-glow); border-color: var(--border-strong); color: var(--accent); }
.spacer { flex: 1; }
.dim { color: var(--muted); opacity: 0.8; }
.small { font-size: 0.8rem; }
.error-message { color: var(--danger); }

.board {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    align-items: start;
    margin-top: 0.4rem;
}

.lane {
    --lane: var(--muted);
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.6rem;
    min-height: 12rem;
    transition: border-color 0.15s, background 0.15s;
}
.lane-in_progress { --lane: var(--info); }
.lane-done { --lane: var(--success); }
.lane.drop-target { border-color: var(--lane); background: color-mix(in srgb, var(--lane) 6%, var(--panel)); }

.lane-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.1rem 0.25rem 0.55rem;
}
.lane-head h2 { margin: 0; font-size: 1rem; color: var(--text); }
.lane-dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--lane); }
.lane-count {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--muted);
    background: var(--bg-soft);
    border-radius: 20px;
    padding: 0.05rem 0.5rem;
    font-variant-numeric: tabular-nums;
}

.lane-body { display: flex; flex-direction: column; gap: 0.5rem; }
.lane-empty {
    margin: 0;
    padding: 1.5rem 0.5rem;
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    color: var(--muted);
    font-size: 0.85rem;
    opacity: 0.7;
}

.lane-more {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.4rem;
    font-size: 0.8rem;
    color: var(--muted);
    background: var(--bg-soft);
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
}
.lane-more:hover { color: var(--text); border-color: var(--border-strong); background: var(--accent-glow); }

.hint { margin-top: 1rem; }
</style>
