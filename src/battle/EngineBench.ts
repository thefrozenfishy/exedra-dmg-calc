// App side (not game code): the Kioku Grid bench (models/LuxBench.ts) on the 1:1 engine.
//
// The bench's dummies and identities are made-up master data, shaped exactly like the game's (added to the engine's
// readers with addMasterRecords), so the battle code treats them like any stage / unit:
//   - a quest stage per enemy count (and ailment-immunity set) with dummy enemies: DEF 3000, weak to every element,
//     HP out of reach (int max), SPD 1 (first turn after 10,000 AV: they never act within a run), no skills, no
//     passives, and a break table that keeps them broken at a fixed 500% (gauge 1, increase 0); an ailment the run
//     makes them immune to has its parry rate at 100% (fixed-probability ailments still land, as on any enemy);
//   - a style per identity (Lux as another element / role): Lux's StyleMst row with that element and role (a unit
//     always has both in the game: an identity left open keeps Lux's own, Light / Breaker).
// What is not data is bench setup, done the way a player or the server would: the dummies start broken (the break
// gauge at 0 with the initial broken rate, as BreakPoint.Decrease leaves it), the run's ailment is put on every dummy
// (the game's own state from a skill row of that type, re-added if anything removes it), and Average Damage plays
// the allies "by hand" (Manual control) with a fixed policy (BenchPolicy): ultimates as soon as ready, Battle Skill
// whenever there is SP, single-target skills on the middle dummy, ally-target skills on the dealer, plus the kit
// special cases of models/LuxBench.ts.
import { E } from "./engineBundle"
import { EngineBattle } from "./EngineBattle"
import { BattleRng, type RngKind } from "../models/BattleRng"
import { seededRng } from "../models/BattleMath"
import type { QuestEnemyAppearance } from "../models/PvE"
import type { BattleSnapshot } from "../types/KiokuTypes"
import { Ailment, elementMap, roleMap, type KiokuElement, type KiokuRole } from "../types/enums"
import styleMstJson from "../assets/base_data/getStyleMstList.json"
import skillDetailJson from "../assets/base_data/getSkillDetailMstList.json"
import skillMstJson from "../assets/base_data/getSkillMstList.json"

export const BENCH_DEF = 3000
export const BENCH_BROKEN_RATE = 500   // % damage taken while broken
const BENCH_HP = 2147483647            // int.MaxValue: never dies within a run
const BENCH_SPD = 1                    // the lowest SPD: first turn after 10,000 AV, never within a run

// Made-up master ids (far above the game's).
const BENCH_ENEMY_MST_ID = 990000001
const BENCH_BREAK_MST_ID = 990000001
const BENCH_STAGE_BASE = 990000000
const BENCH_STYLE_BASE = 990100000

// The appearance row's parry field of each ailment.
const PARRY_FIELD: Record<Ailment, string> = {
    [Ailment.BURN]: "burnParryRate", [Ailment.CURSE]: "curseParryRate", [Ailment.POISON]: "poisonParryRate",
    [Ailment.WOUND]: "bleedParryRate", [Ailment.STUN]: "stunParryRate", [Ailment.VORTEX]: "vortexParryRate",
    [Ailment.WEAKNESS]: "weaknessParryRate",
}
// The state each ailment is (the AbilityEffectType of a skill row that gives it).
export const AILMENT_STATE: Record<Ailment, string> = {
    [Ailment.BURN]: "BURN_ATK", [Ailment.CURSE]: "CURSE_ATK", [Ailment.POISON]: "POISON_ATK", [Ailment.WOUND]: "BLEED_ATK",
    [Ailment.STUN]: "STUN", [Ailment.VORTEX]: "VORTEX_ATK", [Ailment.WEAKNESS]: "WEAKNESS",
}

let baseRecordsAdded = false
function addBaseRecords() {
    if (baseRecordsAdded) return
    baseRecordsAdded = true
    E.addMasterRecords(E.EnemyMstModel, [{
        appearEffectPrefabName: "", canRotateModel: true, cueSheetName: "", enemyMstId: BENCH_ENEMY_MST_ID, enemyType: 1,
        enemyUniqueId: BENCH_ENEMY_MST_ID, iconResourceName: "", isCollectionDisp: false, isNoVisualDeath: false, modelPrefabName: "",
        name: "Dummy", releaseTime: "2024-01-01T00:00:00+09:00", runesName: "", size: 0, unlockType: 0, unlockValue: 0,
    }])
    E.addMasterRecords(E.BreakMstModel, [{
        breakMstId: BENCH_BREAK_MST_ID, breakPoint: 1, breakPointRecoveryPerTurn: 0, breakTurnGaugeSlowRatio: 0,
        breakedDamageReceiveRateIncreaseRate: 0, initialBreakedDamageReceiveRate: BENCH_BROKEN_RATE * 10, maxBreakedDamageReceiveRate: BENCH_BROKEN_RATE * 10,
    }])
}

