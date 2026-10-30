// Lux bench: how much a character changes a damage dealer's output, measured with the battle engine, with
// Lux☆Magica as the blank slate (beta charts on the Kioku Grid page).
//
// The setup mirrors the legacy Kioku Grid charts: enemies with 3000 DEF, weak to every element and broken at a
// 500% damage-taken rate, and a team of Lux plus the character being measured. The numbers come from the 1:1 engine
// (src/engine) against dummies made of game-shaped master data (battle/EngineBench.ts):
//   - ultimateDamage: the dealer's Ultimate launched in the game's battle code (battle/EngineMaxDamage), with every
//     buff/debuff of the team active at full stacks, every hit a crit ("Max Burst").
//   - simulatedDealerDamage: a battle played for a fixed amount of action value (AV) with the bench's fixed play
//     (BenchPolicy below), counting only the damage the dealer itself deals ("Average Damage"). The rest of the team's
//     damage is ignored, so a support that also hits hard doesn't count, only what it changes about the dealer.
// Gear (benchKioku `gear`): the dealer Lux, the reference Lux and every character measured wear the same build: Towering
// Offense++ (Towering Bulwark++ for kits that deal DEF-based damage), the crystalis of their element, Dominant Blow++,
// the portrait Farewell to a Future Unseen and The Universe's Edge (A5, max level) as support, which the game only
// applies to Attackers. The dealer / reference Lux also gets the average self buffs of the 5 star Attackers
// (averageAttackerSelfBuffs). The filler Lux stay bare: their gear only acts on themselves.
// The dummies have SPD 1, so they never get a turn within the run: they don't attack, and (broken units only
// recover at their own turn start) they stay broken once broken. In Average Damage they start unbroken with a 1-point
// break gauge, so the first hit breaks them and "on enemy break" effects trigger once (EngineBench.benchBattle); Max
// Burst evaluates them already broken.
import { PvPKioku } from "./PvPKioku";
import { Kioku } from "./Kioku";
import { BattleType } from "../types/enums"
import type { RngMode } from "./BattleRng";
import { actorSkillTypeRestriction, ailmentConditionValues, critConditionUsed, unitCountConditionsMet, unitTypeConditionValues } from "./BattleConditionParser";
import type { QuestEnemyAppearance } from "./PvE";
import { crystalisesByStyle, kiokuData, passiveDetails, skillDetailsByMstId } from "../utils/helpers";
import { KiokuConstants, TargetType, TargetTypeLookup, targetTypeToLvl, type BattleEvent, type BattleSnapshot, type KiokuArgs, type SkillDetail } from "../types/KiokuTypes";
import { Ailment, elementMap, roleMap, KiokuElement, KiokuRole, LuxMagica } from "../types/enums";
import { computeMaxDamageEngine } from "../battle/EngineMaxDamage";
import { E } from "../battle/engineBundle";
import { AILMENT_STATE, BENCH_BROKEN_RATE, BENCH_DEF, BenchRng, benchBattle, benchPassive, benchSkills, benchStage, benchStyle, keepAilment, keepStates, middleEnemy, type BenchPassiveRow } from "../battle/EngineBench";
import { collectTeamEffects } from "./MaxDamage";

export { BENCH_BROKEN_RATE, BENCH_DEF }
// "Infinite" SP: topped up to this whenever time moves forward. Truly endless SP never ends a chain of battle skills
// that act again at the same moment (Tenebrous Arcana's extra action, Thunder Torrent hasting herself): those drain
// the 5 SP and end, as in the game, while every normal turn starts with SP.
const SP_REFILL = 5

/** `count` dummies (the bench stage's appearance rows); the middle one is the main target (single-target skills hit it). */
export function benchEnemies(count: number): QuestEnemyAppearance[] {
    return benchStage(count).enemies
}

/** What a bench unit counts as for element/role-limited effects. A key that is present replaces the unit's own
 *  value, `undefined` included: such a unit matches no element (or role) restriction, like the legacy charts'
 *  "no context" Lux. `ailment` is not about the unit: every enemy carries that ailment for the whole run. */
export interface BenchIdentity { element?: KiokuElement, role?: KiokuRole, ailment?: Ailment }

const enemyStatesOf = (ailment?: Ailment): string[] => ailment ? [AILMENT_STATE[ailment]] : []

/** The character's own EX crystalis (SelectionAbility rows with its styleMstId; one per character). */
export const exCrysIds = (name: string): number[] =>
    (crystalisesByStyle[kiokuData[name]?.id ?? -1] ?? []).map(c => c.selectionAbilityMstId)

// ── Bench gear (the same build for everyone measured, see the header)
export const BENCH_PORTRAIT = "Farewell to a Future Unseen"
export const BENCH_SUPPORT = "The Universe's Edge"
const TOWERING_OFFENSE = 3004, TOWERING_BULWARK = 3005, DOMINANT_BLOW = 3023 // SelectionAbility ids (++)
const ELEMENT_CRYS: Record<KiokuElement, number> = {
    [KiokuElement.Flame]: 3014, [KiokuElement.Aqua]: 3015, [KiokuElement.Forest]: 3016, // Inferno++, Torrent++, Verdure++
    [KiokuElement.Light]: 3017, [KiokuElement.Dark]: 3018, [KiokuElement.Void]: 3019,   // Radiance++, Chaos++, Nullity++
}
// Break chart gear (user's choice): Quickstep++ and Mana Infusion++ next to the EX crystalis, the portrait Proof of
// Friends Again (SPD +20%) and Cherry Blizzard as support (Breakers: SPD +20% at battle start, the highest
// unconditional SPD of the Breaker supports, tied with ones that also give break +5), the same for every Breaker.
export const BENCH_BREAK_PORTRAIT = "Proof of Friends Again"
export const BENCH_BREAK_SUPPORT = "Cherry Blizzard"
const QUICKSTEP = 3006, MANA_INFUSION = 3011 // SelectionAbility ids (++)
// The support unit as BestTeamCalculator.fromKey reads it: A5, max levels, no gear of its own.
const benchSupportKey = (name = BENCH_SUPPORT) => [name, undefined, undefined, KiokuConstants.maxAscension, KiokuConstants.maxKiokuLvl,
    KiokuConstants.maxMagicLvl, KiokuConstants.maxHeartphialLvl, KiokuConstants.maxSpecialLvl, [], []]

