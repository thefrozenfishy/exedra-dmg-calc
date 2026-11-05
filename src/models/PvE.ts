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
import enemySkillSetJson from "../assets/base_data/getQuestEnemySkillSetMstList.json";
import enemyConditionActionJson from "../assets/base_data/getEnemyConditionSetsAndActionMstList.json";
import skillDetailJson from "../assets/base_data/getSkillDetailMstList.json";
import passiveDetailJson from "../assets/base_data/getPassiveSkillDetailMstList.json";

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

const appearancesById = new Map<number, QuestEnemyAppearance>((questEnemyAppearanceJson as QuestEnemyAppearance[]).map(a => [a.questEnemyAppearanceMstId, a]))
export const appearanceById = (questEnemyAppearanceMstId: number) => appearancesById.get(questEnemyAppearanceMstId)

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
import multiRaidExCharacterBonusJson from "../assets/base_data/getMultiRaidExCharacterBonusMstList.json";
import questBuffJson from "../assets/base_data/getQuestBuffMstList.json";
import calculationPointPolicyJson from "../assets/base_data/getCalculationPointPolicyMstList.json";
export interface SoloRaidSeasonBuff {
    soloRaidSeasonBuffMstId: number, groupId: number, passiveSkillMstId: number, enhancedPassiveSkillMstId: number,
    buffPointChargePassiveSkillMstId: number, maxBuffPoint: number, maxBuffPointOnEnhanced: number, enhancedSkillTurnGaugeValue: number
}
export interface SoloRaidPartyBuff { soloRaidPartyBuffMstId: number, groupId: number, passiveSkillMstId: number, buffPointChargePassiveSkillMstId: number }
export interface SoloRaidInfo { soloRaidMstId: number, difficulty: number, limitRoundCount: number, season?: SoloRaidSeasonBuff, partyBuffs: SoloRaidPartyBuff[] }
// "Vanguard Base Points" passive (SoloRaidBuffReferee commonCharge): sent by the server, not in a master table.
export const SOLO_RAID_COMMON_CHARGE_PASSIVE = 1600000
// ---- Crisis (Solo Raid) score ----
// The server computes it: SoloRaidApi.FinalizeStageForUser sends battleInfo + battleLog and gets back
// Network.Definition.SoloRaid.ScoreInfo { score, difficultyScore, clearRoundBonus, battleCountBonus, bossRestHpBonus,
// battleCount, bossRestHp, bossMaxHp, totalRoundCount }. The coefficients are CalculationPointPolicyMst policyType 7
// (difficultyScore[difficulty], battleCountBonus[difficulty][battleCount 1-11], bossRestHpBonus[rest HP per mille, step 10]
// [difficulty], clearRoundBonusDifficultyRate[difficulty]). score = the sum of the four (matches in-game result screens).
// [UNCERTAIN] clearRoundBonus = rate * 360 - floor(rate * AV / 1000): fitted to two Easy clears (Graffiti Witch, rate 2586:
// 140.963 AV -> 930,596, 179.756 AV -> 930,496); a per-round rule (-100 per round) fits those two as well.
// [UNCERTAIN] AV of earlier attempts is added up; the rest HP lookup floors to the 1% row; battle counts past 11 use row 11.
const crisisCoef = new Map<string, number>((calculationPointPolicyJson as any[])
    .filter(r => r.policyType === 7)
    .map(r => [`${r.coefficientName}|${r.conditionValue}|${r.conditionValue2}`, r.value]))
