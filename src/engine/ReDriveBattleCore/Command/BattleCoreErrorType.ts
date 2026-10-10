// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.Command.BattleCoreErrorType  (TypeDefIndex 987, public enum) ----
export const BattleCoreErrorType = {
    None: 0,
    MultiRaidSyncApiError: 1,
} as const;
export type BattleCoreErrorType = (typeof BattleCoreErrorType)[keyof typeof BattleCoreErrorType];
