// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.AutoMode  (TypeDefIndex 1297, public enum) ----
export const AutoMode = {
    Unknown: -1,
    Manual: 0,
    SemiAuto: 1,
    FullAuto: 2,
} as const;
export type AutoMode = (typeof AutoMode)[keyof typeof AutoMode];