/** Whether a kit's damage (basic attack, battle skill, ultimate) is mostly DEF-based (DMG_DEF rows): those wear
 *  Towering Bulwark++ instead of Towering Offense++. */
function dealsDefDamage(name: string): boolean {
    const d = kiokuData[name] as any
    if (!d) return false
    let def = 0, other = 0
    for (const id of [d.attack_id, d.skill_id, d.special_id]) {
        for (const r of (skillDetailsByMstId.get(id * 100 + 1) ?? []) as SkillDetail[]) {
            if (r.abilityEffectType === "DMG_DEF") def++
            else if (r.abilityEffectType.startsWith("DMG_")) other++
        }
    }
    return def > other
}

/** The gear crystalis (SelectionAbility ids) of a unit dealing damage in `element`. */
const gearCrys = (name: string, element: KiokuElement | undefined): number[] =>
    [dealsDefDamage(name) ? TOWERING_BULWARK : TOWERING_OFFENSE, ...(element ? [ELEMENT_CRYS[element]] : []), DOMINANT_BLOW]

/** A bench unit: the kit at the given levels with its EX crystalis, whatever `args` carries. With `gear`, also the bench
 *  gear (header): crystalis for its stat and element (the identity's element when one is given), portrait and support;
 *  `gear: "break"` the break chart's (BENCH_BREAK_PORTRAIT above). */
export function benchKioku(args: Omit<KiokuArgs, "crysIDs" | "subCrysIDs"> & Partial<KiokuArgs>, as?: BenchIdentity, gear: boolean | "break" = false): PvPKioku {
    const bare = { ...args, portrait: undefined, supportKey: undefined, crysIDs: exCrysIds(args.name), subCrysIDs: [] } as KiokuArgs
    const element = (as && "element" in as ? as.element : kiokuData[args.name]?.element) as KiokuElement | undefined
    const geared = gear === "break"
        ? { ...bare, portrait: BENCH_BREAK_PORTRAIT, supportKey: benchSupportKey(BENCH_BREAK_SUPPORT), crysIDs: [...bare.crysIDs, QUICKSTEP, MANA_INFUSION] } as KiokuArgs
        : gear ? { ...bare, portrait: BENCH_PORTRAIT, supportKey: benchSupportKey(), crysIDs: [...bare.crysIDs, ...gearCrys(args.name, element)] } as KiokuArgs : bare
    const k = new PvPKioku(geared)
    // Lux given a role (any, Breaker included) also gets that role's stats: the average HP/ATK/DEF of its 5 stars (Lux
    // herself excluded) at her levels, so e.g. an Attacker-identity Lux hits like an average Attacker. Gear adds what the
    // portrait and support add to her own stats (support stats x 0.16, portrait stats, as in Kioku.getBase*).
    if (as?.role && args.name === LuxMagica) {
        const stats = averageRoleStats(as.role, args)
        if (stats) {
            const plain = gear ? new Kioku(bare) : k
            const hp = stats.hp + k.getBaseHp() - plain.getBaseHp(), atk = stats.atk + k.getBaseAtk() - plain.getBaseAtk(), def = stats.def + k.getBaseDef() - plain.getBaseDef()
            k.getBaseHp = () => hp
            k.getBaseAtk = () => atk
            k.getBaseDef = () => def
        }
    }
    if (as && ("element" in as || "role" in as)) {
        (k as any).data = { ...k.data, ...("element" in as ? { element: as.element } : {}), ...("role" in as ? { role: as.role } : {}) }
        if (gear) matchSupportToIdentity(k)
        // In engine battles the unit's element and role come from its StyleMst row: a made-up style with this identity
        // (the unit then also deals its damage in that element, as any unit of that element does).
        ;(k as any).engineStyleMstId = benchStyle(k.data.id, k.data.element as KiokuElement | undefined, k.data.role as KiokuRole | undefined)
    }
    // A dealer tested as an element also deals damage in it: "forest DMG dealt" buffs and the like are gated on the
    // element of the hit, not of the unit (UpElementDmgRateRatioUnitState, 0x16e3d70), and Lux's damage rows are Light.
    // Without this a Forest-identity Lux still hit in Light and got only her unit-gated buffs (Sumire's forest field
    // gave its crit rate but not its +30%): her skills as made-up rows in that element (EngineBench.benchSkills).
    if (as?.element) {
        const kk = k as any
        kk.engineSkillIds = benchSkills({
            attack: [k.data.attack_id, kk.attackLvl], skill: [k.data.skill_id, kk.skillLvl], special: [k.data.special_id, Math.max(1, kk.specialLvl)],
        }, as.element)
    }
    return k
}

// Average base HP/ATK/DEF of every 5 star of a role (Lux excluded) at the given levels: kit stats, magic and heart
// levels and ascension only, like a bench unit (no portrait, support or crystalis). Cached per role and levels.
const roleStatCache = new Map<string, { hp: number, atk: number, def: number } | undefined>()
function averageRoleStats(role: KiokuRole, levels: Pick<KiokuArgs, "ascension" | "kiokuLvl" | "magicLvl" | "heartphialLvl" | "specialLvl">) {
    const key = [role, levels.ascension, levels.kiokuLvl, levels.magicLvl, levels.heartphialLvl, levels.specialLvl].join(":")
    if (roleStatCache.has(key)) return roleStatCache.get(key)
    const units = Object.entries(kiokuData)
        .filter(([name, d]) => d.rarity === 5 && d.role === role && name !== LuxMagica)
        .map(([name]) => new Kioku({ ...levels, name, crysIDs: [], subCrysIDs: [] } as KiokuArgs))
    const avg = (f: (k: Kioku) => number) => Math.round(units.reduce((sum, k) => sum + f(k), 0) / units.length)
    const stats = units.length ? { hp: avg(k => k.getBaseHp()), atk: avg(k => k.getBaseAtk()), def: avg(k => k.getBaseDef()) } : undefined
    roleStatCache.set(key, stats)
    return stats
}

