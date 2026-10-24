// App side (not game code): the Best SA Team calculator's score of one team on the 1:1 engine.
//
// The score is the attacker's Ultimate as the Max Damage panel computes it (battle/EngineMaxDamage: every buff
// condition met, the team's effects given through the game's own code, the skill launched once) against either a real
// stage's wave (`stage`, the page's StageEnemySelector: the wave's enemies with their passives, break tables and the
// stage's battle type, broken / target as picked) or the old enemy row built as dummies (EngineBench.customStage: each
// enabled enemy with its DEF, weak to every element or to none, broken at its break bonus or not; used by
// scripts/sim/engineBestTeam.ts). What the old single-hit model took as inputs becomes stage states:
//   - "Buff / Debuff Bonus Reduction" -> DWN_BUFF / DWN_DEBUFF_EFFECT_VALUE on each ally (the off-element value on
//     allies whose element isn't one of the weak elements), as a stage gimmick cuts the buffs and debuffs a unit gives;
//   - "Stage Buffs" -> a state of that type on every ally (a buff) or every enemy (a debuff);
//   - an enemy's DEF up / DMG taken down -> UP_DEF_RATIO / DWN_RCV_DMG_RATIO on that enemy;
//   - active ailments -> the ailment conditions are checked against them (as Kioku Grid's Max Burst).
// Not used (old-model inputs with no engine meaning here): attacker HP (every condition counts as met), hits to kill
// (the dummies never die mid-skill), additional-damage crit (the game decides which hits can crit).
import { computeMaxDamageEngine } from "./EngineMaxDamage"
import { customStage, AILMENT_STATE } from "./EngineBench"
import { BattleType } from "../types/enums"
import type { MaxDmgOptions } from "../models/MaxDamage"
import type { PvPKioku } from "../models/PvPKioku"
import { TargetType } from "../types/KiokuTypes"
import type { Enemy } from "../types/EnemyTypes"
import type { Ailment, KiokuElement } from "../types/enums"
import type { QuestEnemyAppearance } from "../models/PvE"
import { stageBattleType } from "../models/PvEBattle"

/** A real stage's wave to score against (components/StageEnemySelector): replaces `enemies`. */
export interface TeamScoreStage {
    stageId: number
    waveIdx: number
    wave: QuestEnemyAppearance[]   // the enemies on the field when the wave starts
    mainTargetIdx: number
    broken: boolean[]
    breakRate: (number | undefined)[]
}

export interface TeamScoreScenario {
    stage?: TeamScoreStage
    enemies: Enemy[]
    ailments: Ailment[]
    arenaEffects: Record<string, number>   // effect type -> %
    weakElements: KiokuElement[]
    buffMultReduction: number
    offElementBuffMultReduction?: number
    debuffMultReduction: number
    offElementDebuffMultReduction?: number
}

export interface TeamScore { max: number, avg: number, critRate: number }

const ENEMY_SIDE = /^(DWN_|WEAKNESS$|RCV_|UP_RCV_|UP_AIM_RCV_)/

/** Score of `allies` (the attacker first) in `sc`. */
export function scoreTeam(allies: PvPKioku[], sc: TeamScoreScenario): TeamScore {
    if (sc.stage) return scoreOnStage(allies, sc, sc.stage)
    const enabled = sc.enemies.filter(e => e.enabled)
    if (!enabled.length) return { max: 0, avg: 0, critRate: 0 }
    const mainIdx = Math.max(0, enabled.findIndex(e => e.name === "Target"))
    const { stageId, enemies } = customStage(enabled.map((e, i) => ({ def: e.defense, weak: e.isWeak, main: i === mainIdx })))

    const field = teamFieldStates(allies, sc)
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
function scoreOnStage(allies: PvPKioku[], sc: TeamScoreScenario, st: TeamScoreStage): TeamScore {
    const result = computeMaxDamageEngine(allies, { stageId: st.stageId, waveIdx: st.waveIdx }, st.wave, 0, {
        battleType: stageBattleType(st.stageId),
        broken: st.broken,
        breakRate: st.breakRate,
        mainTargetIdx: st.mainTargetIdx,
        onlyPos: 0,
        enemyStates: sc.ailments.map(a => AILMENT_STATE[a]).filter(Boolean),
        fieldStates: teamFieldStates(allies, sc),
    })
    const ult = result.members[0]?.skills.find(s => s.type === TargetType.specialId)
    if (!ult) return { max: 0, avg: 0, critRate: 0 }
    return { max: ult.total.crit, avg: ult.total.avg, critRate: critRateOf(ult.critChance) }
}

/** The stage states that come from the page's inputs other than the enemies: buff / debuff bonus reduction per ally
 *  and the stage buffs. */
function teamFieldStates(allies: PvPKioku[], sc: TeamScoreScenario): NonNullable<MaxDmgOptions["fieldStates"]> {
    const field: NonNullable<MaxDmgOptions["fieldStates"]> = []
    allies.forEach((k, i) => {
        const onElement = sc.weakElements.includes(k.data.element as KiokuElement)
        const buff = onElement ? sc.buffMultReduction : (sc.offElementBuffMultReduction ?? sc.buffMultReduction)
        const debuff = onElement ? sc.debuffMultReduction : (sc.offElementDebuffMultReduction ?? sc.debuffMultReduction)
        if (buff) field.push({ side: "ally", index: i, type: buff > 0 ? "DWN_BUFF_EFFECT_VALUE" : "UP_BUFF_EFFECT_VALUE", value1: Math.round(Math.abs(buff) * 10) })
        if (debuff) field.push({ side: "ally", index: i, type: debuff > 0 ? "DWN_DEBUFF_EFFECT_VALUE" : "UP_DEBUFF_EFFECT_VALUE", value1: Math.round(Math.abs(debuff) * 10) })
    })
    for (const [type, value] of Object.entries(sc.arenaEffects)) {
        if (!value) continue
        // stage buffs are given in % (the data's per mille / 10); counts and flat values as they are
        const v1 = /_FIXED$|^WEAKNESS$|^FLAT_ATK$/.test(type) ? Math.round(value) : Math.round(value * 10)
        field.push({ side: ENEMY_SIDE.test(type) ? "enemy" : "ally", index: "all", type: type === "FLAT_ATK" ? "UP_ATK_FIXED" : type, value1: v1 })
    }
    return field
}
