// PvE (quest stage) support for the battle engine: stage/enemy master data, the enemy unit
// adapter the engine runs on, and the enemy skill-selection AI.
// Ported from 3.19.0; see MISSING_AND_UNCERTAIN.md "Revision 8" for sources (RVAs) and open points.
import { rollChoice, type RngSource } from "./BattleRng";
import enemyMstJson from "../assets/base_data/getEnemyMstList.json";
import breakMstJson from "../assets/base_data/getBreakMstList.json";
import questGroupJson from "../assets/base_data/getQuestGroupMstList.json";
import questEnemySkillSetJson from "../assets/base_data/getQuestEnemySkillSetMstList.json";
import enemyConditionActionJson from "../assets/base_data/getEnemyConditionSetsAndActionMstList.json";
import questEnemyAppearanceJson from "../assets/base_data/getQuestEnemyAppearanceMstList.json";
import questStageJson from "../assets/base_data/getQuestStageMstList.json";
import skillMstJson from "../assets/base_data/getSkillMstList.json";
import questEnemyWaveJson from "../assets/base_data/getQuestEnemyWaveMstList.json";
import soloRaidStageJson from "../assets/base_data/getSoloRaidStageMstList.json";
import modeChangeJson from "../assets/base_data/getQuestEnemyModeChangeMstList.json";
import { passiveDetailsByMstId, skillDetailsByMstId } from "../utils/helpers";
import type { PassiveSkill, SkillDetail } from "../types/KiokuTypes";
import { isConditionSetActiveForPvP } from "./BattleConditionParser";
import type { KiokuState, PvPTeam } from "./PvPTeam";

// ---------------------------------------------------------------------------
// Master data
// ---------------------------------------------------------------------------
export interface QuestEnemyAppearance {
    questEnemyAppearanceMstId: number
    questStageMstId: number
    enemyMstId: number
    wave: number
    atk: number
    def: number
    hp: number
    speed: number
    criticalRate: number
    criticalDamageRate: number
    breakMstId: number
    passiveSkillMstId: number
    enemySkillSetId: number
    enemyConditionSkillSetId: number
    hpGaugeCount: number
    startHpGaugeCount: number
    isMainTargetEnemy: boolean
    conditionType: number
    summonId: number
    [key: string]: any
}

export interface BreakMst {
    breakMstId: number
    breakPoint: number
    breakPointRecoveryPerTurn: number
    breakTurnGaugeSlowRatio: number
    breakedDamageReceiveRateIncreaseRate: number
    initialBreakedDamageReceiveRate: number
    maxBreakedDamageReceiveRate: number
}

export interface QuestStage { questStageMstId: number, questGroupMstId: number, name: string, difficulty: number, [key: string]: any }
export interface QuestGroup { questGroupMstId: number, questCategoryMstId: number, name: string, sortOrder: number, startTime: string, [key: string]: any }

const enemyNames = new Map<number, string>((enemyMstJson as any[]).map(e => [e.enemyMstId, e.name]))
const breakMsts = new Map<number, BreakMst>((breakMstJson as any[]).map(b => [b.breakMstId, b]))
const skillNames = new Map<number, string>((skillMstJson as any[]).map(s => [s.skillMstId, s.name]))

const appearancesByStage = new Map<number, QuestEnemyAppearance[]>()
for (const a of questEnemyAppearanceJson as QuestEnemyAppearance[]) {
    (appearancesByStage.get(a.questStageMstId) ?? appearancesByStage.set(a.questStageMstId, []).get(a.questStageMstId)!).push(a)
}

export const questStages = new Map<number, QuestStage>((questStageJson as any[]).map(s => [s.questStageMstId, s]))

// English labels for QuestCategoryMst (the master only has Japanese names).
export const QUEST_CATEGORY_NAMES: Record<number, string> = {
    1: "Main Story", 4: "Upgrade Quests", 5: "Mirror Layers", 9: "Story Events", 10: "Heartphial Quests",
    11: "Score Attack", 12: "Link Raid", 13: "Exedra Quest", 14: "Exedra Crisis", 15: "Magical Girl Tower", 999: "Tutorial",
}
export const QUEST_CATEGORY_ORDER = [11, 12, 14, 15, 5, 9, 1, 13, 4, 10, 999]

