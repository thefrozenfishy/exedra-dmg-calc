import type { SyncMeta } from "../types/TierListTypes"

// Reconciliation rules shared by every "local items, backed up to the cloud" feature (tier lists,
// saved teams). Items only need an id and a local `updatedAt`; cloud rows an id and the server's
// `updated_at` token.

export interface CloudItem {
    id: string
    updatedAt: number
}

export interface CloudRow {
    list_id: string
    updated_at: string
}

const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)

export const sameOrder = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every((id, i) => id === b[i])

/** Edited locally since the last successful sync (or never synced at all). */
export const isDirty = (list: CloudItem, meta: Record<string, SyncMeta>): boolean =>
    meta[list.id]?.local !== list.updatedAt

export interface SyncPlan<R extends CloudRow = CloudRow> {
    /** Cloud rows to write locally: lists from other devices, or ones changed elsewhere (the server wins). */
    adopt: R[]
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
export function planSync<L extends CloudItem, R extends CloudRow>(input: {
    local: Record<string, L>
    localOrder: string[]
    meta: Record<string, SyncMeta>
    syncedOrder: string[]
    pendingDeletes: string[]
    cloud: R[]
}): SyncPlan<R> {
    const { local, meta } = input
    const pending = new Set(input.pendingDeletes)
    const cloudIds = new Set(input.cloud.map(c => c.list_id))
    const plan: SyncPlan<R> = { adopt: [], removeLocal: [], deleteRemote: [], overwritten: [], order: null }

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
