// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.BattleCondition.CompareOperator  (TypeDefIndex 1075, public enum) ----
export const CompareOperator = {
    None: 0,
    Equal: 1,
    NotEqual: 2,
    Greater: 3,
    GreaterOrEqual: 4,
    Less: 5,
    LessOrEqual: 6,
    Contain: 7,
    NotContain: 8,
} as const;
export type CompareOperator = (typeof CompareOperator)[keyof typeof CompareOperator];
