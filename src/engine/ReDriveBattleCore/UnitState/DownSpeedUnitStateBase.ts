// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IRequiredSpeedVariationStateForDecide } from "./IRequiredSpeedVariationStateForDecide";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import type { ISpeedVariation } from "./ISpeedVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownSpeedUnitStateBase  (TypeDefIndex 619, public abstract class) ----
export abstract class DownSpeedUnitStateBase extends ParameterVariationUnitStateBase {  // implements ISpeedVariation, IRequiredStateForDecide, IDebuff, IRequiredSpeedVariationStateForDecide
    static readonly __interfaces: readonly string[] = ['ISpeedVariation', 'IRequiredStateForDecide', 'IDebuff', 'IRequiredSpeedVariationStateForDecide'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BBEF0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownSpeedUnitStateBase.get_IconName", 0x15BBEF0); }
    /** @rva 0x15BBEC0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("DownSpeedUnitStateBase.get_GiveVisualEffectName", 0x15BBEC0); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownSpeedUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownSpeedUnitStateBase..ctor", 0x15B5240); }
    /** @rva -1 slot 33  public abstract Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue); */
    abstract GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal;
    /** @rva 0x15BBBD0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownSpeedUnitStateBase.GetUnitFilterFuncOrder", 0x15BBBD0); }
    /** @rva -1 slot 34  public abstract Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue); */
    abstract GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal;
    /** @rva 0x15BBB70 slot 32  public bool CanAddTo(BattleUnitData targetUnit) { } */
    CanAddTo$BattleUnitData(targetUnit: any /* BattleUnitData */): boolean { return notPorted("DownSpeedUnitStateBase.CanAddTo", 0x15BBB70); }
}
