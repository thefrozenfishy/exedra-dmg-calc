// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.ResetUniqueBuffDebuffAbilityEffectBase  (TypeDefIndex 1207, public abstract class) ----
export abstract class ResetUniqueBuffDebuffAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected int uniqueStatePatternMstId */
    uniqueStatePatternMstId: int = 0;
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192EA40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.uniqueStatePatternMstId = info._EffectValue1;
        return this;
    }
    /** @rva 0x192EB30 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            if (targetUnit == null || targetUnit.get_IsDead()) continue;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            targetUnit._Condition.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(targetUnit, state => this.$Triggering$b__3_0(state));
            const variation = targetUnit.UpdateTurnGaugeBySpeed();
            if (variation !== 0) bundle.Add(AffectedUnitNotice.CreateByTurnGaugeVariation(targetUnitId, variation));
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
    /** @rva -1 slot 8  public abstract bool IsRemovable(UnitStateBase state); */
    abstract IsRemovable(state: UnitStateBase): boolean;
    /** @rva 0x192DA40  private bool <Triggering>b__3_0(UnitStateBase state) { } */
    $Triggering$b__3_0(state: UnitStateBase): boolean { return this.IsRemovable(state); /* vslot 8 */ }
}
