// App side (not game code): "Stats for nerds" on the PvE page. Records the steps of the game's own damage pipeline
// (BattleDamageCalculator, ported 1:1 in src/engine) while one Max Damage evaluation runs, so the page can show what
// the engine computed for each hit: the damage base, the break / DEF / give / receive / element / weak / crit factors
// and the result. Nothing is recomputed here: each factor is the ratio of a step's output to its input, read around
// the engine's own calls (the static methods are wrapped for the duration of the run, then restored). Steps:
// [CONFIRMED 3.19] BattleDamageCalculator.GetAttackDamageResult (0x13A39C0) and GetSlipDamageValue (0x13A7DD0):
// break situation -> DEF correction -> give -> receive -> element resist -> weak element ratio (inline) -> crit ->
// difficulty -> final give -> PvP suppression -> shield -> Max(1) -> Ceiling -> barrier (docs/ai/MECHANICS.md 2).
import { E } from "./engineBundle"

const CATEGORY: Record<number, string> = {
    0: "None", 1: "Hit", 2: "Random hit", 3: "Break", 4: "Slip", 5: "Reflection", 6: "Ratio", 7: "Additional", 8: "Final",
}
const BASE_TYPE: Record<number, "ATK" | "DEF" | "HP"> = { 1: "ATK", 2: "DEF", 3: "HP" }

/** One damage computation of the engine against one unit. Factors are multipliers (1 = no change). */
export interface HitTrace {
    category: string            // "Hit", "Additional", "Slip" (vortex / DoT), ...
    attacker: string            // the unit whose pipeline it went through (a vortex / DoT: its owner)
    defenderId: number
    element: number             // TargetElementType of the attack (0 = none)
    statType?: "ATK" | "DEF" | "HP"
    stat?: number               // GetDamageBase paramValue (the attacker's processed stat)
    power?: number              // GetDamageBase power (skill multiplier)
    base: number                // damage base given to the pipeline
    breakFactor: number         // GetAppliedDamageOfBreakSituation
    atk?: number                // GetDefenseCorrectedDamage: attacker's processed stat
    def?: number                // ... and the defender's processed DEF
    defFactor: number           // min((10 + atk) / (10 + def) * 0.12, 2)
    giveFactor: number          // GetProcessedGiveDamage (DMG dealt, element DMG, vortex / DoT DMG up)
    receiveFactor: number       // GetProcessedReceiveDamage (DMG taken up / down)
    resist?: number             // element resist rate in % (clamped to +-100)
    resistFactor: number        // GetElementResistDamage
    weakFactor: number          // CorrelationEffect._ElementDamageRatio
    crit: boolean
    critFactor: number          // GetAddedCriticalDamage (1 when no crit)
    difficultyFactor: number    // GetDifficultyCorrectedDamage
    finalGiveFactor: number     // GetProcessedFinalGiveDamage
    shieldFactor: number        // DamageCutByShield (and PvP suppression)
    preCrit: number             // damage before the crit step
    result: number              // dealt (HP + barrier)
}

const num = (d: any): number => (d == null ? 0 : typeof d === "number" ? d : d.toDouble())
const ratio = (out: any, inp: any): number => {
    const i = num(inp)
    return i === 0 ? 1 : num(out) / i
}

type Open = Partial<HitTrace> & { _afterResist?: number, _preCritSet?: boolean }

