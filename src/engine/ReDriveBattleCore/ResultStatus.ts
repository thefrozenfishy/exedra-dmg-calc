// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.ResultStatus  (TypeDefIndex 416, public enum) ----
export const ResultStatus = {
    None: 0,
    Winning: 1,
    Losing: 2,
} as const;
export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];
