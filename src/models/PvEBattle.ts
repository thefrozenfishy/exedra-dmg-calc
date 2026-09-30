// Builds an engine battle for a quest stage: the player's team (team1) against the stage's enemy waves.
import { PvPBattle, type BattleOptions } from "./PvPBattle";
import { PvPTeam } from "./PvPTeam";
import type { PvPKioku } from "./PvPKioku";
import { BattleType } from "./DamageCalculator";
import { EnemyKioku, isSoloRaidStage, soloRaidInfo, SOLO_RAID_COMMON_CHARGE_PASSIVE, stageWaveMeta, summonTemplates, type QuestEnemyAppearance, type WaveMeta } from "./PvE";
import questEnemyAppearanceJson from "../assets/base_data/getQuestEnemyAppearanceMstList.json";
import type { RaidCarry } from "./PvPBattle";
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

export interface PvEOptions extends Omit<BattleOptions, "waves" | "waveMeta" | "roundLimit" | "allyExtraPassives"> {
    partyBuffId?: number         // Solo Raid: chosen SoloRaidPartyBuffMst (default: the group's first)
    noRoundLimit?: boolean       // Solo Raid: ignore limitRoundCount (e.g. to see how long a clear takes)
}

const appearanceById = new Map<number, QuestEnemyAppearance>((questEnemyAppearanceJson as QuestEnemyAppearance[]).map(a => [a.questEnemyAppearanceMstId, a]))

export function createPvEBattle(allies: PvPKioku[], questStageMstId: number, seed?: number, firstWave = 0, opts?: PvEOptions): PvPBattle {
    const carry: RaidCarry | undefined = opts?.raidCarry
    if (carry) firstWave = Math.max(0, carry.wave - 1)
    const meta = stageWaveMeta(questStageMstId).slice(firstWave)
    if (!meta.length) throw new Error(`Stage ${questStageMstId} has no enemies`)
    const bt = stageBattleType(questStageMstId)
    const team1 = new PvPTeam(allies, "Ally", false, bt)
    // [CONFIRMED 3.19] WaveReferee.CreateEnemyUnitListFromEnemyInfos (0x15d2130): a continued attempt spawns the saved
    // (alive) enemies - current forms included - at their positions.
    const startUnits = carry?.enemies.length
        ? carry.enemies.map(e => appearanceById.get(e.appearanceId)).filter((a): a is QuestEnemyAppearance => !!a)
        : waveStartUnits(meta[0])
    const team2 = new PvPTeam(enemyKiokus(startUnits), "Enemy", false, bt)
    if (carry?.enemies.length) team2.kiokuStates.forEach((k, i) => { k.positionId = carry.enemies[i].positionId })
    team2.summonTemplates = summonTemplates(questStageMstId)
    let roundLimit = 0
    let allyExtraPassives: number[] = []
    if (isSoloRaidStage(questStageMstId)) {
        team1.countdown = team2.countdown = { max: 0, value: 0, cancelMax: 0, cancelTotal: 0 }
        const info = soloRaidInfo(questStageMstId)!
        roundLimit = opts?.noRoundLimit ? 0 : info.limitRoundCount
        const party = info.partyBuffs.find(p => p.soloRaidPartyBuffMstId === opts?.partyBuffId) ?? info.partyBuffs[0]
        const season = info.season
        if (season) team1.soloRaid = team2.soloRaid = { active: false, point: 0, maxPoint: season.maxBuffPoint, activeMaxPoint: season.maxBuffPointOnEnhanced, gauge: 0, maxGauge: season.enhancedSkillTurnGaugeValue }
        allyExtraPassives = [SOLO_RAID_COMMON_CHARGE_PASSIVE, season?.passiveSkillMstId, season?.enhancedPassiveSkillMstId, season?.buffPointChargePassiveSkillMstId,
            party?.passiveSkillMstId, party?.buffPointChargePassiveSkillMstId].filter((x): x is number => !!x)
    }
    const battle = new PvPBattle(team1, team2, false, seed, { ...opts, waves: meta.slice(1).map(m => enemyKiokus(waveStartUnits(m))), waveMeta: meta, roundLimit, allyExtraPassives })
    battle.firstWave = firstWave
    return battle
}
