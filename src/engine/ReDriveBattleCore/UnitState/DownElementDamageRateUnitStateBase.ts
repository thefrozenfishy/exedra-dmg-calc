// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IElementDamageRateVariation } from "./IElementDamageRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownElementDamageRateUnitStateBase  (TypeDefIndex 599, public abstract class) ----
export abstract class DownElementDamageRateUnitStateBase extends ParameterVariationUnitStateBase {  // implements IElementDamageRateVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['IElementDamageRateVariation', 'IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BA2F0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownElementDamageRateUnitStateBase.get_IconName", 0x15BA2F0); }
    /** @rva 0x15BA2C0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("DownElementDamageRateUnitStateBase.get_GiveVisualEffectName", 0x15BA2C0); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownElementDamageRateUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownElementDamageRateUnitStateBase..ctor", 0x15B5240); }
    /** @rva 0x15B9E40 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return notPorted("DownElementDamageRateUnitStateBase.CanAddTo", 0x15B9E40); }
    /** @rva -1 slot 30  public abstract Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement); */
    abstract GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal;
    /** @rva 0x15B9E70 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownElementDamageRateUnitStateBase.GetUnitFilterFuncOrder", 0x15B9E70); }
    /** @rva 0x15BA230  private IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterMatchElement|12_0(IEnumerable<BattleUnit> candidateUnits) { } */
    $GetUnitFilterFuncOrder$g__UnitFilterMatchElement_12_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("DownElementDamageRateUnitStateBase.<GetUnitFilterFuncOrder>g__UnitFilterMatchElement|12_0", 0x15BA230); }
    /** @rva 0x15BA200  private bool <GetUnitFilterFuncOrder>b__12_1(BattleUnit unit) { } */
    $GetUnitFilterFuncOrder$b__12_1(unit: BattleUnit): boolean { return notPorted("DownElementDamageRateUnitStateBase.<GetUnitFilterFuncOrder>b__12_1", 0x15BA200); }
}