export interface CrisisScore { difficultyScore: number, bossRestHpBonus: number, clearRoundBonus: number, battleCountBonus: number, total: number }
export function crisisScore(difficulty: number, battleCount: number, av: number, bossRestPermille = 0): CrisisScore {
    const c = (name: string, c1: number, c2 = 0) => crisisCoef.get(`${name}|${c1}|${c2}`) ?? 0
    const rate = c('clearRoundBonusDifficultyRate', difficulty)
    const difficultyScore = c('difficultyScore', difficulty)
    const bossRestHpBonus = c('bossRestHpBonus', Math.min(1000, Math.max(0, Math.floor(bossRestPermille / 10) * 10)), difficulty)
    const clearRoundBonus = Math.max(0, rate * 360 - Math.floor(rate * av / 1000))
    const battleCountBonus = c('battleCountBonus', difficulty, Math.min(11, Math.max(1, battleCount)))
    return { difficultyScore, bossRestHpBonus, clearRoundBonus, battleCountBonus, total: difficultyScore + bossRestHpBonus + clearRoundBonus + battleCountBonus }
}
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
// EX character bonus (3.21.0+): MultiRaidMst.exCharacterBonusPassiveSkillMstId for the characters of
// MultiRaidExCharacterBonusMst.groupId == MultiRaidMst.exCharacterBonusGroupId (e.g. "EX Bonus" 1900: HP +40%, ATK +80%,
// DEF +40%, SPD +10%; the passive itself has no condition, so the character list decides who gets it).
export interface MultiRaidInfo {
    multiRaidStageMstId: number, seasonId: number, difficulty: number, limitRoundCount: number, bonusPassiveIds: number[],
    exBonusPassiveId: number, exBonusCharacterIds: number[]
}
export function multiRaidInfo(questStageMstId: number): MultiRaidInfo | undefined {
    const st = (multiRaidStageJson as any[]).find(s => s.questStageMstId === questStageMstId)
    if (!st) return undefined
    // a season id recurs (reruns); every run of it has the same bonus group
    const season = (multiRaidJson as any[]).filter(r => r.seasonId === st.seasonId).pop()
    const bonus = (multiRaidBonusJson as any[]).filter(b => b.groupId === season?.multiRaidBattleBonusGroupId)
        .sort((a, b) => a.multiRaidBattleBonusMstId - b.multiRaidBattleBonusMstId)
    const exGroup = season?.exCharacterBonusGroupId ?? 0
    const exBonusCharacterIds = exGroup > 0 ? (multiRaidExCharacterBonusJson as any[]).filter(b => b.groupId === exGroup).map(b => b.characterMstId as number) : []
    return {
        multiRaidStageMstId: st.multiRaidStageMstId, seasonId: st.seasonId, difficulty: st.difficulty, limitRoundCount: st.limitRoundCount,
        bonusPassiveIds: bonus.map(b => b.passiveSkillMstId),
        exBonusPassiveId: exBonusCharacterIds.length ? season?.exCharacterBonusPassiveSkillMstId ?? 0 : 0, exBonusCharacterIds,
    }
}