export interface StageTreeGroup { group: QuestGroup, stages: QuestStage[] }
export interface StageTreeCategory { id: number, name: string, groups: StageTreeGroup[] }

// Category -> quest group -> stage, for the stage picker.
export function buildStageTree(): StageTreeCategory[] {
    const stagesByGroup = new Map<number, QuestStage[]>()
    for (const s of questStages.values()) {
        if (!appearancesByStage.has(s.questStageMstId)) continue
        (stagesByGroup.get(s.questGroupMstId) ?? stagesByGroup.set(s.questGroupMstId, []).get(s.questGroupMstId)!).push(s)
    }
    const cats = new Map<number, StageTreeGroup[]>()
    for (const g of questGroupJson as QuestGroup[]) {
        const stages = stagesByGroup.get(g.questGroupMstId)
        if (!stages?.length) continue
        stages.sort((a, b) => a.questStageMstId - b.questStageMstId);
        (cats.get(g.questCategoryMstId) ?? cats.set(g.questCategoryMstId, []).get(g.questCategoryMstId)!).push({ group: g, stages })
    }
    const order = (id: number) => { const i = QUEST_CATEGORY_ORDER.indexOf(id); return i < 0 ? 99 : i }
    return [...cats.entries()]
        .sort(([a], [b]) => order(a) - order(b))
        .map(([id, groups]) => ({
            id, name: QUEST_CATEGORY_NAMES[id] ?? `Category ${id}`,
            // Newest first (events/seasons), otherwise by sort order.
            groups: groups.sort((a, b) => b.group.startTime.localeCompare(a.group.startTime) || a.group.sortOrder - b.group.sortOrder || b.group.questGroupMstId - a.group.questGroupMstId),
        }))
}

// QuestEnemyModeChangeMst: an appearance that is one form (step) of a boss that changes form at an HP threshold.
export interface ModeChangeRow { questEnemyAppearanceMstId: number, step: number, type: number, thresholdValue: number }
const modeChangeRows = new Map<number, ModeChangeRow>((modeChangeJson as any[]).map(r => [r.questEnemyAppearanceMstId, r]))

// [CONFIRMED 3.19] WaveReferee.CreateEnemyUnitList -> QuestEnemyAppearanceMstReader.GetModelListForBattleStart
// (0x16d51c0): the appearances of (stage, wave) with conditionType 0 (3 = summons, AdditionalEnemyReferee), ordered
// by id; ModeChangeReferee.RemoveModeChangeFirstOther drops every form but step 1; QuestEnemyAppearanceMstModel.Sort
// (0x16d3b60) then puts the main target in the middle (index count/2; only the last main target is kept).
export function stageWaves(questStageMstId: number): QuestEnemyAppearance[][] {
    const rows = (appearancesByStage.get(questStageMstId) ?? []).filter(a => a.conditionType === 0)
    const waves = [...new Set(rows.map(a => a.wave))].sort((a, b) => a - b)
    return waves.map(w => {
        const list = rows.filter(a => a.wave === w && (modeChangeRows.get(a.questEnemyAppearanceMstId)?.step ?? 1) === 1)
            .sort((a, b) => a.questEnemyAppearanceMstId - b.questEnemyAppearanceMstId)
        const count = list.length
        const out: QuestEnemyAppearance[] = []
        let main: QuestEnemyAppearance | undefined
        for (const a of list) if (a.isMainTargetEnemy) main = a; else out.push(a)
        if (main) out.splice(Math.trunc(count / 2), 0, main)
        return out
    })
}

// [CONFIRMED 3.19] ModeChangeReferee.Init (0x149fea0): the main-target appearances of (stage, wave) are the boss's
// forms; with fewer than two there is no form change. Ordered by step.
export interface ModeChangeInfo { appearance: QuestEnemyAppearance, step: number, type: number, threshold: number }
export function modeChangeInfos(questStageMstId: number, wave: number): ModeChangeInfo[] {
    const mains = (appearancesByStage.get(questStageMstId) ?? []).filter(a => a.wave === wave && a.isMainTargetEnemy)
    if (mains.length < 2) return []
    return mains.flatMap(a => {
        const r = modeChangeRows.get(a.questEnemyAppearanceMstId)
        return r ? [{ appearance: a, step: r.step, type: r.type, threshold: r.thresholdValue }] : []
    }).sort((a, b) => a.step - b.step)
}

