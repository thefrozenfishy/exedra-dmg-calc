// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DwnGivDmgRatioUnitState } from "./DwnGivDmgRatioUnitState";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";

// ---- ReDriveBattleCore.UnitState.DwnGivDmgConsumeRatioUnitState  (TypeDefIndex 576, public class) ----
export class DwnGivDmgConsumeRatioUnitState extends DwnGivDmgRatioUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x15BD990 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DwnGivDmgConsumeRatioUnitState.get_IconName", 0x15BD990); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnGivDmgConsumeRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnGivDmgConsumeRatioUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BD8B0 slot 29  public override Decimal GetDamageVariationValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("DwnGivDmgConsumeRatioUnitState.GetDamageVariationValue", 0x15BD8B0); }
}
