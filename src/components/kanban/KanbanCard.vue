<template>
    <div class="k-card" :class="[`cat-${task.category}`, {
        nested, dimmed: !matchesFilter(task) && selectedTags.length > 0, 'drop-target': dropZone === 'inside', 'drop-before': dropZone === 'before',
        'drop-after': dropZone === 'after',
        dragging: dragId === task.id, done: nested && task.status === 'done', locked: !task.canEdit
    }]" :draggable="task.canEdit && dragArmed" @mousedown.capture="armDrag" @dragstart.stop="onDragStart" @dragend="onDragEnd" @dragover="onDragOver"
        @dragleave="onDragLeave" @drop="onDrop">
        <div class="k-head">
            <button class="k-cat" :disabled="!task.canEdit"
                :title="task.canEdit ? `Category: ${task.category} (click to switch)` : `Category: ${task.category}`"
                @click="ctx.update(task.id, { category: task.category === 'bug' ? 'feature' : 'bug' })">
                {{ task.category === 'bug' ? 'Bug' : 'Feature' }}
            </button>

            <div v-if="nested" class="k-status-pills" role="group" aria-label="Status">
                <button v-for="s in KANBAN_STATUSES" :key="s.key" class="k-pill" :class="[`st-${s.key}`, { on: task.status === s.key }]"
                    :disabled="!task.canEdit" @click="ctx.update(task.id, { status: s.key })">{{ s.label }}</button>
            </div>

            <span v-if="children.length" class="k-progress" :title="`${doneCount} of ${children.length} children done`">
                {{ doneCount }}/{{ children.length }}
            </span>

            <div class="k-actions">
                <button class="k-icon" title="Add child task" @click="startChild">＋</button>
                <button v-if="task.canEdit" class="k-icon" :class="{ on: menuOpen }" title="More" @click="menuOpen = !menuOpen">⋯</button>
            </div>
        </div>

        <textarea v-if="editing" ref="titleInput" v-model="draftTitle" class="k-title-edit" rows="2"
            @keydown.enter.exact.prevent="saveTitle" @keydown.esc="editing = false" @blur="saveTitle" />
        <p v-else class="k-title" :title="task.canEdit ? 'Double-click to edit' : undefined" @dblclick="startEdit">{{ task.title }}</p>

        <textarea v-if="editingDesc" ref="descInput" v-model="draftDesc" class="k-desc-edit" rows="4" maxlength="5000"
            placeholder="Description" @keydown.esc="editingDesc = false" @keydown.enter.ctrl.prevent="saveDesc"
            @blur="saveDesc" />
        <p v-else-if="task.description" class="k-desc" :class="{ clamped: !descExpanded }"
            :title="task.canEdit ? 'Double-click to edit' : undefined" @dblclick="startDesc" @click="descExpanded = !descExpanded">{{ task.description }}</p>

        <div class="k-tags">
            <span v-for="tag in task.tags" :key="tag" class="k-tag" :class="{ active: isSelected(tag) }">
                <span class="k-tag-label" title="Filter by this tag" @click="ctx.toggleTag(tag)">#{{ tag }}</span>
                <button v-if="task.canEdit" class="k-tag-x" title="Remove tag" @click="removeTag(tag)">×</button>
            </span>
            <input v-if="addingTag" ref="tagInput" v-model="draftTag" class="k-tag-input" placeholder="tag"
                @keydown.enter.prevent="saveTag" @keydown.esc="addingTag = false" @blur="saveTag" />
            <button v-else-if="task.canEdit" class="k-tag-add" @click="startTag">+ tag</button>
        </div>

        <div class="k-meta">
            <span class="k-author" :class="{ mine: task.author.isMine }" :title="fullDate(task.createdAt)">
                by {{ authorLabel(task.author) }} · {{ shortDate(task.createdAt) }}
            </span>
            <button class="k-comments-btn" :class="{ on: commentsOpen, has: comments.length }"
                :title="commentsOpen ? 'Hide comments' : 'Show comments'" @click="toggleComments">
                💬 {{ comments.length || '' }}
            </button>
        </div>

        <div v-if="commentsOpen" class="k-comments">
            <div v-for="c in comments" :key="c.id" class="k-comment">
                <div class="k-comment-head">
                    <strong :class="{ mine: c.author.isMine }">{{ authorLabel(c.author) }}</strong>
                    <span class="k-comment-date" :title="fullDate(c.createdAt)">{{ shortDate(c.createdAt) }}</span>
                    <button v-if="c.canDelete" class="k-comment-x" title="Delete comment"
                        @click="ctx.removeComment(c.id)">×</button>
                </div>
                <p class="k-comment-body">{{ c.body }}</p>
            </div>
            <p v-if="!comments.length" class="k-comment-empty">No comments yet.</p>
            <div class="k-comment-new">
                <textarea ref="commentInput" v-model="draftComment" rows="2" maxlength="2000"
                    placeholder="Write a comment… (Enter to post, Shift+Enter for a new line)"
                    @keydown.enter.exact.prevent="postComment" />
                <button class="k-comment-post" :disabled="!draftComment.trim() || posting" @click="postComment">Post</button>
            </div>
        </div>

        <div v-if="menuOpen && task.canEdit" class="k-menu">
            <label>
                <span>Child of</span>
                <select :value="task.parentId ?? ''" @change="onParentChange">
                    <option value="">— none (top level) —</option>
                    <option v-for="p in ctx.parentOptions(task.id)" :key="p.id" :value="p.id">
                        {{ short(p.title) }}
                    </option>
                </select>
            </label>
            <label v-if="!nested">
                <span>Status</span>
                <select :value="task.status" @change="ctx.update(task.id, { status: ($event.target as HTMLSelectElement).value as KanbanStatus })">
                    <option v-for="s in KANBAN_STATUSES" :key="s.key" :value="s.key">{{ s.label }}</option>
                </select>
            </label>
            <button class="k-menu-btn" @click="startEdit(); menuOpen = false">Edit title</button>
            <button class="k-menu-btn" @click="startDesc(); menuOpen = false">
                {{ task.description ? 'Edit description' : 'Add description' }}
            </button>
            <button class="k-delete" :class="{ confirm: confirmDelete }" @click="onDelete">
                {{ confirmDelete ? 'Click again to delete' : 'Delete task' }}
            </button>
        </div>

        <div v-if="children.length || addingChild" class="k-children">
            <KanbanCard v-for="child in children" :key="child.id" :task="child" nested />
            <input v-if="addingChild" ref="childInput" v-model="draftChild" class="k-child-input"
                placeholder="New child task… (Enter to add)" @keydown.enter.prevent="saveChild"
                @keydown.esc="addingChild = false" @blur="onChildBlur" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref } from "vue"
