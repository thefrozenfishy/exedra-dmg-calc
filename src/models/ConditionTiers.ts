// Mutually exclusive condition sets ("tiers"): states whose ACTIVE conditions can never hold at the same time, e.g.
// Focused Guard's five DWN_RCV_DMG_RATIO rows ("enemies == 5" ... "enemies == 1") or Vinctio☆Magica's Light Chain
// rows ("Light Chain Lv == 1" ... "Lv >= 5"). In battle at most one of them is active (UnitStateBase.IsActive, see
// MECHANICS.md 6); Max Damage, which assumes every condition met, uses this to keep only one tier of such a ladder.
//
// [APPROXIMATION] Static check on the master data, conservative: two condition sets are exclusive only when they
// test the same quantity (same CompareTarget, CompareContent and "pid," prefix of the CompareValue) with value
// ranges that cannot overlap. Anything not recognised (other operators, unparsable values) counts as compatible.
// ActorSkillType (401) is ignored: Max Damage evaluates it per skill column instead (MaxDamage.withSkillType).
import battleConditionSetsJson from "../assets/base_data/getBattleConditionSetMstList.json";
import battleConditionsJson from "../assets/base_data/getBattleConditionMstList.json";

interface Cond { compareContent: number, compareOperator: number, compareTarget: number, compareValue: string }

const conds = new Map<string, Cond>((battleConditionsJson as any[]).map(c => [String(c.battleConditionMstId), c]))
const sets = new Map<string, Cond[]>((battleConditionSetsJson as any[]).map(s => [String(s.battleConditionSetMstId),
    String(s.battleConditionMstIdCsv).split(",").map(id => conds.get(id)).filter((c): c is Cond => !!c)]))

// CompareOperator (BattleConditionParser): 1 Equal, 2 NotEqual, 3 Greater, 4 GreaterOrEqual, 5 Less, 6 LessOrEqual,
// 7 Contain, 8 NotContain. Unit value <op> CompareValue (Int/FloatValueComparer).
const ACTOR_SKILL_TYPE = 401

// "pid,n" values (UniqueAbilityEffectLv / AccumCount, team pattern counts): the prefix names the quantity.
function split(value: string): [string, string] {
    const i = value.lastIndexOf(",")
    return i < 0 ? ["", value] : [value.slice(0, i), value.slice(i + 1)]
}

type Interval = { lo: number, loIn: boolean, hi: number, hiIn: boolean }
function interval(op: number, v: number): Interval | undefined {
    switch (op) {
        case 1: return { lo: v, loIn: true, hi: v, hiIn: true }
        case 3: return { lo: v, loIn: false, hi: Infinity, hiIn: false }
        case 4: return { lo: v, loIn: true, hi: Infinity, hiIn: false }
        case 5: return { lo: -Infinity, loIn: false, hi: v, hiIn: false }
        case 6: return { lo: -Infinity, loIn: false, hi: v, hiIn: true }
        default: return undefined
    }
}

export function conditionsExclusive(a: Cond, b: Cond): boolean {
    if (a.compareTarget !== b.compareTarget || a.compareContent !== b.compareContent) return false
    if (a.compareContent === ACTOR_SKILL_TYPE) return false
    const [pa, va] = split(String(a.compareValue)), [pb, vb] = split(String(b.compareValue))
    if (pa !== pb) return false
    const ops = [a.compareOperator, b.compareOperator].sort().join()
    // Equal x / NotEqual x, Contain x / NotContain x (also for bools and names).
    if ((ops === "1,2" || ops === "7,8") && va === vb) return true
    if (ops === "1,1") return va !== vb && !(Number(va) === Number(vb) && va.trim() !== "")
    const na = Number(va), nb = Number(vb)
    if (va.trim() === "" || vb.trim() === "" || Number.isNaN(na) || Number.isNaN(nb)) return false
    const ia = interval(a.compareOperator, na), ib = interval(b.compareOperator, nb)
    if (!ia || !ib) return false
    const contains = (i: Interval, x: number) => (i.lo < x || (i.lo === x && i.loIn)) && (x < i.hi || (x === i.hi && i.hiIn))
    const lo = Math.max(ia.lo, ib.lo), hi = Math.min(ia.hi, ib.hi)
    if (lo > hi) return true
    if (lo < hi) return false
    return !(contains(ia, lo) && contains(ib, lo))
}

// Two condition SETS can't both hold if some condition of one excludes some condition of the other (sets are ANDs).
function setsExclusive(a: Cond[], b: Cond[]): boolean {
    return a.some(ca => b.some(cb => conditionsExclusive(ca, cb)))
}

// Two condition-set csvs (OR of sets): exclusive when every pair of their sets is. An empty csv (always true) or an
// unknown set is never exclusive with anything.
export function conditionCsvsExclusive(csvA: string | undefined, csvB: string | undefined): boolean {
    const ids = (csv?: string) => (csv ?? "").split(",").filter(id => id.length && id !== "0")
    const a = ids(csvA).map(id => sets.get(id)), b = ids(csvB).map(id => sets.get(id))
    if (!a.length || !b.length || a.some(s => !s) || b.some(s => !s)) return false
    return a.every(sa => b.every(sb => setsExclusive(sa!, sb!)))
}
