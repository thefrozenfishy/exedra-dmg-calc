// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

// ---- ReDriveBattleCore.UnitState.AdditionType  (TypeDefIndex 685, public enum) ----
export const AdditionType = {
    Up: 0,
    Down: 1,
} as const;
export type AdditionType = (typeof AdditionType)[keyof typeof AdditionType];