import { KANBAN_STATUSES, authorLabel, type KanbanStatus, type KanbanTask } from "../../types/KanbanTypes"
import { KANBAN_CTX, fullDate, mergeTags, shortDate } from "./kanbanContext"

const props = defineProps<{ task: KanbanTask; nested?: boolean }>()

const ctx = inject(KANBAN_CTX)!
const { selectedTags, matchesFilter, dragId } = ctx

const children = computed(() => ctx.childrenOf(props.task.id))
const doneCount = computed(() => children.value.filter(c => c.status === "done").length)

const isSelected = (tag: string) => selectedTags.value.some(t => t.toLowerCase() === tag.toLowerCase())
const short = (s: string) => (s.length > 60 ? s.slice(0, 57) + "…" : s)

// ── title ──
const editing = ref(false)
const draftTitle = ref("")
const titleInput = ref<HTMLTextAreaElement>()
async function startEdit() {
    if (!props.task.canEdit) return
    draftTitle.value = props.task.title
    editing.value = true
    await nextTick()
    titleInput.value?.focus()
}
function saveTitle() {
    if (!editing.value) return
    editing.value = false
    const title = draftTitle.value.trim()
    if (title && title !== props.task.title) ctx.update(props.task.id, { title })
}

// ── description ──
const editingDesc = ref(false)
const descExpanded = ref(false)
const draftDesc = ref("")
const descInput = ref<HTMLTextAreaElement>()
async function startDesc() {
    if (!props.task.canEdit) return
    draftDesc.value = props.task.description
    editingDesc.value = true
    await nextTick()
    descInput.value?.focus()
}
function saveDesc() {
    if (!editingDesc.value) return
    editingDesc.value = false
    const description = draftDesc.value.trim()
    if (description !== props.task.description) ctx.update(props.task.id, { description })
}

