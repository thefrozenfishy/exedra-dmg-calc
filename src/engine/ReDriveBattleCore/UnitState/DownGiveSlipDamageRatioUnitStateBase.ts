// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownGiveSlipDamageUnitStateBase } from "./DownGiveSlipDamageUnitStateBase";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DownGiveSlipDamageRatioUnitStateBase  (TypeDefIndex 605, public abstract class) ----
export abstract class DownGiveSlipDamageRatioUnitStateBase extends DownGiveSlipDamageUnitStateBase {
    get DownRatio(): Decimal { return this.get_DownRatio(); }
    /** @rva 0x15BACD0  public Decimal get_DownRatio() { } */
    get_DownRatio(): Decimal { return notPorted("DownGiveSlipDamageRatioUnitStateBase.get_DownRatio", 0x15BACD0); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x15BAAB0 slot 32  public override Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("DownGiveSlipDamageRatioUnitStateBase.GetSlipDamageVariationValue", 0x15BAAB0); }
}