// A support works only on a unit of its target role / element. PvPKioku checked the unit's own (Lux: Breaker, Light);
// engine battles check the identity's (adapter/NetworkUnits reads `data`), and Max Damage gives the passives from
// `effects`, so the effect list follows the identity too.
function matchSupportToIdentity(k: PvPKioku) {
    const kk = k as any, sup = kk.support
    if (!sup) return
    const id = sup.data.support_id * 100 + sup.supportLvl
    const applies = [k.data.role, k.data.element].includes(sup.data.support_target)
    const has = k.effects.some(e => (e as any).passiveSkillMstId === id)
    if (applies && !has) {
        const rows = Object.values(passiveDetails).filter((d: any) => d.passiveSkillMstId === id)
            .map(d => ({ ...d, _noEffectValueScale: true } as unknown as SkillDetail)) // support passives are never scaled (PvPKioku)
        k.effects.push(...rows)
        k.triggerOrderEffects.push(...rows)
    } else if (!applies && has) {
        k.effects = k.effects.filter(e => (e as any).passiveSkillMstId !== id)
        k.triggerOrderEffects = k.triggerOrderEffects.filter(e => (e as any).passiveSkillMstId !== id)
    }
}

// ── Average self buffs of the 5 star Attackers (on the dealer / reference Lux)

// What counts: the stat buffs below, from every 5 star Attacker's kit at the given levels (EX crystalis included) that
// land on the Attacker itself (own and team-wide buffs, the effect list's `applies` for the dealer), the strongest rung of
// each ladder of exclusive ones. Summed per type and skill restriction over all of them, divided by their number.
// Left out: kit-specific states (UNIQUE_BUFF*, shields, DMG taken down, ...), and buffs only for follow-ups or Ether Blows
// (Lux has neither). Ultimate- / Battle Skill-only buffs keep that restriction; enemy-count conditions are checked for
// the run's enemy count; every other condition counts as met (as Max Damage does).
const SELF_BUFF_TYPES = new Set(["UP_ATK_RATIO", "UP_ATK_ACCUM_RATIO", "UP_GIV_DMG_RATIO", "UP_GIV_DMG_ACCUM_RATIO",
    "UP_CTR_FIXED", "UP_CTR_RATIO", "UP_CTR_ACCUM_RATIO", "UP_CTD_FIXED", "UP_CTD_RATIO", "UP_CTD_ACCUM_RATIO",
    "UP_SPD_RATIO", "UP_SPD_ACCUM_RATIO", "UP_WEAK_ELEMENT_DMG_RATIO", "UP_WEAK_ELEMENT_DMG_ACCUM_RATIO",
    "UP_ELEMENT_DMG_RATE_RATIO", "UP_EP_RECOVER_RATE_RATIO"])
// The game's condition sets for "own Ultimate" / "own Battle Skill" (ActorSkillType + Self.IsActor).
const SPECIAL_ONLY = "317", SKILL_ONLY = "316"
export type SelfBuffScope = "all" | "special" | "skill"
export interface AverageSelfBuff { type: string, scope: SelfBuffScope, value1: number }

function selfBuffScope(csv: string | undefined, enemies: number): SelfBuffScope | undefined {
    if (!unitCountConditionsMet([csv], 5, enemies)) return undefined
    const types = actorSkillTypeRestriction(csv)
    if (!types) return "all"
    if (types.has("SpecialAttack") && types.has("ActiveSkill")) return "all"
    return types.has("SpecialAttack") ? "special" : types.has("ActiveSkill") ? "skill" : undefined
}

const selfBuffCache = new Map<string, AverageSelfBuff[]>()
/** The average self buffs of the 5 star Attackers (see above) at `levels`, against `enemies` enemies. */
export function averageAttackerSelfBuffs(enemies: number, levels: Pick<KiokuArgs, "ascension" | "kiokuLvl" | "magicLvl" | "heartphialLvl" | "specialLvl">): AverageSelfBuff[] {
    const key = [enemies, levels.ascension, levels.kiokuLvl, levels.magicLvl, levels.heartphialLvl, levels.specialLvl].join(":")
    let v = selfBuffCache.get(key)
    if (v) return v
    const names = Object.entries(kiokuData).filter(([, d]) => d.rarity === 5 && d.role === KiokuRole.Attacker).map(([n]) => n)
    const filler = benchKioku({ ...levels, name: LuxMagica, ascension: 0 }, { element: undefined, role: undefined })
    const sum = new Map<string, number>()
    for (const name of names) {
        const x = benchKioku({ ...levels, name })
        for (const e of collectTeamEffects([x, filler, filler, filler, filler], 0)) {
            if (e.casterPos !== 0 || e.side !== "ally" || !e.applies || (e.tier && e.tier.rank > 0)) continue
            if (!SELF_BUFF_TYPES.has(e.detail.abilityEffectType)) continue
            const scope = selfBuffScope(e.detail.activeConditionSetIdCsv, enemies)
            if (!scope) continue
            const k = `${e.detail.abilityEffectType}|${scope}`
            sum.set(k, (sum.get(k) ?? 0) + (e.detail.value1 ?? 0) * e.maxStacks)
        }
    }
    v = [...sum].map(([k, total]) => {
        const [type, scope] = k.split("|")
        return { type, scope: scope as SelfBuffScope, value1: names.length ? Math.round(total / names.length) : 0 }
    }).filter(b => b.value1 > 0)
    selfBuffCache.set(key, v)
    return v
}

/** Gives a bench unit `buffs` as a made-up passive (EngineBench.benchPassive), equipped like a crystalis: engine battles
 *  trigger it at battle start, Max Damage gives it from the effect list. Element-limited DMG buffs are for `k`'s element. */
function giveSelfBuffs(k: PvPKioku, buffs: AverageSelfBuff[]) {
    const element = Number(Object.entries(elementMap).find(([, e]) => e === k.data.element)?.[0] ?? 0)
    const rows: BenchPassiveRow[] = buffs.map(b => ({
        type: b.type, value1: b.value1,
        element: b.type === "UP_ELEMENT_DMG_RATE_RATIO" ? element : 0,
        activeConditionSetIdCsv: b.scope === "special" ? SPECIAL_ONLY : b.scope === "skill" ? SKILL_ONLY : "",
    }))
    const p = benchPassive(rows)
    const kk = k as any
    kk.crys.push(p.passiveSkillMstId)
    k.effects.push(...p.details)
    k.triggerOrderEffects.push(...p.details)
}

const DAMAGE_TYPES = new Set(["DMG_ATK", "DMG_DEF", "DMG_HP", "DMG_RANDOM"])