const stages = new Map<string, { stageId: number, enemies: QuestEnemyAppearance[] }>()

/** The bench stage with `count` dummies (immune to `immune`): its id and the dummies' appearance rows (wave order;
 *  the middle one is the main target). */
export function benchStage(count: number, immune: readonly Ailment[] = []): { stageId: number, enemies: QuestEnemyAppearance[] } {
    const key = `${count}:${[...immune].sort().join(",")}`
    let s = stages.get(key)
    if (s) return s
    addBaseRecords()
    const stageId = BENCH_STAGE_BASE + stages.size * 10 + count
    const parry = Object.fromEntries(Object.values(PARRY_FIELD).map(f => [f, 0]))
    for (const a of immune) parry[PARRY_FIELD[a]] = 1000
    const main = Math.trunc(count / 2)
    const enemies = Array.from({ length: count }, (_, i) => ({
        questEnemyAppearanceMstId: stageId * 10 + i, questStageMstId: stageId, enemyMstId: BENCH_ENEMY_MST_ID, wave: 0,
        atk: 0, def: BENCH_DEF, hp: BENCH_HP, speed: BENCH_SPD, criticalRate: 0, criticalDamageRate: 0, effectHitRate: 0, effectParryRate: 0,
        breakMstId: BENCH_BREAK_MST_ID, passiveSkillMstId: 0, enemySkillSetId: 0, enemyConditionSkillSetId: 0, healRate: 0,
        hpGaugeCount: 0, startHpGaugeCount: 0, isMainTargetEnemy: i === main, isSkipDeathMotion: false, conditionType: 0, conditionValue: 0,
        summonId: 0, linkHpWeight: 0, modeChangeEffectTxt: "",
        // weak to every element, no resistances or element modifiers
        weakElement1: 1, weakElement2: 2, weakElement3: 3, weakElement4: 4, weakElement5: 5, weakElement6: 6,
        ...Object.fromEntries(["fire", "aqua", "forest", "light", "dark", "neutral"].flatMap(e => [[`${e}AimDamageRate`, 0], [`${e}DamageRate`, 0], [`${e}ResistRate`, 0]])),
        ...parry,
    })) as unknown as QuestEnemyAppearance[]
    E.addMasterRecords(E.QuestEnemyAppearanceMstModel, enemies)
    E.addMasterRecords(E.QuestStageMstModel, [{
        afterBattleScenarioMstId: 0, beforeBattleScenarioMstId: 0, bgmCueName: "", bgmCueSheetName: "", characterExp: 0, characterHeartExp: 0,
        conditionGroupId: 0, description: "", detail: "", difficulty: 1, element: 0, endDirectionName: "", exp: 0, firstClearExp: 0,
        firstClearMoney: 0, firstClearRewardGroupId: 0, firstClearStyleExp: 0, isAutoModeOff: 0, judgeResultType: 0, judgeResultValue: 0,
        money: 0, name: `Bench_${count}`, overrideComponentPrefabName: "", prevQuestStageMstId: 0, questGroupMstId: 0, questMissionGroupId: 0,
        questStageMstId: stageId, recommendationElement: 0, recommendationElementCsv: "", recommendationPartyPower: 0, resourceName: "0",
        rewardGroupId: 0, selectionAbilityLotteryMstId: 0, stagePrefabName: "", styleExp: 0, useStamina: 0,
    }])
    stages.set(key, s = { stageId, enemies })
    return s
}

const styles = new Map<string, number>()
const styleById = new Map<number, any>((styleMstJson as any[]).map(s => [s.styleMstId, s]))
const numberOf = <T extends string>(map: Record<string, T>, v: T): number => Number(Object.entries(map).find(([, x]) => x === v)?.[0] ?? 0)

