// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";
import { UpGivDmgRatioUnitState } from "./UpGivDmgRatioUnitState";

// ---- ReDriveBattleCore.UnitState.UpGivDmgConsumeRatioUnitState  (TypeDefIndex 568, public class) ----
export class UpGivDmgConsumeRatioUnitState extends UpGivDmgRatioUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x15D0D30 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpGivDmgConsumeRatioUnitState.get_IconName", 0x15D0D30); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("UpGivDmgConsumeRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpGivDmgConsumeRatioUnitState..ctor", 0x15B5240); }
    /** @rva 0x15D0C50 slot 29  public override Decimal GetDamageVariationValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("UpGivDmgConsumeRatioUnitState.GetDamageVariationValue", 0x15D0C50); }
}
