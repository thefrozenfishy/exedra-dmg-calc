// App side (not game code): the Best SA Team calculator's score of one team on the 1:1 engine.
//
// The score is the attacker's Ultimate as the Max Damage panel computes it (battle/EngineMaxDamage: every buff
// condition met, the team's effects given through the game's own code, the skill launched once) against either a real
// stage's wave (`stage`, the page's StageEnemySelector: the wave's enemies with their passives, break tables and the
// stage's battle type, broken / target as picked) or the old enemy row built as dummies (EngineBench.customStage: each
// enabled enemy with its DEF, weak to every element or to none, broken at its break bonus or not; used by
// scripts/sim/engineBestTeam.ts). What the old single-hit model took as inputs becomes stage states:
//   - an enemy's DEF up / DMG taken down -> UP_DEF_RATIO / DWN_RCV_DMG_RATIO on that enemy;
//   - active ailments -> the ailment conditions are checked against them (as Kioku Grid's Max Burst).
//   - "Attacker HP when using ultimate" -> the attacker's HP (MaxDmgOptions.dealerHpPercent): its HP-ratio conditions
//     (e.g. Kugatachi's "ATK +20% while HP >= 50%") are checked against it, every other condition counts as met.
// Not used (old-model inputs with no engine meaning here): buff / debuff bonus reduction and stage buffs (removed from
// the page: a real stage's own gimmicks come with its wave), hits to kill
// (the dummies never die mid-skill), additional-damage crit (the game decides which hits can crit).
import { computeMaxDamageEngine } from "./EngineMaxDamage"
import { customStage, AILMENT_STATE } from "./EngineBench"
import { BattleType } from "../types/enums"
import type { MaxDmgOptions } from "../models/MaxDamage"
import type { PvPKioku } from "../models/PvPKioku"
import { TargetType } from "../types/KiokuTypes"
import type { Enemy } from "../types/EnemyTypes"
import type { Ailment } from "../types/enums"
import type { QuestEnemyAppearance } from "../models/PvE"
import { stageBattleType } from "../models/PvEBattle"

/** A real stage's wave to score against (components/StageEnemySelector): replaces `enemies`. */
export interface TeamScoreStage {
    stageId: number
    waveIdx: number
    phase?: number                 // the wave boss's form step (EngineMaxDmgStage.phase), 1 = first
    wave: QuestEnemyAppearance[]   // the enemies on the field when the wave (phase) starts
    mainTargetIdx: number
    broken: boolean[]
    breakRate: (number | undefined)[]
}

export interface TeamScoreScenario {
    stage?: TeamScoreStage
    enemies: Enemy[]
    ailments: Ailment[]
    attackerHp?: number            // % of max HP when the attacker uses its Ultimate (undefined = conditions met)
}

export interface TeamScore { max: number, avg: number, critRate: number }

/** Score of `allies` (the attacker first) in `sc`. `maxOnly`: only `max` is needed (avg / critRate may come back NaN);
 *  skips the non-crit run when `max` does not read it (a stage, or every enabled enemy row marked crit). */
export function scoreTeam(allies: PvPKioku[], sc: TeamScoreScenario, maxOnly = false): TeamScore {
    if (sc.stage) return scoreOnStage(allies, sc, sc.stage, maxOnly)
    const enabled = sc.enemies.filter(e => e.enabled)
    if (!enabled.length) return { max: 0, avg: 0, critRate: 0 }
    const critOnly = maxOnly && enabled.every(e => e.isCrit)
    const mainIdx = Math.max(0, enabled.findIndex(e => e.name === "Target"))
    const { stageId, enemies } = customStage(enabled.map((e, i) => ({ def: e.defense, weak: e.isWeak, main: i === mainIdx })))

    const field: NonNullable<MaxDmgOptions["fieldStates"]> = []
    enabled.forEach((e, i) => {
        if (e.defenseUp) field.push({ side: "enemy", index: i, type: "UP_DEF_RATIO", value1: Math.round(e.defenseUp * 10) })
        if (e.dmgTakenDown) field.push({ side: "enemy", index: i, type: "DWN_RCV_DMG_RATIO", value1: Math.round(e.dmgTakenDown * 10) })
    })

    const result = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, enemies, 0, {
        battleType: BattleType.Solo,
        broken: enabled.map(e => e.isBreak),
        breakRate: enabled.map(e => e.maxBreak),
        mainTargetIdx: mainIdx,
        onlyPos: 0,
        enemyStates: sc.ailments.map(a => AILMENT_STATE[a]).filter(Boolean),
        fieldStates: field,
        dealerHpPercent: sc.attackerHp,
        scoreOnly: true, onlyUltimate: true, trace: false, critOnly,
    })
    const ult = result.members[0]?.skills.find(s => s.type === TargetType.specialId)
    if (!ult) return { max: 0, avg: 0, critRate: 0 }
    // "max": every hit on an enemy marked crit crits, the others don't; "avg": the engine's crit chance on each
    const max = ult.perEnemy.reduce((s, x, i) => s + (enabled[i]?.isCrit ? x.crit : x.normal), 0)
    const avg = ult.perEnemy.reduce((s, x) => s + x.avg, 0)
    return { max, avg, critRate: critRateOf(ult.critChance) }
}

const critRateOf = (p: number) => Math.round(Math.min(100, Math.max(0, p)) * 10) / 10

/** Against a real stage's wave (its enemies, passives, break tables and battle type as in the game): every hit crits
 *  for "max", the engine's crit chance for "avg". */
function scoreOnStage(allies: PvPKioku[], sc: TeamScoreScenario, st: TeamScoreStage, maxOnly: boolean): TeamScore {
    const result = computeMaxDamageEngine(allies, { stageId: st.stageId, waveIdx: st.waveIdx, phase: st.phase }, st.wave, 0, {
        battleType: stageBattleType(st.stageId),
        broken: st.broken,
        breakRate: st.breakRate,
        mainTargetIdx: st.mainTargetIdx,
        onlyPos: 0,
        enemyStates: sc.ailments.map(a => AILMENT_STATE[a]).filter(Boolean),
        dealerHpPercent: sc.attackerHp,
        scoreOnly: true, onlyUltimate: true, trace: false, critOnly: maxOnly,
    })
    const ult = result.members[0]?.skills.find(s => s.type === TargetType.specialId)
    if (!ult) return { max: 0, avg: 0, critRate: 0 }
    return { max: ult.total.crit, avg: ult.total.avg, critRate: critRateOf(ult.critChance) }
}
