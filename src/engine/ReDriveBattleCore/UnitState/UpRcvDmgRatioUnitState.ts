// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AdditionType } from "./AdditionType";
import type { DamageVariationUnitStateBase_CalculationType } from "./DamageVariationUnitStateBase";
import { UpReceiveDamageUnitStateBase } from "./UpReceiveDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpRcvDmgRatioUnitState  (TypeDefIndex 573, public class) ----
export class UpRcvDmgRatioUnitState extends UpReceiveDamageUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x7431D0 slot 27  public override DamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): DamageVariationUnitStateBase_CalculationType { return 0 as DamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15CBE70  public float get_UpRatio() { } */
    get_UpRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x15C4400  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C5BB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
}