// ── tags ──
const addingTag = ref(false)
const draftTag = ref("")
const tagInput = ref<HTMLInputElement>()
async function startTag() {
    draftTag.value = ""
    addingTag.value = true
    await nextTick()
    tagInput.value?.focus()
}
function saveTag() {
    if (!addingTag.value) return
    addingTag.value = false
    const tags = mergeTags(props.task.tags, draftTag.value)
    if (tags.length !== props.task.tags.length) ctx.update(props.task.id, { tags })
}
function removeTag(tag: string) {
    ctx.update(props.task.id, { tags: props.task.tags.filter(t => t !== tag) })
}

// ── children ──
const addingChild = ref(false)
const draftChild = ref("")
const childInput = ref<HTMLInputElement>()
async function startChild() {
    draftChild.value = ""
    addingChild.value = true
    await nextTick()
    childInput.value?.focus()
}
async function saveChild() {
    const title = draftChild.value.trim()
    if (!title) return
    draftChild.value = ""
    await ctx.addChild(props.task.id, title)
    await nextTick()
    childInput.value?.focus()
}
function onChildBlur() {
    if (!draftChild.value.trim()) addingChild.value = false
}

// ── comments ──
const comments = computed(() => ctx.commentsOf(props.task.id))
const commentsOpen = ref(false)
const draftComment = ref("")
const posting = ref(false)
const commentInput = ref<HTMLTextAreaElement>()
async function toggleComments() {
    commentsOpen.value = !commentsOpen.value
    if (commentsOpen.value) {
        await nextTick()
        commentInput.value?.focus()
    }
}
async function postComment() {
    const body = draftComment.value.trim()
    if (!body || posting.value) return
    posting.value = true
    try {
        if (await ctx.addComment(props.task.id, body)) draftComment.value = ""
    } finally {
        posting.value = false
    }
}

// ── menu ──
const menuOpen = ref(false)
const confirmDelete = ref(false)
function onParentChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value
    ctx.update(props.task.id, { parentId: value || null })
}
function onDelete() {
    if (!confirmDelete.value) {
        confirmDelete.value = true
        setTimeout(() => (confirmDelete.value = false), 3000)
        return
    }
    ctx.remove(props.task.id)
}

// ── drag & drop: drop onto the middle of a card to make it a child; admins can drop on the top/bottom edge
// to place the card before/after it (priority order) ──
type DropZone = "before" | "after" | "inside"
const dropZone = ref<DropZone | null>(null)
// Text fields inside a draggable element lose clicks/selection to the drag in some browsers,
// so the card is only draggable when the press didn't start on a field or button.
const dragArmed = ref(true)
function armDrag(e: MouseEvent) {
    const target = e.target as HTMLElement | null
    dragArmed.value = !target?.closest("input, textarea, select, button, .k-comments")
}
function onDragStart(e: DragEvent) {
    if (!props.task.canEdit) {
        e.preventDefault()
        return
    }
    dragId.value = props.task.id
    e.dataTransfer?.setData("text/plain", props.task.id)
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move"
}
function onDragEnd() {
    dragId.value = null
    dropZone.value = null
}
function zoneFor(e: DragEvent, id: string): DropZone | null {
    if (ctx.canReorder(id, props.task.id)) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const edge = Math.min(22, rect.height * 0.3)
        if (e.clientY < rect.top + edge) return "before"
        if (e.clientY > rect.bottom - edge) return "after"
    }
    return ctx.canNest(id, props.task.id) ? "inside" : null
}
function onDragOver(e: DragEvent) {
    const id = dragId.value
    if (!id) return
    const zone = zoneFor(e, id)
    if (!zone) {
        dropZone.value = null
        return
    }
    e.preventDefault()
    e.stopPropagation()
    dropZone.value = zone
}
function onDragLeave(e: DragEvent) {
    const card = e.currentTarget as HTMLElement
    if (!card.contains(e.relatedTarget as Node | null)) dropZone.value = null
}
function onDrop(e: DragEvent) {
    dropZone.value = null
    const id = dragId.value
    if (!id) return
    const zone = zoneFor(e, id)
    if (!zone) return
    e.preventDefault()
    e.stopPropagation()
    dragId.value = null
    if (zone === "inside") ctx.update(id, { parentId: props.task.id })
    else ctx.placeRelative(id, props.task.id, zone)
}
</script>

