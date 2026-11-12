// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.UniqueLvStateKind  (TypeDefIndex 364, public enum) ----
export const UniqueLvStateKind = {
    None: 0,
    Chain: 1,
    Drive: 2,
} as const;
export type UniqueLvStateKind = (typeof UniqueLvStateKind)[keyof typeof UniqueLvStateKind];