/** Every skill / passive row of a kit: basic attack, battle skill, ultimate, passives, and the follow-ups they grant. */
function kitDetails(k: PvPKioku): SkillDetail[] {
    const details: SkillDetail[] = []
    for (const type of [TargetType.attackId, TargetType.skillId, TargetType.specialId]) {
        const id = (k.data as any)[TargetTypeLookup[type as keyof typeof TargetTypeLookup]]
        const lvl = (k as any)[targetTypeToLvl[type as keyof typeof targetTypeToLvl]] ?? 1
        details.push(...(skillDetailsByMstId.get(id * 100 + lvl) ?? []) as SkillDetail[])
    }
    details.push(...k.effects)
    for (const d of [...details]) {
        if (d.abilityEffectType === "ADDITIONAL_SKILL_ACT") details.push(...(skillDetailsByMstId.get(d.value1) ?? []) as SkillDetail[])
    }
    return details
}

/** Kits whose effects react to crits: a "critical hit happened" condition (CTDUnitCount 303, e.g. Absolute Rain's
 *  "on critical hit, ATK +10%") or a state used up by a crit (UP/DWN_CTD_CONSUME_FIXED). For those the expected-crit
 *  shortcut would miss the procs, so their battles roll crits as in the game. */
export function kitReactsToCrits(k: PvPKioku): boolean {
    return kitDetails(k).some(d => d.abilityEffectType.includes("CTD_CONSUME") || critConditionUsed([d.startConditionSetIdCsv, d.activeConditionSetIdCsv]))
}

/** Elements and roles a kit's effects are limited to: the TargetElement/TargetRole of its effects (damage effects
 *  aside, where `element` is the attack element) and the IS_ELEMENT_TYPE / IS_ROLE_TYPE conditions they use.
 *  Covers the basic attack, battle skill, ultimate, every passive and the follow-up skills they grant. */
export function kitRestrictions(k: PvPKioku): { elements: KiokuElement[], roles: KiokuRole[], ailments: Ailment[] } {
    const details = kitDetails(k)
    const elements = new Set<KiokuElement>(), roles = new Set<KiokuRole>(), ailments = new Set<Ailment>()
    for (const d of details) {
        ailmentConditionValues([d.startConditionSetIdCsv, d.activeConditionSetIdCsv]).forEach(a => ailments.add(a))
        if (!DAMAGE_TYPES.has(d.abilityEffectType)) {
            if (d.element && elementMap[d.element]) elements.add(elementMap[d.element])
            if ((d as any).role && roleMap[(d as any).role]) roles.add(roleMap[(d as any).role])
        }
        const cond = unitTypeConditionValues([d.startConditionSetIdCsv, d.activeConditionSetIdCsv])
        cond.elements.forEach(e => elements.add(e as KiokuElement))
        cond.roles.forEach(r => roles.add(r as KiokuRole))
    }
    return { elements: [...elements], roles: [...roles], ailments: [...ailments] }
}

/** The ailment an effect type gives (WEAKNESS, CURSE_ATK -> CURSE, BLEED_ATK -> BLEED, ...), if any. */
const ailmentOfType = (type: string): Ailment | undefined =>
    (Object.values(Ailment) as string[]).find(a => type === a || type.startsWith(a + "_")) as Ailment | undefined

/** Max Burst: the dealer's Ultimate, every hit a crit, total over every enemy it hits. With `ailment`, every enemy
 *  carries it and the team's ailment conditions are checked against it (the other conditions count as met).
 *  `immune`: ailments the enemies cannot carry (benchImmunities, as in Average Damage): the team's effects that give
 *  them are left out (Max Damage gives every effect as landed, so the dummies' parry alone would not stop them). */
export function ultimateDamage(allies: PvPKioku[], dealerPos: number, enemyCount: number, ailment?: Ailment, immune: Ailment[] = []): { damage: number, critChance: number } {
    const { stageId, enemies } = benchStage(enemyCount, immune)
    const excluded = immune.length ? new Set(collectTeamEffects(allies, dealerPos, { slipDamage: true })
        .filter(e => immune.includes(ailmentOfType(e.detail.abilityEffectType)!)).map(e => e.key)) : undefined
    const result = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, enemies, dealerPos, {
        battleType: BattleType.Solo,
        broken: enemies.map(() => true),
        breakRate: enemies.map(() => BENCH_BROKEN_RATE),
        mainTargetIdx: Math.trunc(enemyCount / 2),
        onlyPos: dealerPos,
        enemyStates: enemyStatesOf(ailment),
        excluded,
    })
    const ult = result.members[dealerPos]?.skills.find(s => s.type === TargetType.specialId)
    return { damage: ult?.total.crit ?? 0, critChance: ult?.critChance ?? 0 }
}

export interface SimOptions {
    av: number          // action value to play (100 AV = 1 turn)
    seed: number
    rngMode?: RngMode   // only "seed" (drawn per roll label, see EngineBench.BenchRng)
    infiniteSp?: boolean // the allies' SP is refilled before every turn, see SP_REFILL (bench-only, not a game rule)
    ailment?: Ailment   // every enemy carries this ailment for the whole run
    immune?: Ailment[]  // ailments that never land on the enemies (100% parry on the dummies), see benchImmunities
    // APP MOD (not game code): every hit deals its expected crit damage (runtime.AppMods.expectedCritDamage)
    expectedCrits?: boolean
    onAction?: (state: BattleSnapshot, elapsed: number) => void  // every counted action (debugging)
    // Whether anything in the run was random (a real roll). The engine has no "expected crit" damage (a hit crits or
    // not), so a run with crit chances between 0 and 100% is random and is averaged over seeds (LuxBenchCharts.simTotal).
    report?: { random: boolean }
    // [BENCH] Damage per AV instead of a hard cut at `av`: the damage of the dealer's actions within the run, divided by
    // the time of its next own turn (scaled back to `av`). Speed then counts continuously: a turn that comes 3 AV earlier
    // shows, where with the hard cut it only matters once it fits one more action in.
    perAv?: boolean
    // [BENCH] "break": count the break gauge the dealer removes instead of its damage (trackBreak), on dummies whose
    // gauge never runs out (benchStage `gauge`) except for one break each, see simulatedDealerDamage
    measure?: "damage" | "break"
    // [BENCH] Filled with the SP the dealer's own actions cost over the run (scaled like the result with perAv): SP
    // spent minus SP it generated (a Basic Attack +1, its SP-gain effects), see trackSp
    sp?: { cost: number }
}

