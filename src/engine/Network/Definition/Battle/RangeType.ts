// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.RangeType  (TypeDefIndex 1291, public enum) ----
export const RangeType = {
    Self: -1,
    SelectSingle: 1,
    SelectMultiple: 2,
    Everyone: 3,
} as const;
export type RangeType = (typeof RangeType)[keyof typeof RangeType];
