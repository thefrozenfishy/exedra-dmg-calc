// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.CalcPoint.CalculationPointPolicyType  (TypeDefIndex 2954, public enum) ----
export const CalculationPointPolicyType = {
    ScoreAttack: 1,
    Quest: 2,
    PvpOrGvg: 3,
    Gve: 4,
    Pvp: 5,
    Gvg: 6,
    SoloRaid: 7,
} as const;
export type CalculationPointPolicyType = (typeof CalculationPointPolicyType)[keyof typeof CalculationPointPolicyType];