/** [BENCH] Instrumentation, not game code: the break value of every hit as the game computes it, reported with the
 *  hit's attacker: BreakPoint.Decrease (0x14A2800) passes its processed break damage (CalculateProcessedBreakPointDamage)
 *  to DecreaseValue before the clamp to the gauge, so a hit that empties the gauge still counts in full. A dummy that is
 *  still broken when the next hit's Decrease runs (Decrease removes nothing while broken) is first recovered the way the
 *  game recovers a broken unit at its turn start (ActExecutor.TurnBegin: BreakPoint.ResetValue, broken rate 0), so it is
 *  only broken in between: the rest of the breaking action's hits count too. Returns the undo. */
function trackBreak(onValue: (attacker: any, value: number) => void): () => void {
    const proto = E.BreakPoint.prototype as any
    const decrease = proto.Decrease, decreaseValue = proto.DecreaseValue
    const stack: any[] = []
    proto.Decrease = function (this: any, attackUnit: any, defenseUnit: any, ...rest: any[]) {
        if (this.get_HasBreakPoint() && this.get_IsBreak()) recoverBreak(defenseUnit)
        stack.push(attackUnit)
        try { return decrease.call(this, attackUnit, defenseUnit, ...rest) } finally { stack.pop() }
    }
    proto.DecreaseValue = function (this: any, value: number) {
        if (stack.length) onValue(stack[stack.length - 1], value)
        return decreaseValue.call(this, value)
    }
    return () => { proto.Decrease = decrease; proto.DecreaseValue = decreaseValue }
}

/** [BENCH] A broken unit's turn-start recovery (ActExecutor.TurnBegin, a broken unit that can act): gauge full, broken
 *  damage rate 0. */
function recoverBreak(unit: any) {
    unit._BreakPoint.ResetValue()
    unit.BreakedDamageReceiveRate = 0
}

/** [BENCH] Instrumentation, not game code: every SpReferee.AddSp made while a unit runs a Basic Attack, a Battle Skill
 *  or an SP-gain effect is reported as that unit's (NormalAttack.Execute +1, ActiveSkill.Execute -cost with step-ups,
 *  GainSpFixedAbilityEffect.Triggering +v1; those are the only AddSp callers). The requested amount counts, before
 *  the 0..6 clamp. Returns the undo. */
function trackSp(onAdd: (user: any, sp: number) => void): () => void {
    const stack: any[] = []
    const undo: (() => void)[] = []
    const wrap = (proto: any, name: string, userArg: number) => {
        const orig = proto[name]
        proto[name] = function (this: any, ...a: any[]) {
            stack.push(a[userArg])
            try { return orig.apply(this, a) } finally { stack.pop() }
        }
        undo.push(() => { proto[name] = orig })
    }
    wrap(E.NormalAttack.prototype, "Execute", 2)
    wrap(E.ActiveSkill.prototype, "Execute", 2)
    wrap(E.GainSpFixedAbilityEffect.prototype, "Triggering", 1)
    const ref = E.SpReferee.prototype as any, add = ref.AddSp
    ref.AddSp = function (this: any, team: any, sp: number) {
        if (stack.length) onAdd(stack[stack.length - 1], sp)
        return add.call(this, team, sp)
    }
    undo.push(() => { ref.AddSp = add })
    return () => { for (const f of undo.reverse()) f() }
}

// How players actually run some kits, where the bench's default play (Battle Skill whenever there is SP, ally-target
// skills on the dealer) is unrealistic.
//   Tenebrous Arcana: her Battle Skill gives 1 Magic and an extra action, her Ultimate 3 Magic, and her Basic Attack
//   always consumes 3 Magic (boosted at 3, passive 15035): Basic Attack whenever she is at 3 Magic, Battle Skill
//   otherwise (never a Battle Skill at 3 Magic). A streak count (3 skills, then attack) missed the Magic from her
//   Ultimate: she then cast 3 Battle Skills at full Magic first.
//   Thunder Torrent: always her Battle Skill, its haste on the dealer (another ally when she is the dealer), never
//   herself.
//   Judgement Earth: her Battle Skill (heal, MP, and at A2 "special attack DMG +20%" on whoever it heals) on the dealer.
//   Baldamente Fortissimo: her debuff comes from her counterattack, and the dummies never attack. Her counter's
//   elemental RES down (follow-up 650310, 5% x 3 stacks) is kept on the main target at max stacks for the whole run.
const PLAY_PATTERNS: Record<string, {
    action?: (streak: number, self: any) => "skill" | "attack"
    // ally target: the unit to put it on (undefined: the default, the dealer)
    target?: (self: any, dealer: any, allies: any[]) => any
    // skill rows whose states this unit keeps on the main target for the whole run, at max stacks
    enemyStates?: () => SkillDetail[]
}> = {
    "Judgement Earth": { target: (self, dealer) => dealer !== self ? dealer : undefined },
    "Baldamente Fortissimo": {
        enemyStates: () => ((skillDetailsByMstId.get(650310) ?? []) as SkillDetail[]).filter(d => d.abilityEffectType === "DWN_ELEMENT_RESIST_ACCUM_RATIO"),
    },
    "Tenebrous Arcana": { action: (_streak, self) => self._Condition._ChargePoint >= 3 ? "attack" : "skill" },
    "Thunder Torrent": {
        action: () => "skill",
        target: (self, dealer, allies) => dealer !== self ? dealer : allies.find(k => k !== self && !k.IsDead),
    },
}

/** Average Damage: total damage dealt by the dealer slot during a bench battle of `opts.av` action value (with
 *  `measure: "break"`, the break gauge it removes).
 *  Break runs [BENCH]: the dummies' gauge never runs out (benchStage `gauge`), but at the dealer's first decision every
 *  dummy's gauge is set to 1 point, so the dealer's first hit on each breaks it through the game's break code and
 *  "on enemy break" effects trigger once (as in the damage runs, whose 1-point gauges break on the first hit). A broken
 *  dummy is recovered before the next action or break hit (trackBreak / recoverBreak), and every hit counts the break
 *  value the game computes for it, the breaking one included: the result is what the dealer would remove from a gauge
 *  that never runs out, plus what its on-break effects add. */
