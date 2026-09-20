import { onUnmounted, ref, watch, type WritableComputedRef } from "vue"
import debounce from "lodash.debounce"
import { toast } from "vue3-toastify"
import { useSetting } from "./settingsStore"
import { getUserId } from "./user"
import { deleteTierList, loadMyTierLists, saveTierList, saveTierListOrder } from "./cloud"
import { clampName, isDirty, planSync, rowToList, sameOrder, sanitizeBoard } from "../utils/tierList"
import type { SavedTierList, SyncMeta, TierListRow } from "../types/TierListTypes"

const PUSH_DELAY_MS = 1500
const PULL_COOLDOWN_MS = 30_000
const toastOpts = { position: toast.POSITION.TOP_RIGHT, icon: false } as const

export type SyncStatus = "off" | "idle" | "syncing" | "error"

/**
 * Keeps the locally persisted tier lists (the source of truth while editing, so the page works
 * offline and without a cloud account) in step with the user's cloud account.
 *
 * - Edits are pushed shortly after they happen; the server rejects a write if the list changed on
 *   another device since we last synced, and then the server's copy is adopted ("server wins").
 * - `pull()` (on load and when the tab regains focus) picks up lists from other devices, and
 *   replays deletes/edits that happened while offline.
 * - All network work runs through one queue, so a delete can never overtake the push of the same list.
 */