/** Runs `fn` with the engine's damage steps recorded (`fn` sees the list as it grows). `nameOf` names a unit. */
export function traceDamage<T>(fn: (hits: readonly HitTrace[]) => T, nameOf: (unit: any) => string): { value: T, hits: HitTrace[] } {
    const C = E.BattleDamageCalculator
    const hits: HitTrace[] = []
    const stack: Open[] = []
    let lastBase: { stat: number, power: number } | undefined
    const saved: Record<string, any> = {}
    const wrap = (name: string, f: (orig: (...a: any[]) => any) => (...a: any[]) => any) => {
        saved[name] = C[name]
        C[name] = f(saved[name])
    }
    const top = () => stack[stack.length - 1]
    // a step of the open computation: factor = out / in
    const step = (name: string, set: (o: Open, out: any, args: any[]) => void) =>
        wrap(name, orig => function (this: any, ...args: any[]) {
            const out = orig.apply(this, args)
            const o = top()
            if (o) set(o, out, args)
            return out
        })
    const begin = (category: number, attacker: any, defender: any, base: any, element: number, baseType: number) => {
        stack.push({
            category: CATEGORY[category] ?? String(category), attacker: nameOf(attacker), defenderId: defender?._Id ?? 0, element,
            statType: BASE_TYPE[baseType], stat: lastBase?.stat, power: lastBase?.power, base: num(base),
            breakFactor: 1, defFactor: 1, giveFactor: 1, receiveFactor: 1, resistFactor: 1, weakFactor: 1, crit: false,
            critFactor: 1, difficultyFactor: 1, finalGiveFactor: 1, shieldFactor: 1,
        })
        lastBase = undefined
    }
    const end = (result: number) => {
        const o = stack.pop()!
        if (o.preCrit === undefined) o.preCrit = (o._afterResist ?? o.base ?? 0) * (o.weakFactor ?? 1)
        delete o._afterResist; delete o._preCritSet
        hits.push({ ...(o as HitTrace), result })
    }
    try {
        wrap("GetDamageBase", orig => (stat: number, power: number) => {
            lastBase = { stat, power }
            return orig(stat, power)
        })
        wrap("GetAttackDamageResult", orig => (attack: any, defense: any, base: any, element: number, baseType: number, skill: any, bt: number, category: number) => {
            begin(category, attack, defense, base, element, baseType)
            let notice: any
            try { notice = orig(attack, defense, base, element, baseType, skill, bt, category) } catch (e) { stack.pop(); throw e }
            const dealt = [...(notice?.Damages ?? []), ...(notice?.BarrierDamages ?? [])].reduce((s: number, x: any) => s + (x._DamageValue ?? 0), 0)
            end(dealt)
            return notice
        })
        wrap("GetSlipDamageValue", orig => (attack: any, defense: any, base: any, element: number, baseType: number, bt: number, state: any) => {
            begin(4, attack, defense, base, element, baseType)
            let v: number
            try { v = orig(attack, defense, base, element, baseType, bt, state) } catch (e) { stack.pop(); throw e }
            end(v)
            return v
        })
        step("GetAppliedDamageOfBreakSituation", (o, out, [, dmg, force]) => { if (!force) o.breakFactor = ratio(out, dmg) })
        step("GetDefenseCorrectedDamage", (o, out, [attack, defense, dmg, baseType]) => {
            o.atk = num(attack.GetProcessedDamageBaseParamValueDecimal(baseType))
            o.def = num(defense.GetProcessedDefDecimal())
            o.defFactor = ratio(out, dmg)
        })
        step("GetProcessedGiveDamage", (o, out, [, , dmg]) => { o.giveFactor = ratio(out, dmg) })
        step("GetProcessedReceiveDamage", (o, out, [, , dmg]) => { o.receiveFactor = ratio(out, dmg) })
        step("GetElementResistDamage", (o, out, [, defense, dmg, element]) => {
            o.resistFactor = ratio(out, dmg)
            if (element) o.resist = Math.max(-100, Math.min(100, num(defense.GetProcessedElementResistRate(element))))
            o._afterResist = num(out)
        })
        // the weak element ratio is applied inline right after the element resist step: it is the next step's input
        // over the resist step's output
        const preCrit = (o: Open, dmg: any) => {
            if (o._preCritSet) return
            o._preCritSet = true
            o.preCrit = num(dmg)
            if (o._afterResist !== undefined) o.weakFactor = ratio(dmg, o._afterResist)
        }
        step("GetAddedCriticalDamage", (o, out, [, , dmg]) => { preCrit(o, dmg); o.crit = true; o.critFactor = ratio(out, dmg) })
        step("GetDifficultyCorrectedDamage", (o, out, [, , dmg]) => { preCrit(o, dmg); o.difficultyFactor = ratio(out, dmg) })
        step("GetProcessedFinalGiveDamage", (o, out, [, , dmg]) => { o.finalGiveFactor = ratio(out, dmg) })
        step("DamageCutByPvpOrGvgSuppression", (o, out, [dmg]) => { o.shieldFactor = (o.shieldFactor ?? 1) * ratio(out, dmg) })
        step("SlipDamageCutByPvpOrGvgSuppression", (o, out, [dmg]) => { o.shieldFactor = (o.shieldFactor ?? 1) * ratio(out, dmg) })
        step("DamageCutByShield", (o, out, [dmg]) => { o.shieldFactor = (o.shieldFactor ?? 1) * ratio(out, dmg) })
        return { value: fn(hits), hits }
    } finally {
        for (const [name, f] of Object.entries(saved)) C[name] = f
    }
}

/** Stats of an engine unit with every state it holds (for the trace). */
export interface UnitStats {
    name: string
    element: number
    atk: number, atkBase: number
    def: number, defBase: number
    hp: number, spd: number, spdBase: number
    ctr: number, ctrBase: number   // crit rate %
    ctd: number, ctdBase: number   // crit DMG %
    states: number
}

export function unitStats(u: any, name: string): UnitStats {
    const p = u._BattleParameter
    return {
        name, element: p?._Element ?? 0,
        atk: u.GetProcessedAtk(), atkBase: p?._ATK ?? 0,
        def: u.GetProcessedDef(), defBase: p?._DEF ?? 0,
        hp: u._MaxHP, spd: u.GetProcessedSpeed(), spdBase: p?._Speed ?? 0,
        ctr: u.GetProcessedCtr(), ctrBase: (p?._CTR ?? 0) / 10,
        ctd: u.GetProcessedCtd(), ctdBase: (p?._CTD ?? 0) / 10,
        states: u._Condition?._StateList?.length ?? 0,
    }
}

/** An enemy as the dealer sees it (for the trace). */
export interface EnemyTraceStats extends UnitStats {
    canBreak: boolean, broken: boolean, breakRate: number, maxBreakRate: number
    weakElements: number[]
    resist: number      // element resist % against the dealer's element (before the +-100 clamp)
    rcvCtr: number      // crit rate % the dealer gains against it
    rcvCtd: number      // crit DMG % the dealer gains against it
}

export function enemyStats(u: any, name: string, dealer: any): EnemyTraceStats {
    const element = dealer?._BattleParameter?._Element ?? 0
    return {
        ...unitStats(u, name),
        canBreak: u._BreakPoint.get_HasBreakPoint(), broken: u._BreakPoint.get_IsBreak(),
        breakRate: u._BreakedDamageReceiveRate, maxBreakRate: Math.trunc((u._BattleParameter?._MaxBreakedDamageReceiveRate ?? 0) / 10),
        weakElements: [...(u._WeakElements ?? [])],
        resist: element ? num(u.GetProcessedElementResistRate(element)) : 0,
        rcvCtr: dealer ? u.GetProcessedRcvCtr(dealer) : 0,
        rcvCtd: dealer ? u.GetProcessedRcvCtd(dealer) : 0,
    }
}