// Per-wave Link HP settings (QuestEnemyWaveMst), aligned with stageWaves().
// linkHpType 1 = "endless" wave: a shared pool of 100, each defeated enemy removes its linkHpWeight, and new
// enemies keep coming round-robin from the wave's list until the pool is empty.
// linkHpType 2 = every enemy of the wave shares one HP pool (the main target's HP).
export interface WaveMeta { linkHpType: number, linkHpName: string, appearances: QuestEnemyAppearance[], modeChanges: ModeChangeInfo[] }
const waveRows = new Map<string, { linkHpType: number, linkHpName: string }>(
    (questEnemyWaveJson as any[]).map(w => [`${w.questStageMstId}:${w.wave}`, { linkHpType: w.linkHpType ?? 0, linkHpName: w.linkHpName ?? "" }]))
export function stageWaveMeta(questStageMstId: number): WaveMeta[] {
    return stageWaves(questStageMstId).map(apps => {
        const row = waveRows.get(`${questStageMstId}:${apps[0]?.wave}`)
        return { linkHpType: row?.linkHpType ?? 0, linkHpName: row?.linkHpName ?? "", appearances: apps, modeChanges: modeChangeInfos(questStageMstId, apps[0]?.wave) }
    })
}

// ---- Solo Raid master data -----------------------------------------------------------------------------
import soloRaidJson from "../assets/base_data/getSoloRaidMstList.json";
import soloRaidSeasonBuffJson from "../assets/base_data/getSoloRaidSeasonBuffMstList.json";
import soloRaidPartyBuffJson from "../assets/base_data/getSoloRaidPartyBuffMstList.json";
export interface SoloRaidSeasonBuff {
    soloRaidSeasonBuffMstId: number, groupId: number, passiveSkillMstId: number, enhancedPassiveSkillMstId: number,
    buffPointChargePassiveSkillMstId: number, maxBuffPoint: number, maxBuffPointOnEnhanced: number, enhancedSkillTurnGaugeValue: number
}
export interface SoloRaidPartyBuff { soloRaidPartyBuffMstId: number, groupId: number, passiveSkillMstId: number, buffPointChargePassiveSkillMstId: number }
export interface SoloRaidInfo { soloRaidMstId: number, difficulty: number, limitRoundCount: number, season?: SoloRaidSeasonBuff, partyBuffs: SoloRaidPartyBuff[] }
// "Vanguard Base Points" passive (SoloRaidBuffReferee commonCharge): sent by the server, not in a master table.
export const SOLO_RAID_COMMON_CHARGE_PASSIVE = 1600000
export function soloRaidInfo(questStageMstId: number): SoloRaidInfo | undefined {
    const st = (soloRaidStageJson as any[]).find(s => s.questStageMstId === questStageMstId)
    if (!st) return undefined
    const raid = (soloRaidJson as any[]).find(r => r.soloRaidMstId === st.soloRaidMstId)
    return {
        soloRaidMstId: st.soloRaidMstId, difficulty: st.difficulty, limitRoundCount: st.limitRoundCount,
        season: (soloRaidSeasonBuffJson as any[]).find(b => b.groupId === raid?.soloRaidSeasonBuffGroupId),
        partyBuffs: (soloRaidPartyBuffJson as any[]).filter(b => b.groupId === raid?.soloRaidPartyBuffGroupId),
    }
}

// Countdowns only run in Solo Raid battles (SoloRaidGameDirector).
const soloRaidStageIds = new Set<number>((soloRaidStageJson as any[]).map(s => s.questStageMstId))
export const isSoloRaidStage = (questStageMstId: number) => soloRaidStageIds.has(questStageMstId)

