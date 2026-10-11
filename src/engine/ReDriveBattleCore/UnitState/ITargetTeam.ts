// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

// ---- ReDriveBattleCore.UnitState.ITargetTeam  (TypeDefIndex 739, public interface) ----
export interface ITargetTeam {
    readonly TargetTeam: ITargetTeam_TeamTargetType;
}

// ---- ReDriveBattleCore.UnitState.ITargetTeam.TeamTargetType  (TypeDefIndex 738, public enum) ----
export const ITargetTeam_TeamTargetType = {
    Friend: 1,
    Opponent: 2,
    All: 3,
} as const;
export type ITargetTeam_TeamTargetType = (typeof ITargetTeam_TeamTargetType)[keyof typeof ITargetTeam_TeamTargetType];
