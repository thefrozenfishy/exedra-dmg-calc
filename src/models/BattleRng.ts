// Every random decision a simulated battle makes goes through one BattleRng.
//
// Two shapes of decision:
//   chance(p)        - a yes/no roll with probability p (0-100): crits, "does this buff/debuff land".
//   choose(weights)  - one option out of several: AI target picks, enemy skill picks.
// A roll at 0% or 100% (and a choice with a single possible option) is not random at all: it is
// decided directly, never consumes the seeded generator and is not recorded.
//
// Modes (RngMode):
//   hit    - every real roll succeeds; every choice takes its most likely option.
//   miss   - every real roll fails; every choice takes its most likely option.
//   seed   - rolled from the seeded generator (mulberry32, same seed = same battle).
//   manual - the user decides each roll; undecided rolls default to "succeeds if p >= 50%",
//            choices default to the most likely option.
// Every real roll is recorded as an RngEvent (numbered in battle order) and drained into the
// battle snapshots, so the UI can show and flip them. A flipped outcome is stored by index in
// `decisions` and the battle is replayed from the start; a stored decision only applies if the
// event at that index still has the same kind and label (earlier flips can change what happens).
//
// Manual control (PvE): pick() asks for a stored decision (a target, the ally's action, whether to
// fire an ultimate) and throws PendingDecision when there is none, so the page can stop, ask the
// user, and replay with the answer.
import { seededRng } from "./BattleMath";

export type RngMode = "hit" | "miss" | "seed" | "manual"
export type RngKind = "crit" | "effect" | "target" | "skill" | "action"

export interface RngOption { label: string, weight: number }

export interface RngEvent {
    index: number
    kind: RngKind
    label: string
    probability?: number        // chance(): 0-100
    options?: RngOption[]       // choose()/pickTarget()
    outcome: boolean | number   // chance(): hit or not; choose(): option index
    defaultOutcome: boolean | number
    decided: boolean            // outcome comes from a stored (user) decision
    userPick?: boolean          // manual targeting: never random, always the user's pick
}

// `pick`: a manual-targeting pick (UI bookkeeping only; the engine matches kind + label).
export interface RngDecision { kind: RngKind, label: string, value: boolean | number, pick?: boolean }

export class PendingDecision extends Error {
    readonly event: RngEvent
    constructor(event: RngEvent) {
        super(`Waiting for a decision: ${event.label}`)
        this.event = event
        this.name = "PendingDecision"
    }
}

// Most likely option (highest weight, first on ties).
export const mostLikely = (weights: number[]) => weights.reduce((best, w, i) => w > weights[best] ? i : best, 0)

export class BattleRng {
    readonly mode: RngMode
    readonly seed: number
    private readonly generator: () => number
    private readonly decisions: Map<number, RngDecision>
    private nextIndex = 0
    private pending: RngEvent[] = []
    readonly events: RngEvent[] = []

    constructor(mode: RngMode, seed: number, decisions?: Map<number, RngDecision> | Record<number, RngDecision>) {
        this.mode = mode
        this.seed = seed
        this.generator = seededRng(seed)
        this.decisions = decisions instanceof Map ? decisions : new Map(Object.entries(decisions ?? {}).map(([k, v]) => [Number(k), v]))
    }

    private stored(kind: RngKind, label: string): RngDecision | undefined {
        const d = this.decisions.get(this.nextIndex)
        return d && d.kind === kind && d.label === label ? d : undefined
    }

    private record(ev: Omit<RngEvent, "index">): RngEvent {
        const full = { ...ev, index: this.nextIndex++ }
        this.events.push(full)
        this.pending.push(full)
        return full
    }