export function useTierListSync(
    lists: WritableComputedRef<Record<string, SavedTierList>>,
    order: WritableComputedRef<string[]>,
) {
    const meta = useSetting<Record<string, SyncMeta>>("tierMakerSyncMeta", {})
    const syncedOrder = useSetting<string[]>("tierMakerSyncedOrder", [])
    const pendingDeletes = useSetting<string[]>("tierMakerPendingDeletes", [])

    const active = () => !!getUserId()
    const status = ref<SyncStatus>(active() ? "idle" : "off")

    let chain: Promise<void> = Promise.resolve()
    let queued = 0
    let lastFailed = false
    let lastPull = 0

    function serial(task: () => Promise<void>): Promise<void> {
        queued++
        status.value = "syncing"
        chain = chain.then(async () => {
            try {
                await task()
                lastFailed = false
            } catch (err) {
                console.error("Tier list sync failed:", err)
                if (!lastFailed) {
                    toast.error("Couldn't sync your tier lists to the cloud. Your changes are saved on this device and will retry.", toastOpts)
                }
                lastFailed = true
            } finally {
                queued--
                if (queued === 0) status.value = lastFailed ? "error" : "idle"
            }
        })
        return chain
    }

    function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
        const { [key]: _dropped, ...rest } = record
        return rest
    }

    function adoptRows(rows: TierListRow[]) {
        const nextLists = { ...lists.value }
        const nextMeta = { ...meta.value }
        for (const row of rows) {
            const list = rowToList(row)
            nextLists[list.id] = list
            nextMeta[list.id] = { server: row.updated_at, local: list.updatedAt }
        }
        lists.value = nextLists
        meta.value = nextMeta
    }

    async function pushOne(id: string) {
        const list = lists.value[id]
        if (!list) return // deleted since it was queued

        const sentUpdatedAt = list.updatedAt
        const sent: SavedTierList = { ...list, name: clampName(list.name), ...sanitizeBoard(list.rows, list.placements) }
        const index = order.value.indexOf(id)

        const result = await saveTierList(sent, index === -1 ? order.value.length : index, meta.value[id]?.server ?? null)
        if (!result) return

        if (result.conflict) {
            adoptRows([result])
            toast.info(`"${sent.name || "Untitled list"}" was changed on another device, so the latest version was loaded.`, toastOpts)
        } else {
            meta.value = { ...meta.value, [id]: { server: result.updated_at, local: sentUpdatedAt } }
        }
    }

    async function pushDirty() {
        for (const list of Object.values(lists.value)) {
            if (isDirty(list, meta.value)) await pushOne(list.id)
        }
    }

    // sort_order is cloud state too, but it lives outside the per-list concurrency token.
    async function pushOrderIfChanged() {
        const known = new Set(Object.keys(meta.value))
        const all = [...order.value, ...Object.keys(lists.value).filter(id => !order.value.includes(id))]
        const local = all.filter(id => known.has(id) && lists.value[id])
        const synced = syncedOrder.value.filter(id => known.has(id))
        if (sameOrder(local, synced)) return

        await saveTierListOrder(local)
        syncedOrder.value = local
    }

    async function deleteRemote(id: string) {
        await deleteTierList(id)
        pendingDeletes.value = pendingDeletes.value.filter(x => x !== id)
        meta.value = withoutKey(meta.value, id)
        syncedOrder.value = syncedOrder.value.filter(x => x !== id)
    }

    /** Fetches the cloud state, reconciles it with the local lists, then uploads whatever is still local-only. */
    function pull(): Promise<void> {
        if (!active()) return Promise.resolve()
        lastPull = Date.now()

        return serial(async () => {
            const cloud = await loadMyTierLists()
            const plan = planSync({
                local: lists.value,
                localOrder: order.value,
                meta: meta.value,
                syncedOrder: syncedOrder.value,
                pendingDeletes: pendingDeletes.value,
                cloud,
            })

            for (const id of plan.deleteRemote) await deleteRemote(id)

            if (plan.adopt.length) adoptRows(plan.adopt)

            if (plan.removeLocal.length) {
                const gone = new Set(plan.removeLocal)
                lists.value = Object.fromEntries(Object.entries(lists.value).filter(([id]) => !gone.has(id)))
                meta.value = Object.fromEntries(Object.entries(meta.value).filter(([id]) => !gone.has(id)))
                order.value = order.value.filter(id => !gone.has(id))
            }

            if (plan.order) {
                order.value = plan.order
                syncedOrder.value = cloud.map(c => c.list_id).filter(id => !plan.deleteRemote.includes(id))
            }

            // Pending deletes for lists that aren't in the cloud have nothing left to delete.
            const stillInCloud = new Set(cloud.map(c => c.list_id))
            pendingDeletes.value = pendingDeletes.value.filter(id => stillInCloud.has(id))

            if (plan.overwritten.length) {
                toast.info("Some tier lists were updated on another device. The newer version replaced unsynced changes made here.", toastOpts)
            }

            await pushDirty()
            await pushOrderIfChanged()
        })
    }

    /** Uploads unsynced edits now. Resolves once everything queued so far has finished. */
    function flush(): Promise<void> {
        pushLater.cancel()
        if (!active()) return Promise.resolve()
        return serial(async () => {
            await pushDirty()
            await pushOrderIfChanged()
        })
    }

    /** Call after removing a list locally. */
    function remove(id: string): Promise<void> {
        if (!active()) return Promise.resolve()
        // Recorded even if the list never synced: a push may already be in flight, and the queue
        // guarantees this delete runs after it. If the request fails it is retried by the next pull().
        pendingDeletes.value = [...new Set([...pendingDeletes.value, id])]
        return serial(() => deleteRemote(id))
    }

    /** True when the cloud copy matches what's on screen. */
    function isSynced(id: string): boolean {
        const list = lists.value[id]
        return !!list && !isDirty(list, meta.value)
    }

    const pushLater = debounce(() => { void flush() }, PUSH_DELAY_MS)

    watch(lists, () => { if (active()) pushLater() }, { deep: true })
    watch(order, () => { if (active()) pushLater() }, { deep: true })

    const onFocus = () => {
        if (Date.now() - lastPull > PULL_COOLDOWN_MS) void pull()
    }
    const onOnline = () => { void pull() }
    window.addEventListener("focus", onFocus)
    window.addEventListener("online", onOnline)

    onUnmounted(() => {
        window.removeEventListener("focus", onFocus)
        window.removeEventListener("online", onOnline)
        pushLater.flush() // don't strand an edit made just before navigating away
    })

    return { status, pull, flush, remove, isSynced, active }
}
