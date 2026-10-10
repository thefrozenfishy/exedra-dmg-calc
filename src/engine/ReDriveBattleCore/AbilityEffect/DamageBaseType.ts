// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.AbilityEffect.DamageBaseType  (TypeDefIndex 1170, public enum) ----
export const DamageBaseType = {
    None: 0,
    Atk: 1,
    Def: 2,
    MaxHp: 3,
} as const;
export type DamageBaseType = (typeof DamageBaseType)[keyof typeof DamageBaseType];