export function simulatedDealerDamage(allies: PvPKioku[], dealerPos: number, enemyCount: number, opts: SimOptions): number {
    const breakRun = opts.measure === "break"
    const { stageId } = benchStage(enemyCount, opts.immune ?? [], breakRun)
    const nameOf = (u: any) => allies[u._PositionId - 1]?.name
    let director: any
    const allyUnits = () => [...director.battleUnitBundle.allyList].sort((a: any, b: any) => a._PositionId - b._PositionId)
    const dealerUnit = () => allyUnits()[dealerPos]
    let actor: any
    const streak = new Map<any, number>()
    // The bench's play (Manual control answered by BenchRng): ultimates as soon as they are ready, Battle Skill whenever
    // there is SP (PLAY_PATTERNS aside), enemy targets on the middle dummy, ally targets on the dealer.
    const rng = new BenchRng(opts.seed, (kind, _label, options, units) => {
        if (kind === "action") {
            if (options[0] === "Continue") return 1 // between actions: fire the first ready ultimate
            const want = PLAY_PATTERNS[nameOf(actor)]?.action?.(streak.get(actor) ?? 0, actor)
            const skill = options.findIndex(o => o.startsWith("Battle Skill")), attack = options.indexOf("Basic Attack")
            const i = want === "attack" ? attack : skill >= 0 ? skill : attack
            streak.set(actor, i === skill ? (streak.get(actor) ?? 0) + 1 : 0)
            return i
        }
        if (kind === "target" && units?.length) {
            if (units[0]._Team !== 0) return Math.max(0, units.indexOf(middleEnemy(director)))
            const dealer = dealerUnit()
            const pick = PLAY_PATTERNS[nameOf(actor)]?.target?.(actor, dealer, allyUnits()) ?? dealer
            return Math.max(0, units.indexOf(pick))
        }
        return 0
    })
    // Kit special cases (PLAY_PATTERNS.enemyStates): kept on the main target as if given by that unit, at max stacks.
    const preApplied = allies.flatMap((k, pos) => (PLAY_PATTERNS[k.name]?.enemyStates?.() ?? []).map(d => ({ pos, d })))
    const keep = (d: any) => {
        director = d
        keepAilment(d, opts.ailment)
        for (const { pos, d: row } of preApplied) {
            const main = middleEnemy(d)
            const id = (row as any).skillDetailMstId as number
            if (main && !main._Condition._StateList.some((s: any) => s._MstId === id && s._UserUnitId === allyUnits()[pos]?._Id)) {
                keepStates(d, allyUnits()[pos], main, [id], () => Math.max(1, row.value2 || 1))
            }
        }
    }
    let lastRefill = -1
    let primed = !breakRun
    const enemyUnits = () => [...director.battleUnitBundle.enemyList] as any[]
    // before every action: the kept states, and (break runs) a broken dummy recovers
    const prepare = (d: any) => {
        keep(d)
        if (breakRun) for (const u of enemyUnits()) if (u._BreakPoint.get_IsBreak()) recoverBreak(u)
    }
    const battle = benchBattle(allies, stageId, rng, {
        beforeAction: prepare,
        // Refill only when time has moved since the last refill: an extra action at the same moment (a haste to 100%,
        // Tenebrous Arcana's extra action) keeps the SP it has.
        beforeDecision: (unit, b) => {
            actor = unit
            // break runs: one break per dummy, by the dealer's first hit (see the doc comment)
            if (!primed && unit === dealerUnit()) {
                primed = true
                for (const u of enemyUnits()) if (u._BreakPoint._PointValue > 1) u._BreakPoint._PointValue = 1
            }
            if (!opts.infiniteSp) return
            if (lastRefill < 0 || b.elapsed > lastRefill) {
                const sp = b.director.spReferee
                sp.allySp = Math.max(sp.allySp, SP_REFILL)
                lastRefill = b.elapsed
            }
        },
    })
    director = battle.director
    let total = 0
    const mods = E.AppMods // runtime.AppMods (APP MOD switches, not game code)
    const savedMod = mods.expectedCritDamage
    mods.expectedCritDamage = !!opts.expectedCrits
    let spCost = 0
    const untrack = opts.sp ? trackSp((user, sp) => { if (user === dealerUnit()) spCost -= sp }) : undefined
    const untrackBreak = breakRun ? trackBreak((attacker, v) => { if (attacker === dealerUnit()) total += v }) : undefined
    try {
    // A vortex pops inside the hit that sets it off; the engine reports it with that hit (its attacker), not as its
    // owner's damage [APPROXIMATION vs the old bench, which moved it to the owner].
    // (break runs count in trackBreak)
    const count = (events: BattleEvent[] | undefined) => {
        if (breakRun) return
        for (const ev of events ?? []) {
            if (!ev.sourceIsTeam1 || ev.sourcePos !== dealerPos) continue
            if (ev.kind === "hit" || ev.kind === "dot") total += ev.amount
        }
    }
    // An action counts if it starts within the run: the one that would start after it is played (the battle only
    // knows its time once it advances to it) but not counted.
    const isDealerTurn = (st: BattleSnapshot) => st.lastTeamIsTeam1 && st.lastActorPos === dealerPos && !st.actionLabel
        && st.lastTargetType !== TargetType.fuaId
    let nextTurn = 0
    while (!battle.isOver) {
        prepare(director)
        const spBefore = spCost, totalBefore = total
        const states = battle.executeNextAction()
        if (!states.length) break
        if (battle.elapsed > opts.av) {
            spCost = spBefore // the action past the run doesn't count
            total = totalBefore
            if (states.some(isDealerTurn)) nextTurn = battle.elapsed
            break
        }
        for (const state of states) { count(state.events); opts.onAction?.(state, battle.elapsed) }
    }
    untrack?.()
    untrackBreak?.()
    // Per-AV rate: play on (counting nothing) to the dealer's first own turn past the run.
    if (opts.perAv && !nextTurn) {
        while (!battle.isOver && battle.elapsed < opts.av * 3) {
            prepare(director)
            const states = battle.executeNextAction()
            if (!states.length) break
            if (states.some(isDealerTurn)) { nextTurn = battle.elapsed; break }
        }
    }
    // random beyond crits: a crit roll only matters with rolled crits (with expected crits it only sets the IsCritical
    // flag, which nothing in a team without crit reactions reads)
    if (opts.report) opts.report.random = rng.events.some(e => !opts.expectedCrits || e.kind !== "crit")
    const scale = opts.perAv && nextTurn > 0 ? opts.av / nextTurn : 1
    if (opts.sp) opts.sp.cost = spCost * scale
    return total * scale
    } finally {
        untrack?.()
        untrackBreak?.()
        mods.expectedCritDamage = savedMod
    }
}

