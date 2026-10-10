// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { BreakPointDamageVariationUnitStateBase_CalculationType } from "./BreakPointDamageVariationUnitStateBase";
import { BreakPointDamageWorseUnitStateBase } from "./BreakPointDamageWorseUnitStateBase";
import type { IGiveBreakPointDamageVariation } from "./IGiveBreakPointDamageVariation";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";

// ---- ReDriveBattleCore.UnitState.DwnGivBreakPointDmgFixedUnitState  (TypeDefIndex 549, public class) ----
export class DwnGivBreakPointDmgFixedUnitState extends BreakPointDamageWorseUnitStateBase {  // implements IGiveBreakPointDamageVariation, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IGiveBreakPointDamageVariation', 'IRequiredStateForDecide'];
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0x15BD5E0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DwnGivBreakPointDmgFixedUnitState.get_IconName", 0x15BD5E0); }
    /** @rva 0x759B30 slot 27  public override BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return 1 as BreakPointDamageVariationUnitStateBase_CalculationType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0xC646A0  public float get_DownFixed() { } */
    get_DownFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnGivBreakPointDmgFixedUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnGivBreakPointDmgFixedUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BD2F0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DwnGivBreakPointDmgFixedUnitState.GetUnitFilterFuncOrder", 0x15BD2F0); }
}
