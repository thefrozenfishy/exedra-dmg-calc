// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { isImpl, notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { StateAbilityEffect } from "./StateAbilityEffect";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { ITargetTeam, ITargetTeam_TeamTargetType } from "../UnitState/ITargetTeam";
import type { UnitStateBase } from "../UnitState/UnitStateBase";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.AbilityEffect.StateTeamAbilityEffect  (TypeDefIndex 1220, public class) ----
export class StateTeamAbilityEffect extends StateAbilityEffect {
    /** 0x68 public ITargetTeam.TeamTargetType TeamTargetType */
    TeamTargetType: ITargetTeam_TeamTargetType = 0 as ITargetTeam_TeamTargetType;
    /** @rva 0x1931590  protected void .ctor() { } */
    ctor(): this {
        this.TeamTargetType = 2 as ITargetTeam_TeamTargetType;
        super.ctor();
        return this;
    }
    /** @rva 0x19313F0  public void .ctor(AbilityEffectInfo info, UnitStateBase giveUnitState, bool isIncludeDeadUnitInTarget) { } */
    ctor$AbilityEffectInfo_UnitStateBase_bool(info: AbilityEffectInfo, giveUnitState: UnitStateBase, isIncludeDeadUnitInTarget: boolean): this {
        this.TeamTargetType = 2 as ITargetTeam_TeamTargetType;
        super.ctor$AbilityEffectInfo_UnitStateBase_bool(info, giveUnitState, isIncludeDeadUnitInTarget); // inlined in the game
        if (giveUnitState == null) return this;
        if (isImpl(this._GiveUnitState, "ITargetTeam")) {
            this.TeamTargetType = (this._GiveUnitState as unknown as ITargetTeam).TargetTeam;
        }
        return this;
    }
    /** @rva 0x1930FF0 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void {
        // <>c__DisplayClass3_0: 0x10 userUnit
        this._TargetUnitIdList = [];
        let list: List<BattleUnit> = [];
        switch (this.TeamTargetType) {
            case 1: list = [...targetUnitDic.values()].filter(unit => unit._Team === userUnit._Team); break; // b__2
            case 2: list = [...targetUnitDic.values()].filter(unit => unit._Team !== userUnit._Team); break; // b__3
            case 3: list = [...targetUnitDic.values()]; break;
        }
        if (!this._IsIncludeDeadUnitInTarget) {
            list = list.filter(u => !u.get_IsDead()); // <>c.b__3_0
        }
        this._TargetUnitIdList = list.map(u => u._Id); // <>c.b__3_1
    }
}
