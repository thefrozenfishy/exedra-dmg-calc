// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.StanceType  (TypeDefIndex 1288, public enum) ----
export const StanceType = {
    Arcane: 1,
    Bless: 2,
    Charm: 3,
    Divine: 4,
    Enchant: 5,
} as const;
export type StanceType = (typeof StanceType)[keyof typeof StanceType];
