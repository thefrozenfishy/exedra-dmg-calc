// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { CalculationPointPolicyMstRecord } from "../../Network/Definition/CalcPoint/CalculationPointPolicyMstRecord";
import { CalculationPointPolicyMstModel } from "../Model/CalculationPointPolicyMstModel";
import { BattleMstReaderBase } from "../Reader/BattleMstReaderBase";
import { f32, notPorted, trunc } from "../../runtime";
import type { IEnumerable, List, float, int } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "./EffectOriginType";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.BarrierUnitState  (TypeDefIndex 540, public class) ----
export class BarrierUnitState extends UnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** 0x88 private float <BarrierRatio>k__BackingField */
    _BarrierRatio: float = 0;
    /** 0x8C private float <BarrierFixed>k__BackingField */
    _BarrierFixed: float = 0;
    /** 0x90 private float <MaxBarrierRatio>k__BackingField */
    _MaxBarrierRatio: float = 0;
    /** 0x94 private int <CalculatedEndurance>k__BackingField */
    _CalculatedEndurance: int = 0;
    /** 0x98 private int <CalculatedMaxEndurance>k__BackingField */
    _CalculatedMaxEndurance: int = 0;
    get BarrierRatio(): float { return this.get_BarrierRatio(); }
    set BarrierRatio(v: float) { this.set_BarrierRatio(v); }
    get BarrierFixed(): float { return this.get_BarrierFixed(); }
    set BarrierFixed(v: float) { this.set_BarrierFixed(v); }
    get MaxBarrierRatio(): float { return this.get_MaxBarrierRatio(); }
    set MaxBarrierRatio(v: float) { this.set_MaxBarrierRatio(v); }
    get CalculatedEndurance(): int { return this.get_CalculatedEndurance(); }
    set CalculatedEndurance(v: int) { this.set_CalculatedEndurance(v); }
    get CalculatedMaxEndurance(): int { return this.get_CalculatedMaxEndurance(); }
    set CalculatedMaxEndurance(v: int) { this.set_CalculatedMaxEndurance(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15C68B0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_barrier";
    }
    /** @rva 0xC6F3E0  public float get_BarrierRatio() { } */
    get_BarrierRatio(): float { return this._BarrierRatio; /* auto-property */ }
    /** @rva 0xC6F3F0  public void set_BarrierRatio(float value) { } */
    set_BarrierRatio(value: float): void { this._BarrierRatio = value; /* auto-property */ }
    /** @rva 0x893710  public float get_BarrierFixed() { } */
    get_BarrierFixed(): float { return this._BarrierFixed; /* auto-property */ }
    /** @rva 0x894540  public void set_BarrierFixed(float value) { } */
    set_BarrierFixed(value: float): void { this._BarrierFixed = value; /* auto-property */ }
    /** @rva 0x754560  public float get_MaxBarrierRatio() { } */
    get_MaxBarrierRatio(): float { return this._MaxBarrierRatio; /* auto-property */ }
    /** @rva 0x754810  public void set_MaxBarrierRatio(float value) { } */
    set_MaxBarrierRatio(value: float): void { this._MaxBarrierRatio = value; /* auto-property */ }
    /** @rva 0x901ED0  public int get_CalculatedEndurance() { } */
    get_CalculatedEndurance(): int { return this._CalculatedEndurance; /* auto-property */ }
    /** @rva 0x901F00  public void set_CalculatedEndurance(int value) { } */
    set_CalculatedEndurance(value: int): void { this._CalculatedEndurance = value; /* auto-property */ }
    /** @rva 0x820790  public int get_CalculatedMaxEndurance() { } */
    get_CalculatedMaxEndurance(): int { return this._CalculatedMaxEndurance; /* auto-property */ }
    /** @rva 0x821190  public void set_CalculatedMaxEndurance(int value) { } */
    set_CalculatedMaxEndurance(value: int): void { this._CalculatedMaxEndurance = value; /* auto-property */ }
    /** @rva 0x76F830 slot 9  public override bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 20  public override bool get_ShouldRemoveStateByHolderDeath() { } */
    get_ShouldRemoveStateByHolderDeath(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x15C4400  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C6840  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._BarrierRatio = f32(f32(info._EffectValue1) / 1000);
        this._BarrierFixed = f32(info._EffectValue2);
        this._MaxBarrierRatio = f32(f32(info._EffectValue3) / 1000);
        return this;
    }
    /** @rva 0x15C6550 slot 17  public override void SetTriggeringInfo(EffectOriginType effectOrigin, BattleUnit triggeredBattleUnit, bool isOwnSkill = False, bool isConditionActivation = False, BattleType battleType = 1) { } */
    SetTriggeringInfo(effectOrigin: EffectOriginType, triggeredBattleUnit: BattleUnit, isOwnSkill: boolean = false, isConditionActivation: boolean = false, battleType: BattleType = 1 as BattleType): void {
        this._CalculatedEndurance = BarrierUnitState.CalculateEndurance([this._BarrierRatio, this._BarrierFixed, this._MaxBarrierRatio], triggeredBattleUnit, battleType);
        this._CalculatedMaxEndurance = BarrierUnitState.CalculateMaxEndurance([this._BarrierRatio, this._BarrierFixed, this._MaxBarrierRatio], triggeredBattleUnit, battleType);
        super.SetTriggeringInfo(effectOrigin, triggeredBattleUnit, isOwnSkill, isConditionActivation, battleType);
    }
    /** @rva 0x15C6070 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit triggeredUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(triggeredUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__31_0
        if (list.length > 0) {
            if (effectRange === -1) list = [triggeredUnit];
            list = list.filter(unit => this.$GetAIFilteredTargets$g__HasBarrierUpdate_31_1(unit));
        }
        return list;
    }
    /** @rva 0x15C62F0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMinDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15C5E50  private static int CalculateMaxEndurance(ValueTuple<float, float, float> info, BattleUnit targetUnit, BattleType battleType) { } */
    static CalculateMaxEndurance(info: [float, float, float], targetUnit: BattleUnit, battleType: BattleType): int {
        if (info[2] === 0) return BarrierUnitState.CalculateEndurance(info, targetUnit, battleType);
        let value = f32(targetUnit._BattleParameter._DEF * info[2]);
        if (battleType === 2 || battleType === 4) {
            const model = BattleMstReaderBase.get_Instance<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int>(CalculationPointPolicyMstModel)
                .GetModel(x => x.coefficientName === "barrierEnduranceSuppresionRatio"); // <>c.b__33_0
            value = f32(value * f32(1 - f32(model.get_Value() / 1000)));
        }
        return trunc(Math.ceil(value)); // Math.Ceiling(double)
    }
    /** @rva 0x15C5C20  private static int CalculateEndurance(ValueTuple<float, float, float> info, BattleUnit targetUnit, BattleType battleType) { } */
    static CalculateEndurance(info: [float, float, float], targetUnit: BattleUnit, battleType: BattleType): int {
        let value = f32(f32(targetUnit.GetProcessedDefDecimal().toFloat() * info[0]) + info[1]);
        if (battleType === 2 || battleType === 4) {
            const model = BattleMstReaderBase.get_Instance<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int>(CalculationPointPolicyMstModel)
                .GetModel(x => x.coefficientName === "barrierEnduranceSuppresionRatio"); // <>c.b__34_0
            value = f32(value * f32(1 - f32(model.get_Value() / 1000)));
        }
        return trunc(Math.ceil(value)); // Math.Ceiling(double)
    }
    /** @rva 0x15C6780  public void UpdateValueByRate(float rate) { } */
    UpdateValueByRate(rate: float): void {
        this._BarrierRatio = Math.max(f32(this._BarrierRatio * rate), 0);
        this._BarrierFixed = Math.max(f32(this._BarrierFixed * rate), 0);
        this._MaxBarrierRatio = Math.max(f32(this._MaxBarrierRatio * rate), 0);
    }
    /** @rva 0x15C66B0  private bool <GetAIFilteredTargets>g__HasBarrierUpdate|31_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$g__HasBarrierUpdate_31_1(unit: BattleUnit): boolean {
        const num = Math.max(unit._Condition._MaxBarrierEndurance, this._CalculatedMaxEndurance);
        if (unit._Condition._BarrierEndurance < num) return true;
        return unit._Condition.GetUnitStateList(BarrierUnitState, false).length === 0;
    }
}