<style scoped>
.k-card {
    --cat: var(--success);
    position: relative;
    text-align: left;
    background: var(--panel-strong);
    border: 1px solid var(--border);
    border-left: 4px solid var(--cat);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    cursor: grab;
    transition: opacity 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.k-card.cat-bug { --cat: #ff6b5e; }
.k-card.cat-feature { --cat: #4cd68a; }

.k-card.nested {
    background: rgba(255, 255, 255, 0.03);
    padding: 0.4rem 0.5rem;
}

.k-card.dimmed { opacity: 0.45; }
.k-card.locked { cursor: default; }
.k-card.locked > .k-title { cursor: default; }
.k-cat:disabled, .k-pill:disabled { cursor: default; }
.k-pill:disabled:not(.on) { opacity: 0.45; }
.k-card.dragging { opacity: 0.35; }
.k-card.drop-target {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow-strong);
}
.k-card.drop-before::before,
.k-card.drop-after::after {
    content: "";
    position: absolute;
    left: -4px;
    right: 0;
    height: 3px;
    border-radius: 2px;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
    pointer-events: none;
}
.k-card.drop-before::before { top: -6px; }
.k-card.drop-after::after { bottom: -6px; }
.k-card.done > .k-title { text-decoration: line-through; color: var(--muted); }

.k-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
}

.k-cat {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.1rem 0.45rem;
    border-radius: 6px;
    border: 1px solid var(--cat);
    background: color-mix(in srgb, var(--cat) 18%, transparent);
    color: var(--cat);
    cursor: pointer;
}

.k-status-pills { display: inline-flex; gap: 2px; }
.k-pill {
    font-size: 0.66rem;
    padding: 0.08rem 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
}
.k-pill.on.st-todo { background: rgba(200, 185, 155, 0.18); color: var(--text); border-color: var(--muted); }
.k-pill.on.st-in_progress { background: rgba(139, 207, 249, 0.18); color: var(--info); border-color: var(--info); }
.k-pill.on.st-done { background: rgba(121, 213, 170, 0.18); color: var(--success); border-color: var(--success); }

.k-progress {
    font-size: 0.7rem;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
}

.k-actions { margin-left: auto; display: inline-flex; gap: 2px; }
.k-icon {
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    line-height: 1;
}
.k-icon:hover, .k-icon.on { background: var(--bg-soft); border-color: var(--border); color: var(--text); }

.k-title {
    margin: 0;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
    cursor: text;
}
.nested > .k-title { font-size: 0.9rem; }

.k-title-edit, .k-child-input, .k-tag-input {
    font: inherit;
    color: var(--text);
    background: var(--bg-soft);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    padding: 0.3rem 0.4rem;
    box-sizing: border-box;
}
.k-title-edit, .k-desc-edit { width: 100%; resize: vertical; }
.k-desc-edit {
    font: inherit;
    font-size: 0.85rem;
    color: var(--text);
    background: var(--bg-soft);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    padding: 0.3rem 0.4rem;
    box-sizing: border-box;
}
.k-desc {
    margin: 0;
    font-size: 0.84rem;
    color: var(--muted);
    white-space: pre-wrap;
    word-break: break-word;
    cursor: pointer;
}
.k-desc.clamped {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.k-menu-btn {
    font-size: 0.75rem;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    border-radius: 6px;
    padding: 0.15rem 0.5rem;
    cursor: pointer;
}
.k-child-input { width: 100%; font-size: 0.85rem; }
.k-tag-input { width: 6rem; font-size: 0.75rem; padding: 0.1rem 0.35rem; }

.k-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; }
.k-tag {
    display: inline-flex;
    align-items: center;
    font-size: 0.72rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    color: var(--muted);
    overflow: hidden;
}
.k-tag.active { background: var(--accent-glow-strong); border-color: var(--accent); color: var(--accent); }
.k-tag-label { padding: 0.05rem 0.2rem 0.05rem 0.45rem; cursor: pointer; }
.k-tag-x {
    border: none;
    background: transparent;
    color: inherit;
    padding: 0 0.35rem 0 0.15rem;
    cursor: pointer;
    opacity: 0.6;
}
.k-tag-x:hover { opacity: 1; }
.k-tag-add {
    font-size: 0.7rem;
    border: 1px dashed var(--border);
    background: transparent;
    color: var(--muted);
    border-radius: 20px;
    padding: 0.05rem 0.45rem;
    cursor: pointer;
    opacity: 0.6;
}
.k-card:hover > .k-tags > .k-tag-add { opacity: 1; }

.k-menu {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.75rem;
    align-items: center;
    padding: 0.4rem;
    border-radius: 8px;
    background: var(--bg-soft);
    font-size: 0.8rem;
    color: var(--muted);
}
.k-menu label { display: inline-flex; gap: 0.35rem; align-items: center; }
.k-menu select {
    max-width: 14rem;
    background: var(--panel-strong);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.15rem 0.3rem;
}
.k-delete {
    margin-left: auto;
    font-size: 0.75rem;
    border: 1px solid rgba(255, 155, 143, 0.35);
    background: transparent;
    color: var(--danger);
    border-radius: 6px;
    padding: 0.15rem 0.5rem;
    cursor: pointer;
}
.k-delete.confirm { background: rgba(255, 107, 94, 0.2); border-color: var(--danger); }

.k-children {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding-left: 0.5rem;
    border-left: 1px dashed var(--border);
    margin-left: 0.15rem;
}
.k-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: var(--muted);
}
.k-author { opacity: 0.75; }
.k-author.mine { color: var(--accent-soft); }
.k-comments-btn {
    margin-left: auto;
    font-size: 0.72rem;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    border-radius: 6px;
    padding: 0.05rem 0.35rem;
    cursor: pointer;
    opacity: 0.55;
}
.k-comments-btn.has { opacity: 0.9; }
.k-comments-btn:hover, .k-comments-btn.on { opacity: 1; background: var(--bg-soft); border-color: var(--border); color: var(--text); }

