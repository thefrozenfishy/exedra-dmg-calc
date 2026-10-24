// PvE (quest stage) master data for the pages and the 1:1 engine adapters: stages, waves, enemies, raids.
import enemyMstJson from "../assets/base_data/getEnemyMstList.json";
import breakMstJson from "../assets/base_data/getBreakMstList.json";
import questGroupJson from "../assets/base_data/getQuestGroupMstList.json";
import questEnemyAppearanceJson from "../assets/base_data/getQuestEnemyAppearanceMstList.json";
import questStageJson from "../assets/base_data/getQuestStageMstList.json";
import skillMstJson from "../assets/base_data/getSkillMstList.json";
import questEnemyWaveJson from "../assets/base_data/getQuestEnemyWaveMstList.json";
import soloRaidStageJson from "../assets/base_data/getSoloRaidStageMstList.json";
import modeChangeJson from "../assets/base_data/getQuestEnemyModeChangeMstList.json";

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
import multiRaidStageJson from "../assets/base_data/getMultiRaidStageMstList.json";
import multiRaidJson from "../assets/base_data/getMultiRaidMstList.json";
import multiRaidBonusJson from "../assets/base_data/getMultiRaidBattleBonusMstList.json";
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

// Link Raid (Multi-Raid): MultiRaidStageMst -> the quest stage, its round limit, and the season's battle bonus passives
// (MultiRaidMst.multiRaidBattleBonusGroupId -> MultiRaidBattleBonusMst.groupId). Those passives carry their own
// role / element condition (PassiveSkillMst.conditionRole / conditionElement, checked by BattleUnit.GetPassiveSkills).
export interface MultiRaidInfo { multiRaidStageMstId: number, seasonId: number, difficulty: number, limitRoundCount: number, bonusPassiveIds: number[] }
export function multiRaidInfo(questStageMstId: number): MultiRaidInfo | undefined {
    const st = (multiRaidStageJson as any[]).find(s => s.questStageMstId === questStageMstId)
    if (!st) return undefined
    // a season id recurs (reruns); every run of it has the same bonus group
    const season = (multiRaidJson as any[]).filter(r => r.seasonId === st.seasonId).pop()
    const bonus = (multiRaidBonusJson as any[]).filter(b => b.groupId === season?.multiRaidBattleBonusGroupId)
        .sort((a, b) => a.multiRaidBattleBonusMstId - b.multiRaidBattleBonusMstId)
    return { multiRaidStageMstId: st.multiRaidStageMstId, seasonId: st.seasonId, difficulty: st.difficulty, limitRoundCount: st.limitRoundCount, bonusPassiveIds: bonus.map(b => b.passiveSkillMstId) }
}
const multiRaidStageIds = new Set<number>((multiRaidStageJson as any[]).map(s => s.questStageMstId))
export const isMultiRaidStage = (questStageMstId: number) => multiRaidStageIds.has(questStageMstId)

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
