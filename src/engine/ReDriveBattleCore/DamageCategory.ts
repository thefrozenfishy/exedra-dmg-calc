// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.DamageCategory  (TypeDefIndex 308, public enum) ----
export const DamageCategory = {
    None: 0,
    Normal: 1,
    Random: 2,
    Break: 3,
    Slip: 4,
    Reflection: 5,
    Ratio: 6,
    Additional: 7,
    FinalDamage: 8,
} as const;
export type DamageCategory = (typeof DamageCategory)[keyof typeof DamageCategory];