// ── The two Kioku Grid charts ──

const identityKey = (id: BenchIdentity) => `${id.element ?? "-"}/${id.role ?? "-"}/${id.ailment ?? "-"}`

/** Max Burst and Average Damage: an ailment the kit reacts to is a question of whether the enemies CAN carry it, not of who puts it
 *  there. A run without that ailment makes the enemies immune to it, so a kit that applies it itself and reacts to it
 *  (Bebe-O'-Lantern curses her Candyholic target, and Candyholic only lowers DEF while the target is cursed) shows
 *  the difference in its ailment bar instead of always having it. A run with one of them keeps it on the enemies
 *  (as before) and makes them immune to the kit's other ones. */
export const benchImmunities = (kitAilments: Ailment[], ailment?: Ailment): Ailment[] => kitAilments.filter(a => a !== ailment)

/** One bar of a chart: the gain (%) in one dealer identity. `critRate` is the dealer's Ultimate crit chance. */
export interface BenchRow extends BenchIdentity { gain: number, critRate?: number, sp?: number }

export interface BenchOptions {
    seeds: number   // rolled battles averaged for Average Damage when anything in it is random (see simTotal)
    av: number      // action value per battle
    infiniteSp?: boolean // see SimOptions
}

type KiokuInput = Omit<KiokuArgs, "crysIDs" | "subCrysIDs"> & Partial<KiokuArgs>

/**
 * Support chart: a Lux dealer with the character in slot 2 and three Lux fillers, compared to five Lux; the dealer
 * has no element or role (the main bar) or one the character's kit is limited to (variant bars). Attacker chart:
 * the character as the dealer (its own element and role) compared to Lux as the dealer with the average 5 star
 * Attacker stats (see benchKioku), the same for every role, both with four fillers. Always 5 units (user's choice).
 * Lux's baselines are computed once per identity / enemy count and reused. Every bench Lux (dealer, fillers,
 * reference) is A0 at max levels, so she has no follow-up. The dealer / reference Lux wear the bench gear and the
 * average 5 star Attacker self buffs; the characters measured get the gear from the caller (benchKioku `gear`).
 */
export class LuxBenchCharts {
    private readonly luxArgs: KiokuInput
    private readonly attackerLevels: KiokuInput
    private readonly reference: PvPKioku
    private readonly filler: PvPKioku
    private readonly dealers = new Map<string, PvPKioku>()
    private readonly references = new Map<string, PvPKioku>()
    private readonly ultBase = new Map<string, { damage: number, critChance: number }>()
    private readonly simBase = new Map<string, number>()
    private readonly opts: BenchOptions

    // Lux as given (the page passes A5, max levels), at A0 for every bench unit: her A1 follow-up charges a Magic from
    // every ally's battle skill, so at A5 a character casting several battle skills a turn (Tenebrous Arcana's extra
    // actions) showed as a damage buff.
    constructor(lux: KiokuInput, opts: BenchOptions) {
        this.luxArgs = { ...lux, ascension: 0 }
        // the Attackers whose self buffs Lux gets: Lux's levels at max ascension (the page passes A5, max levels)
        this.attackerLevels = { ...lux, ascension: KiokuConstants.maxAscension }
        this.opts = opts
        this.reference = benchKioku(this.luxArgs)
        this.filler = benchKioku(this.luxArgs, { element: undefined, role: undefined })
    }

    // The dealer / reference Lux: bench gear plus the average Attacker self buffs (they depend on the enemy count).
    private gearedLux(as: BenchIdentity, enemies: number): PvPKioku {
        const k = benchKioku(this.luxArgs, as, true)
        giveSelfBuffs(k, averageAttackerSelfBuffs(enemies, this.attackerLevels))
        return k
    }

    private dealer(id: BenchIdentity, enemies: number): PvPKioku {
        const key = `${enemies}:${identityKey({ element: id.element, role: id.role })}`
        let k = this.dealers.get(key)
        if (!k) this.dealers.set(key, k = this.gearedLux({ element: id.element, role: id.role }, enemies))
        return k
    }

    // Attacker chart baseline: Lux as the dealer with the average 5 star Attacker stats, the same for every role, so the
    // bars of all roles share one 0% line (a per-role baseline made a Defender's 0% a third of an Attacker's).
    private roleReference(role: KiokuRole, enemies: number): PvPKioku {
        const key = `${enemies}:${role}`
        let k = this.references.get(key)
        if (!k) this.references.set(key, k = this.gearedLux({ role }, enemies))
        return k
    }

    private team(dealer: PvPKioku, second?: PvPKioku): PvPKioku[] {
        return [dealer, second ?? this.filler, this.filler, this.filler, this.filler]
    }

    // The dealer's average damage over one run. A team where a kit reacts to crits (kitReactsToCrits) rolls its crits as
    // in the game: the mean of `seeds` battles (seeds 0..seeds-1). Every other team uses the expected-crit APP MOD
    // (runtime.AppMods.expectedCritDamage, not game code): one battle gives the average; `seeds` battles only when
    // something else in it is random (proc chances, random targets).
    // `spOut`: filled with the dealer's SP cost over the run, averaged the same way.
    private simTotal(team: PvPKioku[], enemies: number, ailment?: Ailment, immune: Ailment[] = [], measure: SimOptions["measure"] = "damage", spOut?: { cost: number }): number {
        const expectedCrits = !team.some(k => kitReactsToCrits(k))
        const base = { av: this.opts.av, infiniteSp: this.opts.infiniteSp, expectedCrits, ailment, immune, perAv: true, measure }
        const report = { random: false }
        const sp = { cost: 0 }
        let total = simulatedDealerDamage(team, 0, enemies, { ...base, seed: 0, report, sp: spOut && sp })
        let spTotal = sp.cost
        if (!report.random) {
            if (spOut) spOut.cost = spTotal
            return total
        }
        for (let seed = 1; seed < this.opts.seeds; seed++) {
            total += simulatedDealerDamage(team, 0, enemies, { ...base, seed, sp: spOut && sp })
            spTotal += sp.cost
        }
        if (spOut) spOut.cost = spTotal / this.opts.seeds
        return total / this.opts.seeds
    }

