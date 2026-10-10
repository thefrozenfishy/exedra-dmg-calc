// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.AutoType  (TypeDefIndex 317, public enum) ----
export const AutoType = {
    Manual: 0,
    SemiAuto: 1,
    FullAuto: 2,
} as const;
export type AutoType = (typeof AutoType)[keyof typeof AutoType];
