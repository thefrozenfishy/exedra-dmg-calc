// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IBuff } from "./IBuff";
import type { IEffectParryRateVariation } from "./IEffectParryRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpEffectParryRateUnitStateBase  (TypeDefIndex 778, public abstract class) ----
export abstract class UpEffectParryRateUnitStateBase extends ParameterVariationUnitStateBase {  // implements IEffectParryRateVariation, IBuff
    static readonly __interfaces: readonly string[] = ['IEffectParryRateVariation', 'IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16E3950 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpEffectParryRateUnitStateBase.get_IconName", 0x16E3950); }
    /** @rva 0x16E3920 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("UpEffectParryRateUnitStateBase.get_GiveVisualEffectName", 0x16E3920); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpEffectParryRateUnitStateBase..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpEffectParryRateUnitStateBase..ctor", 0x15BAC90); }
    /** @rva -1 slot 30  public abstract float GetEffectParryRateVariationValue(BattleUnit unit, float processingValue); */
    abstract GetEffectParryRateVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x16E36C0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpEffectParryRateUnitStateBase.GetUnitFilterFuncOrder", 0x16E36C0); }
}
