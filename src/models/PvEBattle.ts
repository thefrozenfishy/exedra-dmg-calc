// Quest stage helpers shared by the PvE Simulator, Max Damage and the team scorers.
import { BattleType } from "../types/enums";
import type { QuestEnemyAppearance, WaveMeta } from "./PvE";
import { getScoreAttackStage } from "./PvEScore";

// Score Attack stages run as BattleType.ScoreAttack (6), everything else as a Solo quest (1). The two
// only differ in scoring (no damage/turn rule differences in the battle core).
export function stageBattleType(questStageMstId: number): BattleType {
    return getScoreAttackStage(questStageMstId) ? BattleType.ScoreAttack : BattleType.Solo
}

// The units a wave starts with. An endless (Link HP type 1) wave starts with the first five of its list
// (AdditionalEnemyReferee.CreateEndlessEnemyUnitListForBattleStart: positions 1-5, round-robin).
export function waveStartUnits(meta: WaveMeta): QuestEnemyAppearance[] {
    return meta.linkHpType === 1 ? meta.appearances.slice(0, 5) : meta.appearances
}
