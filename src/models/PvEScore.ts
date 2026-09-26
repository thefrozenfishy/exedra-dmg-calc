// Score Attack stage lookup (ScoreAttackStageMst: questStageMstId -> season + difficulty).
import scoreAttackStageJson from "../assets/base_data/getScoreAttackStageMstList.json";

export interface ScoreAttackStage { scoreAttackStageMstId: number, scoreAttackMstId: number, questStageMstId: number, difficulty: number }

const byStage = new Map<number, ScoreAttackStage>((scoreAttackStageJson as any[]).map(s => [s.questStageMstId, s]))

export function getScoreAttackStage(questStageMstId: number): ScoreAttackStage | undefined {
    return byStage.get(questStageMstId)
}
