// PvE Simulator "Max Damage" panel off the main thread: battle/EngineMaxDamage launches every skill in fresh engine
// battles (tens of battle setups per evaluation, ~0.3-1.5 s), too slow to run on the page while the user toggles
// effects. The page posts the inputs; a newer request supersedes an older one (only the latest is answered).
import "../models/BestTeamCalculator" // load order (Kioku <-> BestTeamCalculator cycle)
import { computeMaxDamageEngine } from "../battle/EngineMaxDamage"
import type { MaxDmgOptions, MaxDmgResult } from "../models/MaxDamage"
import type { QuestEnemyAppearance } from "../models/PvE"
import type { PvPKioku } from "../models/PvPKioku"
import type { TeamSlot } from "../types/BestTeamTypes"
import { buildSlotKioku } from "../utils/pvpExport"

export interface MaxDamageRequest {
    id: number
    slots: TeamSlot[]            // filled team slots, in team order
    stageId: number
    waveIdx: number
    wave: QuestEnemyAppearance[] // the enemies at the wave's start (the page's list, result index order)
    dealerPos: number
    opts: MaxDmgOptions
}
export type MaxDamageMessage = { id: number, result?: MaxDmgResult, error?: string }

console.debug = () => { }
const warn = console.warn
let warnings = 0
console.warn = (...a: unknown[]) => { if (warnings++ < 20) warn(...a) }

// Built kiokus by slot (building one is ~100 ms; the team rarely changes between requests).
const kiokus = new Map<string, PvPKioku>()
function kiokuOf(slot: TeamSlot): PvPKioku {
    const key = JSON.stringify(slot)
    let k = kiokus.get(key)
    if (!k) {
        if (kiokus.size > 50) kiokus.clear()
        kiokus.set(key, k = buildSlotKioku(slot))
    }
    return k
}

let pending: MaxDamageRequest | undefined
let busy = false

function next() {
    if (busy || !pending) return
    const req = pending
    pending = undefined
    busy = true
    // yield first so a burst of requests (typing a stack count) collapses into the last one
    setTimeout(() => {
        try {
            if (pending && pending.id > req.id) return
            const result = computeMaxDamageEngine(req.slots.map(kiokuOf), { stageId: req.stageId, waveIdx: req.waveIdx }, req.wave, req.dealerPos, req.opts)
            self.postMessage({ id: req.id, result } satisfies MaxDamageMessage)
        } catch (e) {
            self.postMessage({ id: req.id, error: String((e as Error)?.stack ?? e) } satisfies MaxDamageMessage)
        } finally {
            busy = false
            next()
        }
    }, 0)
}

self.onmessage = (e: MessageEvent<MaxDamageRequest>) => {
    pending = e.data
    next()
}