// [CONFIRMED 3.19] AdditionalEnemyReferee.Initialize (0x1376f70): the stage's conditionType 3 rows are summon
// templates, keyed by summonId (the first row per id wins - Dictionary.ContainsKey guard).
export function summonTemplates(questStageMstId: number): Map<number, QuestEnemyAppearance> {
    const out = new Map<number, QuestEnemyAppearance>()
    const rows = (appearancesByStage.get(questStageMstId) ?? []).filter(a => a.conditionType === 3 && a.summonId > 0)
        .sort((a, b) => a.questEnemyAppearanceMstId - b.questEnemyAppearanceMstId)
    for (const a of rows) if (!out.has(a.summonId)) out.set(a.summonId, a)
    return out
}

// [CONFIRMED 3.19] AdditionalEnemyReferee.GetAdditionalBattleUnitList(mstList) (0x13769c0): a wave's units get
// consecutive position ids starting at 3 - n/2 (C# integer division): 1 unit -> 3, 3 -> 2..4, 5 -> 1..5.
export const wavePositionIds = (n: number): number[] => Array.from({ length: n }, (_, i) => 3 - Math.trunc(n / 2) + i)

// [CONFIRMED 3.19] SummonAbilityEffect static position order, read from global-metadata.dat
// (<PrivateImplementationDetails> 79C1DCEC..., metadata offset 0x100C440): centre first, then outward.
export const SUMMON_POSITION_ORDER = [3, 2, 4, 1, 5] as const

export const enemyName = (a: QuestEnemyAppearance) => enemyNames.get(a.enemyMstId) ?? `Enemy ${a.enemyMstId}`
export const skillName = (skillMstId: number) => skillNames.get(skillMstId) ?? `Skill ${skillMstId}`
export const breakMstOf = (a: QuestEnemyAppearance): BreakMst | undefined => breakMsts.get(a.breakMstId)

export const ELEMENT_KEYS = ["", "fire", "aqua", "forest", "light", "dark", "neutral"] as const

// ---------------------------------------------------------------------------
// Enemy unit parameters
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] QuestEnemyAppearanceParameter.ctor (0x138b650) + BattleUnit.ctor(id, appearanceId, pos)
// (0x1389760). Enemies have no element, role or EP; stats are the raw master values.
export interface EnemySkill { skillMstId: number, weight: number, hpGaugeValue: number }
export interface EnemyConditionAction {
    id: number
    priority: number
    conditionSetMstIdCsv: string
    skillMstIds: number[]
    isSkillReusable: boolean
    isStartTiming: boolean   // row has a BattleStart (2001) / WaveStart (2002) condition
}

export interface EnemyParams {
    appearance: QuestEnemyAppearance
    weakElements: number[]
    resistRates: number[]    // index = ElementType 1..6, raw (/10 = percent)
    aimDamageRates: number[] // index = ElementType 1..6, raw (/1000 = ratio)
    breakMst: BreakMst
    skills: EnemySkill[]
    conditionActions: EnemyConditionAction[]
    // [CONFIRMED 3.19] one-shot condition rows are consumed when picked (SingleAction.GetAction).
    usedConditionActions: Set<number>
    hpGaugeCount: number     // CurrentHpGaugeCount
}

const skillSets = new Map<number, EnemySkill[]>()
for (const r of questEnemySkillSetJson as any[]) {
    (skillSets.get(r.enemySkillSetId) ?? skillSets.set(r.enemySkillSetId, []).get(r.enemySkillSetId)!)
        .push({ skillMstId: r.skillMstId, weight: r.weightValue, hpGaugeValue: r.hpGaugeValue })
}

const conditionRowsBySet = new Map<number, any[]>()
for (const r of enemyConditionActionJson as any[]) {
    (conditionRowsBySet.get(r.enemyConditionSkillSetId) ?? conditionRowsBySet.set(r.enemyConditionSkillSetId, []).get(r.enemyConditionSkillSetId)!).push(r)
}

