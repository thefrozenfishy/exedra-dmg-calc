// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownAttackUnitStateBase } from "./DownAttackUnitStateBase";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";

// ---- ReDriveBattleCore.UnitState.DownAttackConsumeUnitStateBase  (TypeDefIndex 579, public abstract class) ----
export abstract class DownAttackConsumeUnitStateBase extends DownAttackUnitStateBase {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x15B8A30 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownAttackConsumeUnitStateBase.get_IconName", 0x15B8A30); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownAttackConsumeUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownAttackConsumeUnitStateBase..ctor", 0x15B5240); }
    /** @rva 0x15B8970 slot 30  public override Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("DownAttackConsumeUnitStateBase.GetAtkVariationValue", 0x15B8970); }
    /** @rva -1 slot 36  protected abstract Decimal GetAtkVariationValueIfRemainCount(BattleUnit unit, Decimal processingValue); */
    abstract GetAtkVariationValueIfRemainCount(unit: BattleUnit, processingValue: Decimal): Decimal;
}
