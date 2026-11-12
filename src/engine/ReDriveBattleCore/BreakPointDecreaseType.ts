// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.BreakPointDecreaseType  (TypeDefIndex 311, public enum) ----
export const BreakPointDecreaseType = {
    Normal: 0,
    OnDrive: 1,
} as const;
export type BreakPointDecreaseType = (typeof BreakPointDecreaseType)[keyof typeof BreakPointDecreaseType];