// Quest buffs (QuestBuffMst: per quest category + stage difficulty, within start/end time; buffType 1 = DMG dealt,
// 2 = break gauge depletion, buffValue per mille). [UNCERTAIN] chosen by the client/server outside ReDriveBattleCore;
// they reach the battle as the directors' campUpDmg / campUpBreakPointDmg arguments ([CONFIRMED 3.21]
// SoloGameDirectorBase.SetupBattleStage / MultiRaidGameDirector.SetupBattleStage -> CampaignFieldParam
// (0x14A34C0): CPN_UP_GIV_DMG_RATIO / CPN_UP_GIV_BREAK_POINT_DMG_RATIO on every ally at battle start). E.g. Link Raid
// Lvl. 1-12: DMG dealt +100%, break gauge depletion +50%.
export interface QuestCampaign { upDmg: number, upBreakPointDmg: number, descriptions: string[] }
const groupCategory = new Map<number, number>((questGroupJson as any[]).map(g => [g.questGroupMstId, g.questCategoryMstId]))
export function questCampaign(questStageMstId: number, now: number = Date.now()): QuestCampaign {
    const out: QuestCampaign = { upDmg: 0, upBreakPointDmg: 0, descriptions: [] }
    const st = questStages.get(questStageMstId)
    const category = st ? groupCategory.get(st.questGroupMstId) : undefined
    if (!st || category === undefined) return out
    for (const b of questBuffJson as any[]) {
        if (b.questCategoryMstId !== category || b.difficulty !== st.difficulty) continue
        if (now < Date.parse(b.startTime) || now > Date.parse(b.endTime)) continue
        if (b.buffType === 1) out.upDmg += b.buffValue
        else if (b.buffType === 2) out.upBreakPointDmg += b.buffValue
        else continue
        out.descriptions.push(`${b.buffType === 1 ? "DMG dealt" : "Break gauge depletion"} +${b.buffValue / 10}%`)
    }
    return out
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

// App side (not game code): the summons the given units can bring in during the fight (the pages' "spawns during the
// fight" toggles). Walks every skill the units can use (QuestEnemySkillSetMst, EnemyConditionSetsAndActionMst rows,
// their passives) and every skill those reach (the skill ids in ADDITIONAL_SKILL_ACT / SWITCH_SKILL / ... details); a SUMMON detail's value1..5 are summon ids ([CONFIRMED 3.19] SummonAbilityEffect..ctor 0x1921580), whose
// templates are walked too. In the order found (the SUMMON row's order = the game's queue order); ids without a
// template, or whose template is already in `units`, are left out. Whether / when the AI uses the skill is not checked.
const enemySkillSetRows = new Map<number, number[]>()
for (const r of enemySkillSetJson as any[]) (enemySkillSetRows.get(r.enemySkillSetId) ?? enemySkillSetRows.set(r.enemySkillSetId, []).get(r.enemySkillSetId)!).push(r.skillMstId)
const conditionActionSkills = new Map<number, number[]>()
for (const r of enemyConditionActionJson as any[]) {
    const ids = String(r.skillMstIdCsv ?? "").split(",").map(Number).filter(n => n > 0)
    ;(conditionActionSkills.get(r.enemyConditionSkillSetId) ?? conditionActionSkills.set(r.enemyConditionSkillSetId, []).get(r.enemyConditionSkillSetId)!).push(...ids)
}
const rawSkillDetails = new Map<number, any[]>()
for (const r of skillDetailJson as any[]) (rawSkillDetails.get(r.skillMstId) ?? rawSkillDetails.set(r.skillMstId, []).get(r.skillMstId)!).push(r)
const rawPassiveDetails = new Map<number, any[]>()
for (const r of passiveDetailJson as any[]) (rawPassiveDetails.get(r.passiveSkillMstId) ?? rawPassiveDetails.set(r.passiveSkillMstId, []).get(r.passiveSkillMstId)!).push(r)
const detailValues = (d: any): number[] => [d.value1, d.value2, d.value3, d.value4, d.value5].filter((v: any) => typeof v === "number" && v !== 0)
// detail types whose values name skills to use (only these are followed, so a damage value is never read as an id)
const SKILL_LINK_TYPE = /SKILL|ADDITIONAL_TURN_UNIT_ACT/
const linkedSkills = (d: any): number[] => SKILL_LINK_TYPE.test(d.abilityEffectType) ? detailValues(d).filter(v => rawSkillDetails.has(v)) : []

export function summonCandidates(questStageMstId: number, units: QuestEnemyAppearance[]): QuestEnemyAppearance[] {
    const templates = summonTemplates(questStageMstId)
    if (!templates.size) return []
    const present = new Set(units.map(a => a.questEnemyAppearanceMstId))
    const seenApps = new Set<number>(), seenSkills = new Set<number>(), seenPassives = new Set<number>()
    const found: QuestEnemyAppearance[] = []
    const skillQueue: number[] = []
    const visitApp = (a: QuestEnemyAppearance) => {
        if (seenApps.has(a.questEnemyAppearanceMstId)) return
        seenApps.add(a.questEnemyAppearanceMstId)
        skillQueue.push(...(enemySkillSetRows.get(a.enemySkillSetId) ?? []), ...(conditionActionSkills.get(a.enemyConditionSkillSetId) ?? []))
        if (a.passiveSkillMstId > 0 && !seenPassives.has(a.passiveSkillMstId)) {
            seenPassives.add(a.passiveSkillMstId)
            for (const d of rawPassiveDetails.get(a.passiveSkillMstId) ?? []) skillQueue.push(...linkedSkills(d))
        }
    }
    units.forEach(visitApp)
    while (skillQueue.length) {
        const id = skillQueue.shift()!
        if (seenSkills.has(id)) continue
        seenSkills.add(id)
        for (const d of rawSkillDetails.get(id) ?? []) {
            if (d.abilityEffectType === "SUMMON") {
                for (const sid of detailValues(d)) {
                    const t = templates.get(sid)
                    if (!t || present.has(t.questEnemyAppearanceMstId) || found.includes(t)) continue
                    found.push(t)
                    visitApp(t)
                }
            } else skillQueue.push(...linkedSkills(d))
        }
    }
    return found
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
