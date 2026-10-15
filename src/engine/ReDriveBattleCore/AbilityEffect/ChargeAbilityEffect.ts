// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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

// ---- ReDriveBattleCore.AbilityEffect.ChargeAbilityEffect  (TypeDefIndex 1156, public class) ----
export class ChargeAbilityEffect extends AbilityEffectBase {
    /** 0x60 private int <InitChargePoint>k__BackingField */
    _InitChargePoint: int = 0;
    /** 0x64 private int <MaxChargePoint>k__BackingField */
    _MaxChargePoint: int = 0;
    get InitChargePoint(): int { return this.get_InitChargePoint(); }
    set InitChargePoint(v: int) { this.set_InitChargePoint(v); }
    get MaxChargePoint(): int { return this.get_MaxChargePoint(); }
    set MaxChargePoint(v: int) { this.set_MaxChargePoint(v); }
    /** @rva 0x8A1200  public int get_InitChargePoint() { } */
    get_InitChargePoint(): int { return this._InitChargePoint; /* auto-property */ }
    /** @rva 0x8A12D0  public void set_InitChargePoint(int value) { } */
    set_InitChargePoint(value: int): void { this._InitChargePoint = value; /* auto-property */ }
    /** @rva 0x8A1220  public int get_MaxChargePoint() { } */
    get_MaxChargePoint(): int { return this._MaxChargePoint; /* auto-property */ }
    /** @rva 0x8A12F0  public void set_MaxChargePoint(int value) { } */
    set_MaxChargePoint(value: int): void { this._MaxChargePoint = value; /* auto-property */ }
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x19226E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this._InitChargePoint = info._EffectValue1;
        this._MaxChargePoint = info._EffectValue2;
        return this;
    }
    /** @rva 0x19224C0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const condition = targetUnit._Condition;
            condition._ChargePoint = this._InitChargePoint;
            condition._MaxChargePoint = this._MaxChargePoint;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1921F30 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list: List<BattleUnit>;
        if (this._EffectRange === -1) {
            list = [userUnit];
        } else {
            list = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__N_0
        }
        return list.filter(unit => unit._Condition._MaxChargePoint === 0); // <>c.b__N_1
    }
    /** @rva 0x19221B0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__N_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMaxAtk];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
}
