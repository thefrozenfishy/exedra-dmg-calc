// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.AbnormalConditionType  (TypeDefIndex 1296, public enum) ----
export const AbnormalConditionType = {
    Burn: 1,
    Weakness: 2,
    Poison: 3,
    Stun: 4,
    Curse: 5,
    Bleed: 6,
} as const;
export type AbnormalConditionType = (typeof AbnormalConditionType)[keyof typeof AbnormalConditionType];
