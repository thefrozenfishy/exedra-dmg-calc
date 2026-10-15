// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

// ---- ReDriveBattleCore.UnitState.EffectOriginType  (TypeDefIndex 684, public enum) ----
export const EffectOriginType = {
    None: 0,
    ActiveSkill: 1,
    PassiveSkill: 2,
    Field: 3,
} as const;
export type EffectOriginType = (typeof EffectOriginType)[keyof typeof EffectOriginType];
