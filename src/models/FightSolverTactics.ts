// Fight Solver tactics: what the player wants at the checkpoint (goals, in priority order) and how each ally should
// play on the way (strategies). Not game rules: search guidance, the way the user plays a stage by hand.
//
// Goals rank the checkpoint states (and clears): each goal is one slot of the candidate vector, in the user's order,
// ahead of the solver's own ranking (AV, EP, SP, next turns, HP). A goal with a limit (≥, ≤, between, has / lacks a
// buff) scores how far the state misses it (0 = met); a state that misses any limit does not set the AV bound, so the
// fastest state that fails the player's limits never cuts the lines that could meet them.
//
// Strategies steer the decisions (FightSolver: tacticRanks): each option of a prompt gets a rank (preferred,
// neutral, discouraged). "Try first": preferred options are tried first (a line's deviations from its strategies
// count before the estimate when ordering children, the beam and the parallel frontier). "Only": the other options
// are not tried at all.
//
// Positions are team positions (0-based, the filled slots in order); the page stores names (so its settings survive
// reordering the team) and converts with tacticsFromNames.

// av: AV until the ally's next turn (fallen = 100); ep / hp: % of full; magic: stacks; buff: an active effect.
// elapsed: the line's AV (team-wide); sp: team SP.
export type TacticMetric = "av" | "ep" | "hp" | "magic" | "buff" | "elapsed" | "sp"
// high / low: as much / as little as possible; gte / lte / between: limits; has / lacks: buff present / absent.
export type TacticMode = "high" | "low" | "gte" | "lte" | "between" | "has" | "lacks"

export interface TacticGoal {
    ally: number            // team position; -1 for the team metrics (elapsed, sp)
    metric: TacticMetric
    mode: TacticMode
    value?: number
    value2?: number         // between: the upper end
    buff?: string           // buff: text found in the effect's type ("CUTOUT") or its "applier - description"
    from?: number           // buff: applied by this ally (team position); undefined = anyone
}

export type UltMode = "free" | "asap" | "hold"

export interface AllyStrategy {
    ally: number
    action?: "basic" | "skill"      // the action to use on its turns
    actionStrict?: boolean
    buffMain?: number               // ally-side targets: this ally first...
    buffSecond?: number             // ...this one when the main target already has the buffs
    buffName?: string               // "the buffs": effects from this ally matching this text (empty: any effect from it)
    buffStrict?: boolean
    ultBreaks?: number              // ultimate: N enemies broken (default 1)
    ultAtBreak?: UltMode            // with at least N enemies broken
    ultOtherwise?: UltMode          // with fewer
    ultStrict?: boolean
}

export interface SolverTactics {
    goals: TacticGoal[]
    strategies: AllyStrategy[]
}

// The page's form: allies by name ("" = team).
export interface TacticGoalByName extends Omit<TacticGoal, "ally" | "from"> { ally: string, from?: string }
export interface AllyStrategyByName extends Omit<AllyStrategy, "ally" | "buffMain" | "buffSecond"> { buffMain?: string, buffSecond?: string }
export interface SolverTacticsByName {
    goals: TacticGoalByName[]
    strategies: Record<string, AllyStrategyByName>
}

export const TEAM_METRICS: TacticMetric[] = ["elapsed", "sp"]
export const METRIC_LABELS: Record<TacticMetric, string> = {
    elapsed: "Fight AV", sp: "Team SP", av: "Next turn AV", ep: "EP %", hp: "HP %", magic: "Magic", buff: "Buff",
}
export const MODE_LABELS: Record<TacticMode, string> = {
    high: "as high as possible", low: "as low as possible", gte: "at least", lte: "at most", between: "between",
    has: "has", lacks: "does not have",
}
export const isLimit = (m: TacticMode) => m !== "high" && m !== "low"

export function emptyTactics(): SolverTactics { return { goals: [], strategies: [] } }

export function hasTactics(t?: SolverTactics): boolean {
    return !!t && (t.goals.length > 0 || t.strategies.some(s => strategyActive(s)))
}
export function strategyActive(s: AllyStrategy | AllyStrategyByName): boolean {
    return !!s.action || s.buffMain !== undefined && s.buffMain !== "" || s.buffSecond !== undefined && s.buffSecond !== ""
        || (!!s.ultAtBreak && s.ultAtBreak !== "free") || (!!s.ultOtherwise && s.ultOtherwise !== "free")
}
export function ultRuled(s?: AllyStrategy): boolean {
    return !!s && ((!!s.ultAtBreak && s.ultAtBreak !== "free") || (!!s.ultOtherwise && s.ultOtherwise !== "free"))
}

// Names -> team positions (names not in the team are dropped).
export function tacticsFromNames(t: SolverTacticsByName | undefined, names: string[]): SolverTactics {
    const pos = (n?: string) => n === undefined || n === "" ? undefined : names.indexOf(n)
    const goals: TacticGoal[] = []
    for (const g of t?.goals ?? []) {
        const team = TEAM_METRICS.includes(g.metric)
        const ally = team ? -1 : pos(g.ally)
        if (ally === undefined || (!team && ally < 0)) continue
        if (g.metric === "buff" && !(g.buff ?? "").trim()) continue
        const from = g.metric === "buff" ? pos(g.from) : undefined
        goals.push({ ...g, ally, from: from !== undefined && from >= 0 ? from : undefined, value: num(g.value), value2: num(g.value2) })
    }
    const strategies: AllyStrategy[] = []
    for (const [name, s] of Object.entries(t?.strategies ?? {})) {
        const ally = names.indexOf(name)
        if (ally < 0 || !strategyActive(s)) continue
        const main = pos(s.buffMain), second = pos(s.buffSecond)
        strategies.push({
            ...s, ally, ultBreaks: num(s.ultBreaks), action: s.action || undefined,
            buffMain: main !== undefined && main >= 0 ? main : undefined,
            buffSecond: second !== undefined && second >= 0 ? second : undefined,
        })
    }
    return { goals, strategies }
}

