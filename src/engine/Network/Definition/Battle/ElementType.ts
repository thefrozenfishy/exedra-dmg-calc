// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.ElementType  (TypeDefIndex 1287, public enum) ----
export const ElementType = {
    Fire: 1,
    Aqua: 2,
    Forest: 3,
    Light: 4,
    Dark: 5,
    Neutral: 6,
} as const;
export type ElementType = (typeof ElementType)[keyof typeof ElementType];