import battleConditionSetJson from "../assets/base_data/getBattleConditionSetMstList.json";
import battleConditionJson from "../assets/base_data/getBattleConditionMstList.json";
const conditionSetCsv = new Map<string, string>((battleConditionSetJson as any[]).map(s => [String(s.battleConditionSetMstId), s.battleConditionMstIdCsv]))
const conditionContent = new Map<string, number>((battleConditionJson as any[]).map(c => [String(c.battleConditionMstId), c.compareContent]))
const START_TIMING_CONTENTS = new Set([2001, 2002])
const hasStartTimingCondition = (csv: string) => csv.split(",").filter(Boolean).some(setId =>
    (conditionSetCsv.get(setId) ?? "").split(",").some(cid => START_TIMING_CONTENTS.has(conditionContent.get(cid) ?? 0)))

export function enemyParams(a: QuestEnemyAppearance): EnemyParams {
    const breakMst = breakMsts.get(a.breakMstId) ?? {
        breakMstId: 0, breakPoint: 0, breakPointRecoveryPerTurn: 0, breakTurnGaugeSlowRatio: 0,
        breakedDamageReceiveRateIncreaseRate: 0, initialBreakedDamageReceiveRate: 1000, maxBreakedDamageReceiveRate: 1000,
    }
    // [CONFIRMED 3.19] EnemyConditionAndActionController.ctor (0x1496f10): rows of the set, stable-sorted
    // by priority ascending (the appearance id column is not used).
    const rows = [...(conditionRowsBySet.get(a.enemyConditionSkillSetId) ?? [])]
        .sort((x, y) => x.priority - y.priority || x.enemyConditionSetsAndActionMstId - y.enemyConditionSetsAndActionMstId)
    return {
        appearance: a,
        // [CONFIRMED 3.19] get_WeakElements: weakElement1..6 that are a defined ElementType (zeros dropped).
        weakElements: [1, 2, 3, 4, 5, 6].map(i => a[`weakElement${i}`]).filter((e: number) => e >= 1 && e <= 6),
        resistRates: ELEMENT_KEYS.map(k => k ? a[`${k}ResistRate`] ?? 0 : 0),
        aimDamageRates: ELEMENT_KEYS.map(k => k ? a[`${k}AimDamageRate`] ?? 0 : 0),
        breakMst,
        skills: skillSets.get(a.enemySkillSetId) ?? [],
        conditionActions: rows.map(r => ({
            id: r.enemyConditionSetsAndActionMstId,
            priority: r.priority,
            conditionSetMstIdCsv: r.conditionSetMstIdCsv ?? "",
            skillMstIds: String(r.skillMstIdCsv ?? "").split(",").filter(Boolean).map(Number),
            isSkillReusable: !!r.isSkillReusable,
            isStartTiming: hasStartTimingCondition(r.conditionSetMstIdCsv ?? ""),
        })),
        usedConditionActions: new Set(),
        hpGaugeCount: a.startHpGaugeCount > 0 ? a.startHpGaugeCount : a.hpGaugeCount,
    }
}

// Enemy skill details are keyed by the skill id itself (character skills use id * 100 + level).
export function enemySkillDetails(skillMstId: number): SkillDetail[] {
    return [...(skillDetailsByMstId.get(skillMstId) ?? [])].sort((a: any, b: any) => a.skillDetailMstId - b.skillDetailMstId) as SkillDetail[]
}

// The engine reads units through this small "kioku" surface (see KiokuState); this is the enemy
// implementation of it. `data.role` / `data.element` are undefined: role/element-gated effects never
// apply to enemies (BattleUnit.IsMatch returns false for non-CharacterParameter units).
export class EnemyKioku {
    readonly isEnemy = true
    name: string
    appearance: QuestEnemyAppearance
    data: any
    critRate: number
    critDamage: number
    maxMagicStacks = 0
    effects: PassiveSkill[]
    specialLvl = 1
    skillLvl = 1
    attackLvl = 1

