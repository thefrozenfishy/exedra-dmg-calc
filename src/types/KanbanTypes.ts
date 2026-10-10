export type KanbanStatus = "todo" | "in_progress" | "done"
export type KanbanCategory = "bug" | "feature"

/** Who posted a task or comment. The poster's user_id is never sent to clients. */
export interface KanbanAuthor {
    name: string | null
    friendId: string | null
    isMine: boolean
}

export interface KanbanTask {
    id: string
    parentId: string | null
    title: string
    description: string
    category: KanbanCategory
    status: KanbanStatus
    tags: string[]
    sortOrder: number
    createdAt: string
    updatedAt: string
    author: KanbanAuthor
    /** The viewer wrote this task or is an admin. */
    canEdit: boolean
}

export interface KanbanComment {
    id: string
    taskId: string
    body: string
    createdAt: string
    author: KanbanAuthor
    /** The viewer wrote this comment or is an admin. */
    canDelete: boolean
}

/** The fields a client may write; everything else is owned by the database. */
export type KanbanTaskPatch = Partial<Pick<KanbanTask, "parentId" | "title" | "description" | "category" | "status" | "tags" | "sortOrder">>

export const KANBAN_STATUSES: { key: KanbanStatus; label: string }[] = [
    { key: "todo", label: "To-Do" },
    { key: "in_progress", label: "In-Progress" },
    { key: "done", label: "Done" },
]

export function authorLabel(author: KanbanAuthor): string {
    return author.name || author.friendId || "Anonymous"
}
