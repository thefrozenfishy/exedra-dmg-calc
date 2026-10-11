// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { DamageVariationUnitStateBase_CalculationType } from "./DamageVariationUnitStateBase";
import { DownAimReceiveDamageUnitStateBase } from "./DownAimReceiveDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DwnAimRcvDmgRatioUnitState  (TypeDefIndex 531, public class) ----
export class DwnAimRcvDmgRatioUnitState extends DownAimReceiveDamageUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x7431D0 slot 27  public override DamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): DamageVariationUnitStateBase_CalculationType { return 0 as DamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15BBF20  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
}