    // Yes/no roll. `probability` in percent. `hits(r)` reproduces the game's exact comparison for a
    // uniform r in [0, 1) (e.g. f32(r * 100) < chance); defaults to r * 100 < probability.
    chance(probability: number, kind: RngKind, label: string, hits?: (r: number) => boolean): boolean {
        if (!(probability > 0)) return false
        if (probability >= 100) return true
        const defaultOutcome = this.mode === "hit" ? true : this.mode === "miss" ? false : probability >= 50
        let outcome: boolean
        let decided = false
        if (this.mode === "seed") {
            const r = this.generator()
            outcome = hits ? hits(r) : r * 100 < probability
        } else {
            const d = this.mode === "manual" ? this.stored(kind, label) : undefined
            decided = !!d
            outcome = d ? !!d.value : defaultOutcome
        }
        this.record({ kind, label, probability, outcome, defaultOutcome, decided })
        return outcome
    }

    // Weighted pick among options; returns the chosen index. Same integer walk as the game's
    // SelectUnitAtWeightedRandom / RandomSelectActiveSkill: roll = floor(r * total), first option
    // whose running total exceeds the roll. All-zero weights = uniform.
    choose(weights: number[], kind: RngKind, label: string, optionLabels: string[]): number {
        if (weights.length === 0) return -1
        const w = weights.every(x => !(x > 0)) ? weights.map(() => 1) : weights
        const possible = w.filter(x => x > 0).length
        if (possible <= 1) return w.findIndex(x => x > 0)
        const defaultOutcome = mostLikely(w)
        let outcome = defaultOutcome
        let decided = false
        if (this.mode === "seed") {
            outcome = weightedIndex(w, this.generator())
        } else if (this.mode === "manual") {
            const d = this.stored(kind, label)
            if (d && typeof d.value === "number" && w[d.value] > 0) { outcome = d.value; decided = true }
        }
        const total = w.reduce((a, b) => a + b, 0)
        const options = w.map((x, i) => ({ label: optionLabels[i] ?? String(i), weight: total ? x / total * 100 : 0 }))
        this.record({ kind, label, options, outcome, defaultOutcome, decided })
        return outcome
    }

    // Manual control: the user decides (a target, Battle Skill vs Basic Attack, whether to fire an
    // ultimate). Uses the stored decision for this point of the battle or throws PendingDecision
    // (nothing is consumed or recorded before the throw). A single option is taken without asking.
    pick(kind: RngKind, label: string, optionLabels: string[]): number {
        if (optionLabels.length <= 1) return optionLabels.length - 1
        const d = this.stored(kind, label)
        const options = optionLabels.map(l => ({ label: l, weight: 100 / optionLabels.length }))
        if (!d || typeof d.value !== "number" || d.value < 0 || d.value >= optionLabels.length) {
            throw new PendingDecision({ index: this.nextIndex, kind, label, options, outcome: -1, defaultOutcome: -1, decided: false, userPick: true })
        }
        this.record({ kind, label, options, outcome: d.value, defaultOutcome: d.value, decided: true, userPick: true })
        return d.value
    }

    pickTarget(label: string, optionLabels: string[]): number {
        return this.pick("target", label, optionLabels)
    }

    // Events recorded since the last drain (attached to the next battle snapshot).
    drain(): RngEvent[] {
        return this.pending.splice(0)
    }
}

export function weightedIndex(weights: number[], r: number): number {
    const total = weights.reduce((a, b) => a + b, 0)
    const roll = Math.floor(r * total)
    let acc = 0
    for (let i = 0; i < weights.length; i++) {
        acc += weights[i]
        if (acc > roll) return i
    }
    return weights.length - 1
}

// A plain () => number (Math.random, a bare seeded generator) or a BattleRng.
export type RngSource = (() => number) | BattleRng

export function rollChance(rng: RngSource, probability: number, kind: RngKind, label: () => string, hits: (r: number) => boolean): boolean {
    if (rng instanceof BattleRng) return rng.chance(probability, kind, probability > 0 && probability < 100 ? label() : "", hits)
    return hits(rng())
}

// Weighted pick with the game's integer walk; uniform when every weight is 1.
export function rollChoice(rng: RngSource, weights: number[], kind: RngKind, label: () => string, optionLabels: () => string[]): number {
    if (rng instanceof BattleRng) return rng.choose(weights, kind, label(), optionLabels())
    const w = weights.every(x => !(x > 0)) ? weights.map(() => 1) : weights
    return weightedIndex(w, rng())
}