/** A style like `styleMstId` with another element / role: the unit's style id for engine battles. Every unit has an
 *  element and a role in the game (a role of 0 throws in DmgAbilityEffectBase.IncreaseBreakedDamageReceiveRate), so
 *  an identity left undefined keeps the style's own (Lux: Light, Breaker). */
export function benchStyle(styleMstId: number, element: KiokuElement | undefined, role: KiokuRole | undefined): number {
    const base = styleById.get(styleMstId)
    if (!base) return styleMstId
    const el = element === undefined ? base.element : numberOf(elementMap, element)
    const ro = role === undefined ? base.role : numberOf(roleMap, role)
    if (el === base.element && ro === base.role) return styleMstId
    const key = `${styleMstId}:${el}:${ro}`
    let id = styles.get(key)
    if (id !== undefined) return id
    id = BENCH_STYLE_BASE + styles.size
    E.addMasterRecords(E.StyleMstModel, [{ ...base, styleMstId: id, element: el, role: ro, isCollectionDisp: false }])
    styles.set(key, id)
    return id
}

const BENCH_SKILL_BASE = 9900000
const skills = new Map<string, number>()
const skillMstById = new Map<number, any>((skillMstJson as any[]).map(r => [r.skillMstId, r]))
const detailRowsBySkill = new Map<number, any[]>()
for (const d of skillDetailJson as any[]) {
    const list = detailRowsBySkill.get(d.skillMstId)
    if (list) list.push(d)
    else detailRowsBySkill.set(d.skillMstId, [d])
}

/** The kit's basic attack / battle skill / ultimate (base ids and levels) as made-up skills whose damage rows are in
 *  `element` (the rest of each row as is): what `engineSkillIds` of a bench unit points the engine at, so a unit
 *  tested as an element also deals its damage in it (the legacy bench's damage element override, as game data). */
export function benchSkills(levels: { attack: [number, number], skill: [number, number], special: [number, number] }, element: KiokuElement): { attack: number, skill: number, special: number } {
    const el = numberOf(elementMap, element)
    const one = ([base, lvl]: [number, number]): number => {
        const key = `${base}:${lvl}:${el}`
        let id = skills.get(key)
        if (id !== undefined) return id
        const mstId = base * 100 + lvl
        const mst = skillMstById.get(mstId)
        const rows = detailRowsBySkill.get(mstId)
        if (!mst || !rows) return base
        id = BENCH_SKILL_BASE + skills.size
        const newMst = id * 100 + lvl
        E.addMasterRecords(E.SkillMstModel, [{ ...mst, skillMstId: newMst, skillUniqueId: id }])
        E.addMasterRecords(E.SkillDetailMstModel, rows.map(r => ({
            ...r, skillMstId: newMst, skillDetailMstId: newMst * 100 + (r.skillDetailMstId % 100),
            element: r.abilityEffectType.startsWith("DMG_") ? el : r.element,
        })))
        skills.set(key, id)
        return id
    }
    return { attack: one(levels.attack), skill: one(levels.skill), special: one(levels.special) }
}

// ---- bench setup on a director

/** Main target: the middle dummy. */
export function middleEnemy(director: any): any {
    const list = [...director.battleUnitBundle.enemyList].sort((a: any, b: any) => a._PositionId - b._PositionId)
    return list[Math.trunc(list.length / 2)]
}

/** Every dummy starts broken: gauge 0 and the initial broken rate (what BreakPoint.Decrease leaves after a break). */
export function breakDummies(director: any): void {
    for (const u of director.battleUnitBundle.enemyList) {
        const bp = u._BreakPoint
        if (!bp.get_HasBreakPoint()) continue
        bp._PointValue = 0
        bp._BreakCount = 1
        u.SetBreakedDamageReceiveRate(Math.trunc(u._BattleParameter._InitialBreakedDamageReceiveRate / 10))
    }
}

const detailByType = new Map<string, any>()
for (const d of skillDetailJson as any[]) if (!detailByType.has(d.abilityEffectType)) detailByType.set(d.abilityEffectType, d)

/** A StateAbilityEffect of a skill row (its state, buff strength of `user` applied as in StateAbilityEffect.Triggering). */
function stateOf(detailMstId: number, user: any, director: any): any {
    const model = E.BattleMstReaderBase.get_Instance(E.SkillDetailMstModel).GetModelByKey(detailMstId)
    if (!model) return null
    const effect = E.AbilityEffectFactory.Create(E.AbilityEffectInfo.CreateFromMst$SkillDetailMstModel_int(model, 0), false)
    if (!effect?._GiveUnitState) return null
    let state = effect._GiveUnitState.Clone()
    if (effect._AbilitySource === 1) state = effect.ChangeGiveUnitState(user, state)
    state.SetTriggeringInfo(1, user, false, false, director.get_BattleType())
    return state
}

