// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal, f32 } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { DriveUpBreakPointDamageUnitStateBase } from "./DriveUpBreakPointDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DriveUpBreakPointDmgRatioUnitState  (TypeDefIndex 640, public class) ----
export class DriveUpBreakPointDmgRatioUnitState extends DriveUpBreakPointDamageUnitStateBase {
    /** 0x90 protected float upRatio */
    upRatio: float = 0;
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x75A560  public float get_UpRatio() { } */
    get_UpRatio(): float { return this.upRatio; /* field 0x90 */ }
    /** @rva 0x1715C30  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x17173A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.upRatio = f32(f32(info._EffectValue2) / 10); // per-mille -> %
        return this;
    }
    /** @rva 0x17172A0 slot 28  protected override Decimal GetUpValue(Decimal damageValue) { } */
    GetUpValue(damageValue: Decimal): Decimal {
        return damageValue.mul(Decimal.fromFloat(this.upRatio).div(Decimal.fromInt(100))); // damageValue * ((decimal)upRatio / 100)
    }
}
