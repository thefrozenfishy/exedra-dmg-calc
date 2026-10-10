// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.AbilitySourceType  (TypeDefIndex 1298, public enum) ----
export const AbilitySourceType = {
    Unit: 1,
    Card: 2,
    Support: 3,
    SelectionAbility: 4,
    Bonus: 5,
    SoloRaidSeasonBuff: 6,
    SoloRaidPartyBuff: 7,
    SoloRaidCommonBuff: 8,
} as const;
export type AbilitySourceType = (typeof AbilitySourceType)[keyof typeof AbilitySourceType];