.k-comments {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.45rem;
    border-radius: 8px;
    background: var(--bg-soft);
    cursor: auto;
}
.k-comment { font-size: 0.82rem; }
.k-comment-head { display: flex; align-items: baseline; gap: 0.4rem; }
.k-comment-head strong { color: var(--text); font-size: 0.78rem; }
.k-comment-head strong.mine { color: var(--accent-soft); }
.k-comment-date { font-size: 0.7rem; color: var(--muted); }
.k-comment-x {
    margin-left: auto;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    padding: 0 0.2rem;
}
.k-comment-x:hover { color: var(--danger); }
.k-comment-body { margin: 0.1rem 0 0; color: var(--text); white-space: pre-wrap; word-break: break-word; }
.k-comment-empty { margin: 0; font-size: 0.78rem; color: var(--muted); opacity: 0.7; }
.k-comment-new { display: flex; gap: 0.35rem; align-items: flex-end; }
.k-comment-new textarea {
    flex: 1;
    font: inherit;
    font-size: 0.82rem;
    color: var(--text);
    background: var(--panel-strong);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.3rem 0.4rem;
    resize: vertical;
}
.k-comment-post {
    font-size: 0.75rem;
    border: 1px solid var(--border-strong);
    background: var(--accent-glow-strong);
    color: var(--accent);
    border-radius: 6px;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
}
.k-comment-post:disabled { opacity: 0.5; cursor: default; }
</style>
