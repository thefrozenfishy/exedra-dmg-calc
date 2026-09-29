import type { WritableComputedRef } from "vue"
import { useCloudListSync } from "./cloudListSync"
import { deleteTierList, loadMyTierLists, saveTierList, saveTierListOrder } from "./cloud"
import { clampName, rowToList, sanitizeBoard } from "../utils/tierList"
import type { SavedTierList } from "../types/TierListTypes"

export type { SyncStatus } from "./cloudListSync"

/** Cloud sync for the Tier List Maker; see useCloudListSync for how local and cloud state are reconciled. */
export function useTierListSync(
    lists: WritableComputedRef<Record<string, SavedTierList>>,
    order: WritableComputedRef<string[]>,
) {
    return useCloudListSync(lists, order, {
        settingsPrefix: "tierMaker",
        noun: "tier lists",
        load: loadMyTierLists,
        save: saveTierList,
        saveOrder: saveTierListOrder,
        remove: deleteTierList,
        rowToItem: rowToList,
        sanitize: list => ({ ...list, name: clampName(list.name), ...sanitizeBoard(list.rows, list.placements) }),
        displayName: list => list.name || "Untitled list",
    })
}
