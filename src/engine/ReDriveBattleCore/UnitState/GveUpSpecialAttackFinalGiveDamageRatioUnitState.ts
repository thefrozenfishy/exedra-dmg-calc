// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import { DamageBetterUnitStateBase } from "./DamageBetterUnitStateBase";
import type { DamageVariationUnitStateBase_CalculationType } from "./DamageVariationUnitStateBase";

// ---- ReDriveBattleCore.UnitState.GveUpSpecialAttackFinalGiveDamageRatioUnitState  (TypeDefIndex 569, public class) ----
export class GveUpSpecialAttackFinalGiveDamageRatioUnitState extends DamageBetterUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x7431D0 slot 27  public override DamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): DamageVariationUnitStateBase_CalculationType { return 0 as DamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("GveUpSpecialAttackFinalGiveDamageRatioUnitState.get_UpRatio", 0x15BBF20); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("GveUpSpecialAttackFinalGiveDamageRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("GveUpSpecialAttackFinalGiveDamageRatioUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BF3A0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("GveUpSpecialAttackFinalGiveDamageRatioUnitState.GetUnitFilterFuncOrder", 0x15BF3A0); }
}
