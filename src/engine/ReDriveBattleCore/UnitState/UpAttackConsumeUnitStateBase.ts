// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";
import { UpAttackUnitStateBase } from "./UpAttackUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpAttackConsumeUnitStateBase  (TypeDefIndex 748, public abstract class) ----
export abstract class UpAttackConsumeUnitStateBase extends UpAttackUnitStateBase {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x1729B20 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_consume_up_atk";
    }
    /** @rva 0x1715C30  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15F8010  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x1729A60 slot 30  public override Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal {
        if (this._RemainCount < 1) return Decimal.Zero;
        return this.GetAtkVariationValueIfRemainCount(unit, processingValue); // vslot 36
    }
    /** @rva -1 slot 36  protected abstract Decimal GetAtkVariationValueIfRemainCount(BattleUnit unit, Decimal processingValue); */
    abstract GetAtkVariationValueIfRemainCount(unit: BattleUnit, processingValue: Decimal): Decimal;
}
