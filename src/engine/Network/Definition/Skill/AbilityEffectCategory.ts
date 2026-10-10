// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Skill.AbilityEffectCategory  (TypeDefIndex 3336, public enum) ----
export const AbilityEffectCategory = {
    Damage: 1,
    Positive: 2,
    Negative: 3,
    AddAct: 4,
} as const;
export type AbilityEffectCategory = (typeof AbilityEffectCategory)[keyof typeof AbilityEffectCategory];
