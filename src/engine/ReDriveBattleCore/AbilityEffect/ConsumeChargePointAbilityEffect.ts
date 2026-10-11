// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, mathClamp, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.ConsumeChargePointAbilityEffect  (TypeDefIndex 1160, public class) ----
export class ConsumeChargePointAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int consumePoint */
    consumePoint: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18ED430  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.consumePoint = info._EffectValue1;
        return this;
    }
    /** @rva 0x18ED190 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const condition = targetUnit._Condition;
            condition._ChargePoint = mathClamp(condition._ChargePoint - this.consumePoint, 0, condition._MaxChargePoint);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x18ECC00 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list: List<BattleUnit>;
        if (this._EffectRange === -1) {
            list = [userUnit];
        } else {
            list = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__N_0
        }
        return list.filter(unit => 1 <= unit._Condition._MaxChargePoint && 0 < unit._Condition._ChargePoint); // <>c.b__N_1
    }
    /** @rva 0x18ECE80 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__N_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMaxAtk];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
}
