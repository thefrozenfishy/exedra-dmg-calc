// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.JudgeResultType  (TypeDefIndex 419, public enum) ----
export const JudgeResultType = {
    None: 0,
    MainTargetRemainHpGaugeCount: 1,
} as const;
export type JudgeResultType = (typeof JudgeResultType)[keyof typeof JudgeResultType];
