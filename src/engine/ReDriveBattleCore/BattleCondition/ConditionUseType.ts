// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.BattleCondition.ConditionUseType  (TypeDefIndex 1077, public enum) ----
export const ConditionUseType = {
    None: 0,
    SkillStart: 1,
    SkillActive: 2,
    EnemyAction: 3,
} as const;
export type ConditionUseType = (typeof ConditionUseType)[keyof typeof ConditionUseType];
