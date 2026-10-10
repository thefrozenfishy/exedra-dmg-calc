// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { DamageVariationUnitStateBase_CalculationType } from "./DamageVariationUnitStateBase";
import { DownAimReceiveDamageUnitStateBase } from "./DownAimReceiveDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnAimRcvDmgFixedUnitState  (TypeDefIndex 532, public class) ----
export class DwnAimRcvDmgFixedUnitState extends DownAimReceiveDamageUnitStateBase {
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0x759B30 slot 27  public override DamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): DamageVariationUnitStateBase_CalculationType { return 1 as DamageVariationUnitStateBase_CalculationType; /* asm: mov eax, 1; ret */ }
    /** @rva 0xC646A0  public float get_DownFixed() { } */
    get_DownFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnAimRcvDmgFixedUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnAimRcvDmgFixedUnitState..ctor", 0x15B5240); }
}
