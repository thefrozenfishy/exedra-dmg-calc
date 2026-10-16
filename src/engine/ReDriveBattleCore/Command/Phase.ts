// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.Command.Phase  (TypeDefIndex 973, public enum) ----
export const Phase = {
    Ready: 0,
    Start: 1,
    Finish: 2,
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];
