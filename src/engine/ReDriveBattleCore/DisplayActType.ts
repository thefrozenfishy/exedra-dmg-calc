// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.DisplayActType  (TypeDefIndex 297, public enum) ----
export const DisplayActType = {
    None: 0,
    TurnUnit: 1,
    SpecialAttack: 2,
    AdditionalSkill: 3,
    AdditionalTurn: 4,
    ReActionTurn: 5,
    Other: 6,
} as const;
export type DisplayActType = (typeof DisplayActType)[keyof typeof DisplayActType];
