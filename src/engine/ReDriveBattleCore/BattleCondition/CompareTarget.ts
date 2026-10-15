// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.BattleCondition.CompareTarget  (TypeDefIndex 1073, public enum) ----
export const CompareTarget = {
    None: 0,
    Self: 1,
    Actor: 2,
    MainTarget: 3,
    EachTarget: 8,
    AllTargets: 4,
    FriendTeam: 5,
    OpponentTeam: 6,
    Others: 7,
} as const;
export type CompareTarget = (typeof CompareTarget)[keyof typeof CompareTarget];