/** Puts `type`'s ailment on every dummy that lacks it (the game's state of a skill row of that type, given by the dummy
 *  itself, probability ignored). It never ticks: DOT and turn counts run at the holder's turns, and dummies get none. */
export function keepAilment(director: any, ailment: Ailment | undefined): void {
    if (!ailment) return
    const row = detailByType.get(AILMENT_STATE[ailment])
    if (!row) return
    const prio = director.turnActSystem.turnReferee.get_NextTurnOrderPriority()
    for (const u of director.battleUnitBundle.enemyList) {
        if (u.IsDead || u._Condition._StateList.some((s: any) => s._MstId === row.skillDetailMstId)) continue
        const state = stateOf(row.skillDetailMstId, u, director)
        if (state) u._Condition.AddUnitState(state, u, prio, u, true)
    }
}

/** Gives the states of skill rows from `user` to `target`, `stacks` times each (an accum state then sits at its max). */
export function keepStates(director: any, user: any, target: any, detailMstIds: number[], stacks: (id: number) => number): void {
    if (!user || !target || target.IsDead) return
    const prio = director.turnActSystem.turnReferee.get_NextTurnOrderPriority()
    for (const id of detailMstIds) {
        for (let n = 0; n < stacks(id); n++) {
            const state = stateOf(id, user, director)
            if (state) target._Condition.AddUnitState(state, target, prio, user, true)
        }
    }
}

// ---- Average Damage battles

// FNV-1a
function hashLabel(s: string): number {
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
    return h >>> 0
}

/** The bench's decisions for a Manual-control battle (EngineBattle with manualTargeting): never throws, never asks. */
export type BenchPick = (kind: RngKind, label: string, options: string[], units: readonly any[] | undefined) => number

// "seed" mode, but every roll label ("Lux☆Magica (Ally 1) → Dummy (Enemy 1) crit", ...) draws from its own seeded
// stream instead of one shared one. The dealer's n-th crit roll then gets the same number with or without the
// character being measured, even when that character rolls things of its own in between, so comparing two runs of
// the same seed measures what the character changes and not which rolls happened to shift. Every stream is still
// uniform, so the average is unchanged. Bench-only: the game itself has one generator. Decisions (pick) come from
// `policy` instead of the player.
export class BenchRng extends BattleRng {
    private streams = new Map<string, () => number>()
    private readonly policy: BenchPick

    constructor(seed: number, policy: BenchPick) {
        super("seed", seed)
        this.policy = policy
    }

    protected override draw(kind: RngKind, label: string): number {
        const key = `${kind}|${label}`
        let stream = this.streams.get(key)
        if (!stream) this.streams.set(key, stream = seededRng((hashLabel(key) ^ Math.imul(this.seed, 0x9e3779b1)) >>> 0))
        return stream()
    }

    override pick(kind: RngKind, label: string, optionLabels: string[], units?: readonly unknown[]): number {
        if (optionLabels.length <= 1) return optionLabels.length - 1
        const i = this.policy(kind, label, optionLabels, units as readonly any[] | undefined)
        return i >= 0 && i < optionLabels.length ? i : 0
    }
}

export interface BenchBattleHooks {
    /** Before each executeNextAction (keep ailments / states on the dummies). */
    beforeAction?: (director: any) => void
    beforeDecision?: (unit: any, battle: EngineBattle) => void
}

/** A bench battle on the stage, set up (dummies broken, the player's target on the middle dummy). */
export function benchBattle(allies: any[], stageId: number, rng: BenchRng, hooks: BenchBattleHooks): EngineBattle {
    return new EngineBattle({ kind: "quest", allies, stageId }, {
        rng, manualTargeting: true, beforeDecision: hooks.beforeDecision,
        onSetup: d => {
            breakDummies(d)
            const main = middleEnemy(d)
            if (main) d.targetReferee.allyAttackTargetId = main._Id // the player taps the middle dummy
            hooks.beforeAction?.(d)
        },
    })
}

export type { BattleSnapshot }
