import type { InjectionKey, Ref } from "vue"
import type { KanbanComment, KanbanTask, KanbanTaskPatch } from "../../types/KanbanTypes"

export interface KanbanContext {
    tasksById: Ref<Map<string, KanbanTask>>
    childrenOf: (id: string) => KanbanTask[]
    /** Every task that `childId` may be moved under (not itself, not one of its descendants). */
    parentOptions: (childId: string) => KanbanTask[]
    canNest: (childId: string, parentId: string) => boolean
    /** Admins can drop a card before/after another card to set its priority. */
    canReorder: (dragId: string, targetId: string) => boolean
    placeRelative: (dragId: string, targetId: string, where: "before" | "after") => void
    update: (id: string, patch: KanbanTaskPatch) => Promise<void>
    remove: (id: string) => Promise<void>
    addChild: (parentId: string, title: string) => Promise<void>
    commentsOf: (taskId: string) => KanbanComment[]
    /** Resolves to true when the comment was posted. */
    addComment: (taskId: string, body: string) => Promise<boolean>
    removeComment: (commentId: string) => Promise<void>
    selectedTags: Ref<string[]>
    toggleTag: (tag: string) => void
    /** Whether the task itself carries one of the selected tags (true when no filter is active). */
    matchesFilter: (task: KanbanTask) => boolean
    dragId: Ref<string | null>
}

export const KANBAN_CTX: InjectionKey<KanbanContext> = Symbol("kanban")

export function normalizeTag(raw: string): string {
    return raw.trim().replace(/\s+/g, " ").slice(0, 40)
}

/** Adds the tags in `raw` (comma separated) to `existing`, de-duplicated case-insensitively. */
export function mergeTags(existing: string[], raw: string): string[] {
    const out = [...existing]
    const seen = new Set(out.map(t => t.toLowerCase()))
    for (const part of raw.split(",")) {
        const tag = normalizeTag(part)
        if (!tag || seen.has(tag.toLowerCase())) continue
        seen.add(tag.toLowerCase())
        out.push(tag)
    }
    return out.slice(0, 20)
}

export function shortDate(iso: string): string {
    const d = new Date(iso)
    const sameYear = d.getFullYear() === new Date().getFullYear()
    return d.toLocaleDateString([], { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) })
}

export function fullDate(iso: string): string {
    return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
}
