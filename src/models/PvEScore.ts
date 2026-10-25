// Score Attack stage lookup (ScoreAttackStageMst: questStageMstId -> season + difficulty).
import scoreAttackStageJson from "../assets/base_data/getScoreAttackStageMstList.json";

export interface ScoreAttackStage { scoreAttackStageMstId: number, scoreAttackMstId: number, questStageMstId: number, difficulty: number }

const byStage = new Map<number, ScoreAttackStage>((scoreAttackStageJson as any[]).map(s => [s.questStageMstId, s]))

export function getScoreAttackStage(questStageMstId: number): ScoreAttackStage | undefined {
    return byStage.get(questStageMstId)
}

// [APPROXIMATION] Score Attack score estimate (the game computes the real score on the server); same formula as the
// PvE Simulator and the single battle editor: difficulty + 20 * (damage / multiplier + (90000 - 5000 * turns) + 15000 * hp%).
export interface ScoreAttackScoreInputs { difficultyScore: number, scoreMultiplier: number, turns: number, hpPercent: number }

export function estimateScoreAttackScore(damage: number, i: ScoreAttackScoreInputs): number {
    return i.difficultyScore + Number((20 * (damage / i.scoreMultiplier + (90000 - 5000 * i.turns) + 15000 * i.hpPercent / 100)).toFixed(0))
}
