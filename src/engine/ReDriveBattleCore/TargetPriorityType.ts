// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.TargetPriorityType  (TypeDefIndex 370, public enum) ----
export const TargetPriorityType = {
    Low: 0,
    Middle: 1,
    High: 2,
} as const;
export type TargetPriorityType = (typeof TargetPriorityType)[keyof typeof TargetPriorityType];
