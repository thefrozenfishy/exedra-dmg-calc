// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { StateAbilityEffect } from "./StateAbilityEffect";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { ITargetTeam_TeamTargetType } from "../UnitState/ITargetTeam";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.StateTeamAbilityEffect  (TypeDefIndex 1220, public class) ----
export class StateTeamAbilityEffect extends StateAbilityEffect {
    /** 0x68 public ITargetTeam.TeamTargetType TeamTargetType */
    TeamTargetType: ITargetTeam_TeamTargetType = 0 as ITargetTeam_TeamTargetType;
    /** @rva 0x1902AC0  protected void .ctor() { } */
    ctor(): this {
        this.TeamTargetType = 2 as ITargetTeam_TeamTargetType;
        super.ctor();
        return this;
    }
    /** @rva 0x1902920  public void .ctor(AbilityEffectInfo info, UnitStateBase giveUnitState, bool isIncludeDeadUnitInTarget) { } */
    ctor$AbilityEffectInfo_UnitStateBase_bool(info: AbilityEffectInfo, giveUnitState: UnitStateBase, isIncludeDeadUnitInTarget: boolean): this { return notPorted("StateTeamAbilityEffect..ctor", 0x1902920); }
    /** @rva 0x1902520 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void { return notPorted("StateTeamAbilityEffect.SelectTargets", 0x1902520); }
}