    private cachedUlt(key: string, team: () => PvPKioku[], enemies: number, ailment?: Ailment, immune: Ailment[] = []) {
        key += `:${[...immune].sort().join(",")}`
        let v = this.ultBase.get(key)
        if (!v) this.ultBase.set(key, v = ultimateDamage(team(), 0, enemies, ailment, immune))
        return v
    }

    private cachedSim(key: string, team: () => PvPKioku[], enemies: number, ailment?: Ailment, immune: Ailment[] = []) {
        key += `:${[...immune].sort().join(",")}`
        let v = this.simBase.get(key)
        if (v === undefined) this.simBase.set(key, v = this.simTotal(team(), enemies, ailment, immune))
        return v
    }

    /** Dealer identities to test a support in: none, then each element / role / element+role its kit is limited to, then
     *  each ailment its kit reacts to, alone and with each of those elements / roles. */
    supportIdentities(x: PvPKioku): BenchIdentity[] {
        const { elements, roles, ailments } = kitRestrictions(x)
        const unit: BenchIdentity[] = [
            {},
            ...elements.map(element => ({ element })),
            ...roles.map(role => ({ role })),
            ...elements.flatMap(element => roles.map(role => ({ element, role }))),
        ]
        return [...unit, ...ailments.flatMap(ailment => unit.map(id => ({ ...id, ailment })))]
    }

    /** Attacker chart: the character's own identity, then each ailment its kit reacts to. */
    attackerIdentities(x: PvPKioku): BenchIdentity[] {
        return [{}, ...kitRestrictions(x).ailments.map(ailment => ({ ailment }))]
    }

    // The dealer's element / role when none is tested: Lux's own (Light, Breaker) unless the kit is limited to it, then
    // another one it isn't limited to. Every unit has both in game and they matter beyond restrictions: additional damage
    // (ADDITIONAL_DAMAGE, TSUBAME_LINK) is dealt in the attacker's own element (without one it misses the dummies'
    // weakness), and some ally targeting prefers roles (Thunder Torrent's haste picks an Attacker/Breaker ally).
    private neutral(x: PvPKioku): { element: KiokuElement, role: KiokuRole } {
        const { elements, roles } = kitRestrictions(x)
        const pick = <T,>(own: T, all: T[], limited: T[]) => !limited.includes(own) ? own : all.find(v => !limited.includes(v)) ?? own
        return {
            element: pick(this.reference.data.element as KiokuElement, Object.values(KiokuElement), elements),
            role: pick(this.reference.data.role as KiokuRole, Object.values(KiokuRole), roles),
        }
    }

    // A tested identity as the dealer actually is: untested parts replaced by the neutral ones.
    private resolve(id: BenchIdentity, x: PvPKioku): BenchIdentity {
        const n = this.neutral(x)
        return { element: id.element ?? n.element, role: id.role ?? n.role, ailment: id.ailment }
    }

    supportMax(x: PvPKioku, enemies = 1, ids = this.supportIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const dealer = this.dealer(this.resolve(id, x), enemies)
            const immune = benchImmunities(kitAilments, id.ailment)
            const base = this.cachedUlt(`s:${enemies}:${identityKey(this.resolve(id, x))}`, () => this.team(dealer), enemies, id.ailment, immune)
            const v = ultimateDamage(this.team(dealer, x), 0, enemies, id.ailment, immune)
            return { ...id, gain: pctGain(v.damage, base.damage), critRate: v.critChance }
        })
    }

    supportAvg(x: PvPKioku, enemies = 1, ids = this.supportIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const dealer = this.dealer(this.resolve(id, x), enemies)
            const immune = benchImmunities(kitAilments, id.ailment)
            const base = this.cachedSim(`s:${enemies}:${identityKey(this.resolve(id, x))}`, () => this.team(dealer), enemies, id.ailment, immune)
            return { ...id, gain: pctGain(this.simTotal(this.team(dealer, x), enemies, id.ailment, immune), base) }
        })
    }

    attackerMax(x: PvPKioku, enemies: number, ids = this.attackerIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const immune = benchImmunities(kitAilments, id.ailment)
            const base = this.cachedUlt(`a:${enemies}:${id.ailment ?? "-"}`, () => this.team(this.roleReference(KiokuRole.Attacker, enemies)), enemies, id.ailment, immune)
            const v = ultimateDamage(this.team(x), 0, enemies, id.ailment, immune)
            return { ...id, gain: pctGain(v.damage, base.damage), critRate: v.critChance }
        })
    }

    attackerAvg(x: PvPKioku, enemies: number, ids = this.attackerIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const immune = benchImmunities(kitAilments, id.ailment)
            const base = this.cachedSim(`a:${enemies}:${id.ailment ?? "-"}`, () => this.team(this.roleReference(KiokuRole.Attacker, enemies)), enemies, id.ailment, immune)
            return { ...id, gain: pctGain(this.simTotal(this.team(x), enemies, id.ailment, immune), base) }
        })
    }

    /** Break chart (Breakers, wearing benchKioku `gear: "break"`): the break gauge the character removes as the dealer
     *  (same team and play as attackerAvg) per 100 AV, summed over every enemy it hits. An absolute value (`gain` holds
     *  it), not compared to Lux. `sp`: the SP its own actions cost per 100 AV (trackSp; negative when it generates more
     *  than it spends). */
    attackerBreak(x: PvPKioku, enemies: number, ids = this.attackerIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const immune = benchImmunities(kitAilments, id.ailment)
            const sp = { cost: 0 }
            const brk = this.simTotal(this.team(x), enemies, id.ailment, immune, "break", sp)
            return { ...id, gain: brk * 100 / this.opts.av, sp: sp.cost * 100 / this.opts.av }
        })
    }
}

const pctGain = (value: number, base: number) => base > 0 ? (value / base - 1) * 100 : 0
