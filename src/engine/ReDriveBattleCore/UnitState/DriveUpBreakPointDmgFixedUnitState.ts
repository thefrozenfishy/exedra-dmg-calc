// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { DriveUpBreakPointDamageUnitStateBase } from "./DriveUpBreakPointDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DriveUpBreakPointDmgFixedUnitState  (TypeDefIndex 641, public class) ----
export class DriveUpBreakPointDmgFixedUnitState extends DriveUpBreakPointDamageUnitStateBase {
    /** 0x90 protected int upFixed */
    upFixed: int = 0;
    get UpFixed(): int { return this.get_UpFixed(); }
    /** @rva 0x907E00  public int get_UpFixed() { } */
    get_UpFixed(): int { return this.upFixed; /* field 0x90 */ }
    /** @rva 0x1715C30  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1717260  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.upFixed = info._EffectValue2;
        return this;
    }
    /** @rva 0x17171F0 slot 28  protected override Decimal GetUpValue(Decimal damageValue) { } */
    GetUpValue(damageValue: Decimal): Decimal {
        return Decimal.fromInt(this.upFixed); // (decimal)upFixed
    }
}