    constructor(a: QuestEnemyAppearance) {
        this.appearance = a
        this.name = enemyName(a)
        // `id` drives the portrait: enemies use /enemy/<enemyMstId>_thumbnail.png.
        this.data = { id: a.enemyMstId, role: undefined, element: undefined, minSpd: a.speed, rarity: 0, ep: 0 }
        // [CONFIRMED 3.19] per-mille like characters' Param.Ctr/Ctd (GetProcessedCtr/Ctd divide by 10).
        this.critRate = a.criticalRate
        this.critDamage = a.criticalDamageRate
        // [CONFIRMED 3.19] PassiveSkills = [{ id = passiveSkillMstId, level = 1 }]; keyed directly.
        this.effects = a.passiveSkillMstId ? [...(passiveDetailsByMstId.get(a.passiveSkillMstId) ?? [])] as PassiveSkill[] : []
    }
    getBaseAtk() { return this.appearance.atk }
    getBaseDef() { return this.appearance.def }
    getBaseHp() { return this.appearance.hp }
    getKey() { return `enemy-${this.appearance.questEnemyAppearanceMstId}` }
}

export const isEnemyKioku = (k: any): k is EnemyKioku => !!k?.isEnemy

// ---------------------------------------------------------------------------
// Enemy skill choice  [CONFIRMED 3.19] UnitBrain.AutoSelectActiveSkillOrNormalAttack (0x17f1060)
// ---------------------------------------------------------------------------
//   dead / CanNotAction / broken -> no action
//   1. EnemyConditionAndActionController.GetAction(bundle, 1) (0x1495fa0): first available row (priority
//      asc) whose condition sets match (OR across the csv, AND inside a set; evaluated for the acting
//      enemy); uniform pick among its skill ids; a non-reusable row is consumed. Used if the id is in
//      the enemy's skill set. No SP / target check on this path.
//   2. else RandomSelectActiveSkill (0x17f1cb0) over skills with a valid target and hpGaugeValue < 1 or
//      == CurrentHpGaugeCount: weight >= 0 only; weighted by weightValue, uniform if the sum is 0.
export interface EnemySkillChoice { skillMstId: number, viaCondition?: number }

function conditionRowMatches(row: EnemyConditionAction, state: any): boolean {
    const sets = row.conditionSetMstIdCsv.split(",").filter(s => s && s !== "0")
    if (!sets.length) return true
    return sets.some(set => isConditionSetActiveForPvP([set], state))
}

export function selectEnemySkill(unit: KiokuState, _team: PvPTeam, rng: RngSource, hasTarget: (skillMstId: number) => boolean): EnemySkillChoice | null {
    const p = unit.enemy!
    const ids = new Set(p.skills.map(s => s.skillMstId))
    const state = unit.stateGen(unit, unit)
    for (const row of p.conditionActions) {
        if (row.isStartTiming) continue // BattleStart/WaveStart rows only run as start-timing acts
        if (!row.isSkillReusable && p.usedConditionActions.has(row.id)) continue
        if (!conditionRowMatches(row, { ...state, trueActorUnit: unit })) continue
        if (!row.isSkillReusable) p.usedConditionActions.add(row.id)
        const pick = row.skillMstIds[rollChoice(rng, row.skillMstIds.map(() => 1), "skill",
            () => `${unit.kioku.name} skill (condition row ${row.id})`, () => row.skillMstIds.map(skillName))]
        if (pick !== undefined && ids.has(pick)) return { skillMstId: pick, viaCondition: row.id }
        break // GetAction returned an id that isn't an active skill -> falls through to the random pick
    }
    const candidates = p.skills.filter(s => s.weight >= 0
        && (s.hpGaugeValue < 1 || s.hpGaugeValue === p.hpGaugeCount)
        && hasTarget(s.skillMstId))
    if (!candidates.length) return null
    const sum = candidates.reduce((s, c) => s + c.weight, 0)
    // sum < 1: uniform (rollChoice treats all-zero weights as uniform).
    const idx = rollChoice(rng, sum < 1 ? candidates.map(() => 1) : candidates.map(c => c.weight), "skill",
        () => `${unit.kioku.name} skill`, () => candidates.map(c => skillName(c.skillMstId)))
    return { skillMstId: candidates[idx].skillMstId }
}

// [CONFIRMED 3.19] LoadStartTimingConditionAction (0x14964f0): every skill of a row with a BattleStart
// condition runs once as a StartTimingAct before the first turn.
export function startTimingSkills(unit: KiokuState): number[] {
    return unit.enemy!.conditionActions.filter(r => r.isStartTiming).flatMap(r => r.skillMstIds)
}
