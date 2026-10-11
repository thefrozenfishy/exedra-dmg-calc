// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AdditionType } from "./AdditionType";
import type { DamageVariationUnitStateBase_CalculationType } from "./DamageVariationUnitStateBase";
import { DownReceiveDamageUnitStateBase } from "./DownReceiveDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DwnRcvDmgRatioUnitState  (TypeDefIndex 565, public class) ----
export class DwnRcvDmgRatioUnitState extends DownReceiveDamageUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x7431D0 slot 27  public override DamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): DamageVariationUnitStateBase_CalculationType { return 0 as DamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x759B30 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
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
