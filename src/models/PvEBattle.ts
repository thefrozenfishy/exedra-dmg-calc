// Builds an engine battle for a quest stage: the player's team (team1) against the stage's enemy waves.
import { PvPBattle, type BattleOptions } from "./PvPBattle";
import { PvPTeam } from "./PvPTeam";
import type { PvPKioku } from "./PvPKioku";
import { BattleType } from "./DamageCalculator";
import { EnemyKioku, stageWaves, type QuestEnemyAppearance } from "./PvE";
import { getScoreAttackStage } from "./PvEScore";

export function enemyKiokus(wave: QuestEnemyAppearance[]): PvPKioku[] {
    return wave.map(a => new EnemyKioku(a) as unknown as PvPKioku)
}

// Score Attack stages run as BattleType.ScoreAttack (6), everything else as a Solo quest (1). The two
// only differ in scoring (no damage/turn rule differences in the battle core).
export function stageBattleType(questStageMstId: number): BattleType {
    return getScoreAttackStage(questStageMstId) ? BattleType.ScoreAttack : BattleType.Solo
}

export function createPvEBattle(allies: PvPKioku[], questStageMstId: number, seed?: number, firstWave = 0, opts?: Omit<BattleOptions, "waves">): PvPBattle {
    const waves = stageWaves(questStageMstId).slice(firstWave)
    if (!waves.length) throw new Error(`Stage ${questStageMstId} has no enemies`)
    const bt = stageBattleType(questStageMstId)
    const team1 = new PvPTeam(allies, "Ally", false, bt)
    const team2 = new PvPTeam(enemyKiokus(waves[0]), "Enemy", false, bt)
    return new PvPBattle(team1, team2, false, seed, { ...opts, waves: waves.slice(1).map(enemyKiokus) })
}
