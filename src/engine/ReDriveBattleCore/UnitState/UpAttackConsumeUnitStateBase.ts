// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";
import { UpAttackUnitStateBase } from "./UpAttackUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpAttackConsumeUnitStateBase  (TypeDefIndex 748, public abstract class) ----
export abstract class UpAttackConsumeUnitStateBase extends UpAttackUnitStateBase {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x16E0D10 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpAttackConsumeUnitStateBase.get_IconName", 0x16E0D10); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpAttackConsumeUnitStateBase..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpAttackConsumeUnitStateBase..ctor", 0x15BAC90); }
    /** @rva 0x16E0C50 slot 30  public override Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpAttackConsumeUnitStateBase.GetAtkVariationValue", 0x16E0C50); }
    /** @rva -1 slot 36  protected abstract Decimal GetAtkVariationValueIfRemainCount(BattleUnit unit, Decimal processingValue); */
    abstract GetAtkVariationValueIfRemainCount(unit: BattleUnit, processingValue: Decimal): Decimal;
}
