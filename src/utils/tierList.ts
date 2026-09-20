import type { SavedTierList, SyncMeta, TierListRow, TierRow } from "../types/TierListTypes"

// Kept well inside the CHECK constraints in 0021_tier_lists.sql.
export const MAX_TIER_ROWS = 30
export const MAX_NAME_LENGTH = 100
export const MAX_LABEL_LENGTH = 100

const MAX_PLACED_CHARACTERS = 2000
const FALLBACK_COLOR = "#888888"
const HEX_COLOR = /^#[0-9a-f]{6}$/i
// Row ids key `placements`, so keep them to a safe charset (no "__proto__", no whitespace).
const SAFE_ID = /^[A-Za-z0-9-]{1,64}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value)

export const clampName = (value: unknown, fallback = ""): string =>
    typeof value === "string" ? value.slice(0, MAX_NAME_LENGTH) : fallback

const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

/**
 * Tier list JSON can come from other users (shared links) or from a cloud row, so nothing in it is
 * trusted: colours end up in inline styles (a `url(...)` would be a tracking pixel), row ids become
 * object keys, and character ids drive `:key`s. Everything is coerced into the shape the page expects.
 */
export function sanitizeBoard(rawRows: unknown, rawPlacements: unknown): Pick<SavedTierList, "rows" | "placements"> {
    const placementsIn = asRecord(rawPlacements)
    const rows: TierRow[] = []
    const placements: Record<string, number[]> = {}
    const seenChars = new Set<number>()
    const seenRowIds = new Set<string>()
    let placed = 0

    for (const raw of (Array.isArray(rawRows) ? rawRows : []).slice(0, MAX_TIER_ROWS)) {
        const r = asRecord(raw)
        const originalId = typeof r.id === "string" ? r.id : ""
        let id = SAFE_ID.test(originalId) ? originalId : crypto.randomUUID()
        if (seenRowIds.has(id)) id = crypto.randomUUID()
        seenRowIds.add(id)

        rows.push({
            id,
            label: typeof r.label === "string" ? r.label.slice(0, MAX_LABEL_LENGTH) : "",
            color: typeof r.color === "string" && HEX_COLOR.test(r.color) ? r.color : FALLBACK_COLOR,
        })

        const ids: number[] = []
        const source = hasOwn(placementsIn, originalId) ? placementsIn[originalId] : []
        for (const c of Array.isArray(source) ? source : []) {
            // A character can only sit in one place, and duplicate ids would break the keyed v-for.
            if (!Number.isInteger(c) || c < 0 || c > 1e9 || seenChars.has(c) || placed >= MAX_PLACED_CHARACTERS) continue
            seenChars.add(c)
            ids.push(c)
            placed++
        }
        placements[id] = ids
    }

    return { rows, placements }
}

const parseTime = (iso: string): number => {
    const t = Date.parse(iso)
    return Number.isFinite(t) ? t : Date.now()
}

/** Turns a cloud row into a local list. The local `updatedAt` mirrors the server's so it starts out "clean". */
export function rowToList(row: TierListRow): SavedTierList {
    return {
        id: row.list_id,
        name: clampName(row.name),
        ...sanitizeBoard(row.rows, row.placements),
        shared: !!row.is_shared,
        createdAt: parseTime(row.created_at),
        updatedAt: parseTime(row.updated_at),
    }
}

export const sameOrder = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every((id, i) => id === b[i])

/** Edited locally since the last successful sync (or never synced at all). */
export const isDirty = (list: SavedTierList, meta: Record<string, SyncMeta>): boolean =>
    meta[list.id]?.local !== list.updatedAt

export interface SyncPlan {
    /** Cloud rows to write locally: lists from other devices, or ones changed elsewhere (the server wins). */
    adopt: TierListRow[]
    /** Local lists deleted on another device that have no unsynced edits here. */
    removeLocal: string[]
    /** Cloud rows the user deleted locally while offline (or before the delete request finished). */
    deleteRemote: string[]
    /** Lists where unsynced local edits are being replaced by a newer cloud version. */
    overwritten: string[]
    /** New local order when the cloud's order changed elsewhere, otherwise null (keep local order). */
    order: string[] | null
}

/**
 * Decides how to reconcile local lists with the cloud. Pure, so the interesting cases can be tested.
 *
 * Policy: the server wins when a list changed elsewhere; edits that are only local are pushed later
 * (callers push every list where `isDirty` is true once the plan has been applied).
 * `cloud` must already be sorted by (sort_order, created_at).
 */
export function planSync(input: {
    local: Record<string, SavedTierList>
    localOrder: string[]
    meta: Record<string, SyncMeta>
    syncedOrder: string[]
    pendingDeletes: string[]
    cloud: TierListRow[]
}): SyncPlan {
    const { local, meta } = input
    const pending = new Set(input.pendingDeletes)
    const cloudIds = new Set(input.cloud.map(c => c.list_id))
    const plan: SyncPlan = { adopt: [], removeLocal: [], deleteRemote: [], overwritten: [], order: null }

    for (const c of input.cloud) {
        const id = c.list_id
        if (pending.has(id)) {
            plan.deleteRemote.push(id)
            continue
        }
        const l = local[id]
        if (!l) {
            plan.adopt.push(c)
            continue
        }
        const m = meta[id]
        if (m && m.server === c.updated_at) continue // cloud unchanged since we last synced
        // Changed elsewhere, or we have no record of syncing it: take the cloud copy.
        plan.adopt.push(c)
        if (m && isDirty(l, meta)) plan.overwritten.push(id)
    }

    for (const l of Object.values(local)) {
        if (cloudIds.has(l.id)) continue
        // Not in the cloud. If we never synced it, it is simply new; otherwise it was deleted elsewhere,
        // which we honour unless there are local edits (those get pushed and re-create it).
        if (meta[l.id] && !isDirty(l, meta)) plan.removeLocal.push(l.id)
    }

    const cloudOrder = input.cloud.filter(c => !pending.has(c.list_id)).map(c => c.list_id)
    const synced = input.syncedOrder.filter(id => cloudIds.has(id) && !pending.has(id))
    if (!sameOrder(cloudOrder, synced)) {
        const gone = new Set(plan.removeLocal)
        plan.order = [...cloudOrder, ...input.localOrder.filter(id => hasOwn(local, id) && !cloudOrder.includes(id) && !gone.has(id))]
    }

    return plan
}
