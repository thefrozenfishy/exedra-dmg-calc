// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.TargetElementType  (TypeDefIndex 1289, public enum) ----
export const TargetElementType = {
    NotSpecified: 0,
    Fire: 1,
    Aqua: 2,
    Forest: 3,
    Light: 4,
    Dark: 5,
    Neutral: 6,
} as const;
export type TargetElementType = (typeof TargetElementType)[keyof typeof TargetElementType];
