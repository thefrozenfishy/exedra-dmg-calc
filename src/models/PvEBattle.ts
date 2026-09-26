// Builds an engine battle for a quest stage: the player's team (team1) against the stage's enemy waves.
import { PvPBattle, type BattleOptions } from "./PvPBattle";
import { PvPTeam } from "./PvPTeam";
import type { PvPKioku } from "./PvPKioku";
import { BattleType } from "./DamageCalculator";
import { EnemyKioku, isSoloRaidStage, stageWaveMeta, summonTemplates, type QuestEnemyAppearance, type WaveMeta } from "./PvE";
import { getScoreAttackStage } from "./PvEScore";

export function enemyKiokus(wave: QuestEnemyAppearance[]): PvPKioku[] {
    return wave.map(a => new EnemyKioku(a) as unknown as PvPKioku)
}

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

export function createPvEBattle(allies: PvPKioku[], questStageMstId: number, seed?: number, firstWave = 0, opts?: Omit<BattleOptions, "waves" | "waveMeta">): PvPBattle {
    const meta = stageWaveMeta(questStageMstId).slice(firstWave)
    if (!meta.length) throw new Error(`Stage ${questStageMstId} has no enemies`)
    const bt = stageBattleType(questStageMstId)
    const team1 = new PvPTeam(allies, "Ally", false, bt)
    const team2 = new PvPTeam(enemyKiokus(waveStartUnits(meta[0])), "Enemy", false, bt)
    team2.summonTemplates = summonTemplates(questStageMstId)
    if (isSoloRaidStage(questStageMstId)) team1.countdown = team2.countdown = { max: 0, value: 0, cancelMax: 0, cancelTotal: 0 }
    return new PvPBattle(team1, team2, false, seed, { ...opts, waves: meta.slice(1).map(m => enemyKiokus(waveStartUnits(m))), waveMeta: meta })
}
