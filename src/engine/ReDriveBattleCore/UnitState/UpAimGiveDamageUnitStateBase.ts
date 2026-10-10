// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import { AimDamageBetterUnitStateBase } from "./AimDamageBetterUnitStateBase";
import type { IGiveDamageVariation } from "./IGiveDamageVariation";

// ---- ReDriveBattleCore.UnitState.UpAimGiveDamageUnitStateBase  (TypeDefIndex 530, public abstract class) ----
export abstract class UpAimGiveDamageUnitStateBase extends AimDamageBetterUnitStateBase {  // implements IGiveDamageVariation
    static readonly __interfaces: readonly string[] = ['IGiveDamageVariation'];
    /** @rva 0x15CF6D0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpAimGiveDamageUnitStateBase.get_IconName", 0x15CF6D0); }
    /** @rva 0x7431D0 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("UpAimGiveDamageUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpAimGiveDamageUnitStateBase..ctor", 0x15B5240); }
    /** @rva 0x15CF360 slot 29  public override Decimal GetDamageVariationValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("UpAimGiveDamageUnitStateBase.GetDamageVariationValue", 0x15CF360); }
    /** @rva 0x15CF470 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpAimGiveDamageUnitStateBase.GetUnitFilterFuncOrder", 0x15CF470); }
}
