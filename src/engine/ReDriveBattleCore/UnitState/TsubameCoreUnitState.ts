// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { TsubameLinkUnitState } from "./TsubameLinkUnitState";
import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import { Decimal } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IBuff } from "./IBuff";
import type { IRequiredSpeedVariationStateForDecide } from "./IRequiredSpeedVariationStateForDecide";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import type { ISpeedVariation } from "./ISpeedVariation";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.TsubameCoreUnitState  (TypeDefIndex 660, public class) ----
export class TsubameCoreUnitState extends UnitStateBase {  // implements IBuff, ISpeedVariation, IRequiredStateForDecide, IRequiredSpeedVariationStateForDecide
    static readonly __interfaces: readonly string[] = ['IBuff', 'ISpeedVariation', 'IRequiredStateForDecide', 'IRequiredSpeedVariationStateForDecide'];
    /** 0x88 private float <DownRatio>k__BackingField */
    _DownRatio: float = 0;
    get Addition(): AdditionType { return this.get_Addition(); }
    get DownRatio(): float { return this.get_DownRatio(); }
    set DownRatio(v: float) { this.set_DownRatio(v); }
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x758B30 slot 27  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x1703810 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_unique_002";
    }
    /** @rva 0x17037E0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0xC84590  public float get_DownRatio() { } */
    get_DownRatio(): float { return this._DownRatio; /* auto-property */ }
    /** @rva 0xC845A0  public void set_DownRatio(float value) { } */
    set_DownRatio(value: float): void { this._DownRatio = value; /* auto-property */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16F8AE0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._DownRatio = f32(f32(info._EffectValue1) / 10);
        return this;
    }
    /** @rva 0x1702FA0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__14_0
        if (list.length > 0) list = list.filter(unit => unit._Id === userUnit._Id) /* DisplayClass14_0.b__1 */.filter(unit => !unit._Condition._StateList.some(state => state instanceof TsubameCoreUnitState && state._UserUnitId === userUnit._Id)); // b__2, b__3
        return list;
    }
    /** @rva 0x1703400 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x17031E0 slot 26  public Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal {
        return processingValue.mul(Decimal.fromFloat(this._DownRatio).div(Decimal.fromInt(100))).neg();
    }
    /** @rva 0x1703490 slot 19  public override void OnRemovingFromCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnRemovingFromCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void {
        // <>c__DisplayClass17_0 { unit, this }
        for (const u of [...gameDirector.get_battleUnitDic().values()].filter(u => u._Team === unit._Team)) { // b__0
            u._Condition.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(u, state => state instanceof TsubameLinkUnitState && state._UserUnitId === this._UserUnitId); // b__1
        }
    }
    /** @rva 0x1702F80 slot 29  public bool CanAddTo(BattleUnitData targetUnit) { } */
    CanAddTo$BattleUnitData(targetUnit: any /* BattleUnitData */): boolean { return notPorted("TsubameCoreUnitState.CanAddTo", 0x1702F80); }
    /** @rva 0x17032F0 slot 28  public Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("TsubameCoreUnitState.GetSpeedVariationValue", 0x17032F0); }
    /** ISpeedVariation.GetSpeedVariationValue (interface slot 1): the C# overload taking BattleUnit; the name is suffixed
     * here because of the BattleUnitData overload, so interface calls are forwarded to it. */
    GetSpeedVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return this.GetSpeedVariationValue$BattleUnit_Decimal(unit, processingValue); }
}
