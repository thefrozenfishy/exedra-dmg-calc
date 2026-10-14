// App side: routes the engine's random decisions (GameRandom.hook, src/engine/runtime.ts) through a BattleRng, so the
// pages' RNG modes (always hit / miss / weighted / seeded / manual flips) and their roll log work on the 1:1 engine.
import { BattleRng, mostLikely, type RngKind } from "../models/BattleRng"
import { seededRng } from "../models/BattleMath"
import { E } from "./engineBundle"

/** How the battle names a game object in roll labels (units, states, skills). */
export type EngineNamer = (obj: unknown) => string

export class EngineRandom {
    private readonly guid: () => number
    readonly rng: BattleRng
    private readonly name: EngineNamer
    constructor(rng: BattleRng, name: EngineNamer) {
        this.rng = rng
        this.name = name
        this.guid = seededRng((rng.seed ^ 0x5bd1e995) >>> 0)
    }

    /** The object the engine calls (GameRandom.hook). */
    readonly hook = {
        chance: (probability: number, kind: RngKind, subject: readonly unknown[], hits: (r: number) => boolean): boolean =>
            this.rng.chance(probability, kind, probability > 0 && probability < 100 ? this.chanceLabel(kind, subject) : "", hits),
        choose: (weights: readonly number[], kind: RngKind, subject: readonly unknown[], options: readonly unknown[]): number => {
            const w = [...weights]
            const i = this.rng.choose(w, kind, this.chooseLabel(kind, subject), options.map(o => this.name(o)))
            return i < 0 ? mostLikely(w) : i
        },
        // Guid.NewGuid() tie-breaks: random only in seed mode; the other modes keep the list order (the "first option").
        guidKey: (): number => this.rng.mode === "seed" ? this.guid() : 0,
    }

    /** Runs `fn` with this battle's decisions installed (GameRandom is global: several battles can exist). */
    run<T>(fn: () => T): T {
        const R = E.GameRandom
        const saved = R.hook
        R.hook = this.hook
        try { return fn() } finally { R.hook = saved }
    }

    private chanceLabel(kind: RngKind, subject: readonly unknown[]): string {
        if (kind === "crit") return `${this.name(subject[0])} → ${this.name(subject[1])} crit`
        if (kind === "effect") return `${this.name(subject[2])}: ${this.name(subject[0])} on ${this.name(subject[1])}`
        return subject.map(s => this.name(s)).join(" / ")
    }

    private chooseLabel(kind: RngKind, subject: readonly unknown[]): string {
        const who = subject.map(s => this.name(s)).filter(Boolean).join(" ")
        return kind === "skill" ? `${who} skill pick`.trim() : `${who} target`.trim()
    }
}