// Team positions -> names (a results file's tactics back into the page's form).
export function tacticsToNames(t: SolverTactics | undefined, names: string[]): SolverTacticsByName {
    const nm = (i?: number) => i === undefined || i < 0 ? undefined : names[i]
    return {
        goals: (t?.goals ?? []).map(g => ({ ...g, ally: g.ally < 0 ? "" : names[g.ally] ?? "", from: nm(g.from) })),
        strategies: Object.fromEntries((t?.strategies ?? []).filter(s => names[s.ally]).map(s => {
            const { ally, buffMain, buffSecond, ...rest } = s
            return [names[ally], { ...rest, buffMain: nm(buffMain), buffSecond: nm(buffSecond) }]
        })),
    }
}

// A form number (an emptied number input gives "").
function num(v: unknown): number | undefined {
    if (v === undefined || v === null || v === "") return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
}

const r1 = (v: number) => Math.round(10 * v) / 10

// A goal's slot in the candidate vector (smaller is better): limits score how far the state misses them (0 = met).
export function goalScore(g: TacticGoal, v: number): number {
    switch (g.mode) {
        case "high": return -r1(v)
        case "low": return r1(v)
        case "gte": return r1(Math.max(0, (g.value ?? 0) - v))
        case "lte": return r1(Math.max(0, v - (g.value ?? 0)))
        case "between": {
            const lo = Math.min(g.value ?? 0, g.value2 ?? g.value ?? 0), hi = Math.max(g.value ?? 0, g.value2 ?? g.value ?? 0)
            return r1(Math.max(0, lo - v, v - hi))
        }
        case "has": return v > 0 ? 0 : 1
        case "lacks": return v > 0 ? 1 : 0
    }
}

export function fmtGoalValue(g: TacticGoal, v: number): string {
    if (g.metric === "buff") return v > 0 ? "yes" : "no"
    if (g.metric === "ep" || g.metric === "hp") return `${Math.round(v)}%`
    return String(r1(v))
}

// "Pluvia Magica · Next turn AV at most 0", "Mabayu's CUTOUT on Pluvia Magica".
export function goalLabel(g: TacticGoal, names: string[]): string {
    const who = g.ally < 0 ? "" : `${names[g.ally] ?? `#${g.ally + 1}`} · `
    if (g.metric === "buff") return `${who}${g.mode === "lacks" ? "no " : ""}${g.buff}${g.from !== undefined ? ` from ${names[g.from] ?? `#${g.from + 1}`}` : ""}`
    const m = METRIC_LABELS[g.metric]
    const unit = g.metric === "ep" || g.metric === "hp" ? "%" : ""
    if (g.mode === "high") return `${who}${m} ↑`
    if (g.mode === "low") return `${who}${m} ↓`
    if (g.mode === "gte") return `${who}${m} ≥ ${g.value ?? 0}${unit}`
    if (g.mode === "lte") return `${who}${m} ≤ ${g.value ?? 0}${unit}`
    return `${who}${m} ${g.value ?? 0}–${g.value2 ?? g.value ?? 0}${unit}`
}

// Does a unit carry an active effect matching `text` (effect type, or "applier - description"), applied by `from`?
export function unitHasEffect(u: any, text: string | undefined, from?: any): boolean {
    const t = (text ?? "").trim().toLowerCase()
    const fromName = from?.kioku?.name
    for (const d of (u?.activeEffectDetails?.values?.() ?? []) as Iterable<any>) {
        if (from && d._applierState !== from && d.applier !== fromName) continue
        if (!t) return true
        if (String(d.abilityEffectType ?? "").toLowerCase().includes(t)) return true
        if (`${d.applier ?? ""} - ${d.description ?? ""}`.toLowerCase().includes(t)) return true
    }
    return false
}

// A goal's value in a battle (team1 = the allies; elapsed = the line's AV).
export function goalValue(g: TacticGoal, t1: any, elapsed: number): number {
    if (g.metric === "elapsed") return elapsed
    if (g.metric === "sp") return t1.currentSp ?? 0
    const u = t1.kiokuStates?.[g.ally]
    if (!u) return 0
    switch (g.metric) {
        case "av": return u.isDead ? 100 : Math.max(0, Number(u.turnGauge) || 0)
        case "ep": return u.maxMp > 0 ? 100 * Math.min(1, u.currentMp / u.maxMp) : 0
        case "hp": return u.isDead ? 0 : 100 * Math.max(0, u.currentHp) / Math.max(1, u.maxHp)
        case "magic": return u.currentMaxMagic > 0 ? u.currentMagic ?? 0 : 0
        case "buff": return !u.isDead && unitHasEffect(u, g.buff, g.from !== undefined ? t1.kiokuStates[g.from] : undefined) ? 1 : 0
    }
    return 0
}
