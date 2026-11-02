// Score Attack stage lookup (ScoreAttackStageMst: questStageMstId -> season + difficulty).
import scoreAttackStageJson from "../assets/base_data/getScoreAttackStageMstList.json";

export interface ScoreAttackStage { scoreAttackStageMstId: number, scoreAttackMstId: number, questStageMstId: number, difficulty: number, fixedDifficultyScore: number, isEx: boolean }

const byStage = new Map<number, ScoreAttackStage>((scoreAttackStageJson as any[]).map(s => [s.questStageMstId, s]))

export function getScoreAttackStage(questStageMstId: number): ScoreAttackStage | undefined {
    return byStage.get(questStageMstId)
}

// Score Attack score. The server computes it (Network.Definition.ScoreAttack.ScoreInfo: roundBonus, difficultyBonus,
// turnDamageBonus, roundDamageBonus, hpBonus, aliveBonus); the coefficients are CalculationPointPolicyMst policyType 1.
// Matches 3 in-game result screens (Sayaka Miki (Anomalia) rank 50, Box Witch EX, a rank 50 event SA):
//   final = Difficulty Score + coefficient * (Max DMG + Clear Rounds + Remaining HP)
//   Difficulty Score = ScoreAttackStageMst.fixedDifficultyScore, else difficultyBonus[difficulty] (rank 50: 800,000)
//   coefficient      = difficultyCoefficient[difficulty] / 1000 (rank 50: x20, EX = difficulty 51: x25)
//   Max DMG          = floor(damage / divisor); the divisor differs per Score Attack (56, 140; EX 9.5 = divideDamageBonus
//                      9500 / 1000) and is not in the client data [UNCERTAIN where it comes from] -> user input
//   Clear Rounds     = 90000 - 5000 * rounds (5 -> 65,000, 2 -> 80,000); EX: x1.25 (3 -> 93,750) [UNCERTAIN, one screen]
//   Remaining HP     = floor(baseHpBonus 15000 * team HP ratio)
import calculationPointPolicyJson from "../assets/base_data/getCalculationPointPolicyMstList.json";
const saCoef = new Map<string, number>((calculationPointPolicyJson as any[])
    .filter(r => r.policyType === 1)
    .map(r => [`${r.coefficientName}|${r.conditionValue}`, r.value]))

export interface ScoreAttackStageScore { difficulty: number, isEx: boolean, difficultyScore: number, coefficient: number, roundScale: number }
export function scoreAttackStageScore(questStageMstId: number): ScoreAttackStageScore | undefined {
    const st = byStage.get(questStageMstId) as any
    if (!st) return undefined
    const difficultyScore = st.fixedDifficultyScore || (saCoef.get(`difficultyBonus|${st.difficulty}`) ?? 0)
    const coefficient = (saCoef.get(`difficultyCoefficient|${st.difficulty}`) ?? 20000) / 1000
    return { difficulty: st.difficulty, isEx: !!st.isEx, difficultyScore, coefficient, roundScale: st.isEx ? 1.25 : 1 }
}

// coefficient / roundScale: from scoreAttackStageScore (defaults: x20, 1 = a rank 50 stage).
export interface ScoreAttackScoreInputs { difficultyScore: number, scoreMultiplier: number, turns: number, hpPercent: number, coefficient?: number, roundScale?: number }
export interface ScoreAttackScoreParts { maxDmg: number, clearRounds: number, remainingHp: number, total: number, final: number }

export function scoreAttackScoreParts(damage: number, i: ScoreAttackScoreInputs): ScoreAttackScoreParts {
    const maxDmg = i.scoreMultiplier > 0 ? Math.floor(damage / i.scoreMultiplier) : 0
    const clearRounds = Math.floor((90000 - 5000 * i.turns) * (i.roundScale ?? 1))
    const remainingHp = Math.floor(15000 * i.hpPercent / 100)
    const total = maxDmg + clearRounds + remainingHp
    return { maxDmg, clearRounds, remainingHp, total, final: i.difficultyScore + Math.round((i.coefficient ?? 20) * total) }
}
export function estimateScoreAttackScore(damage: number, i: ScoreAttackScoreInputs): number {
    return scoreAttackScoreParts(damage, i).final
}
