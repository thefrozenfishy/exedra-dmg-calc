// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, float, int } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "./EffectOriginType";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

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
    /** @rva 0x15B5F40 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("BarrierUnitState.get_IconName", 0x15B5F40); }
    /** @rva 0xC646A0  public float get_BarrierRatio() { } */
    get_BarrierRatio(): float { return this._BarrierRatio; /* auto-property */ }
    /** @rva 0xC646B0  public void set_BarrierRatio(float value) { } */
    set_BarrierRatio(value: float): void { this._BarrierRatio = value; /* auto-property */ }
    /** @rva 0x893710  public float get_BarrierFixed() { } */
    get_BarrierFixed(): float { return this._BarrierFixed; /* auto-property */ }
    /** @rva 0x894540  public void set_BarrierFixed(float value) { } */
    set_BarrierFixed(value: float): void { this._BarrierFixed = value; /* auto-property */ }
    /** @rva 0x754560  public float get_MaxBarrierRatio() { } */
    get_MaxBarrierRatio(): float { return this._MaxBarrierRatio; /* auto-property */ }
    /** @rva 0x754810  public void set_MaxBarrierRatio(float value) { } */
    set_MaxBarrierRatio(value: float): void { this._MaxBarrierRatio = value; /* auto-property */ }
    /** @rva 0x902970  public int get_CalculatedEndurance() { } */
    get_CalculatedEndurance(): int { return this._CalculatedEndurance; /* auto-property */ }
    /** @rva 0x9029A0  public void set_CalculatedEndurance(int value) { } */
    set_CalculatedEndurance(value: int): void { this._CalculatedEndurance = value; /* auto-property */ }
    /** @rva 0x820790  public int get_CalculatedMaxEndurance() { } */
    get_CalculatedMaxEndurance(): int { return this._CalculatedMaxEndurance; /* auto-property */ }
    /** @rva 0x821190  public void set_CalculatedMaxEndurance(int value) { } */
    set_CalculatedMaxEndurance(value: int): void { this._CalculatedMaxEndurance = value; /* auto-property */ }
    /** @rva 0x76F830 slot 9  public override bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 20  public override bool get_ShouldRemoveStateByHolderDeath() { } */
    get_ShouldRemoveStateByHolderDeath(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("BarrierUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5ED0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("BarrierUnitState..ctor", 0x15B5ED0); }
    /** @rva 0x15B5BE0 slot 17  public override void SetTriggeringInfo(EffectOriginType effectOrigin, BattleUnit triggeredBattleUnit, bool isOwnSkill = False, bool isConditionActivation = False, BattleType battleType = 1) { } */
    SetTriggeringInfo(effectOrigin: EffectOriginType, triggeredBattleUnit: BattleUnit, isOwnSkill?: boolean /* = False */, isConditionActivation?: boolean /* = False */, battleType?: BattleType /* = 1 */): void { return notPorted("BarrierUnitState.SetTriggeringInfo", 0x15B5BE0); }
    /** @rva 0x15B5700 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit triggeredUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(triggeredUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("BarrierUnitState.GetAIFilteredTargets", 0x15B5700); }
    /** @rva 0x15B5980 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("BarrierUnitState.GetUnitFilterFuncOrder", 0x15B5980); }
    /** @rva 0x15B54E0  private static int CalculateMaxEndurance(ValueTuple<float, float, float> info, BattleUnit targetUnit, BattleType battleType) { } */
    static CalculateMaxEndurance(info: any /* ValueTuple<float, float, float> */, targetUnit: BattleUnit, battleType: BattleType): int { return notPorted("BarrierUnitState.CalculateMaxEndurance", 0x15B54E0); }
    /** @rva 0x15B52B0  private static int CalculateEndurance(ValueTuple<float, float, float> info, BattleUnit targetUnit, BattleType battleType) { } */
    static CalculateEndurance(info: any /* ValueTuple<float, float, float> */, targetUnit: BattleUnit, battleType: BattleType): int { return notPorted("BarrierUnitState.CalculateEndurance", 0x15B52B0); }
    /** @rva 0x15B5E10  public void UpdateValueByRate(float rate) { } */
    UpdateValueByRate(rate: float): void { return notPorted("BarrierUnitState.UpdateValueByRate", 0x15B5E10); }
    /** @rva 0x15B5D40  private bool <GetAIFilteredTargets>g__HasBarrierUpdate|31_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$g__HasBarrierUpdate_31_1(unit: BattleUnit): boolean { return notPorted("BarrierUnitState.<GetAIFilteredTargets>g__HasBarrierUpdate|31_1", 0x15B5D40); }
}
