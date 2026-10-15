// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { Decimal } from "../../runtime";
import { RecoveryHpAbilityEffectBase } from "./RecoveryHpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.RecoveryHpAbilityEffect  (TypeDefIndex 1198, public class) ----
export class RecoveryHpAbilityEffect extends RecoveryHpAbilityEffectBase {
    /** 0x60 private int <RecoveryRatio>k__BackingField */
    _RecoveryRatio: int = 0;
    /** 0x64 private int <RecoveryFixed>k__BackingField */
    _RecoveryFixed: int = 0;
    get RecoveryRatio(): int { return this.get_RecoveryRatio(); }
    set RecoveryRatio(v: int) { this.set_RecoveryRatio(v); }
    get RecoveryFixed(): int { return this.get_RecoveryFixed(); }
    set RecoveryFixed(v: int) { this.set_RecoveryFixed(v); }
    /** @rva 0x8A1200  public int get_RecoveryRatio() { } */
    get_RecoveryRatio(): int { return this._RecoveryRatio; /* auto-property */ }
    /** @rva 0x8A12D0  public void set_RecoveryRatio(int value) { } */
    set_RecoveryRatio(value: int): void { this._RecoveryRatio = value; /* auto-property */ }
    /** @rva 0x8A1220  public int get_RecoveryFixed() { } */
    get_RecoveryFixed(): int { return this._RecoveryFixed; /* auto-property */ }
    /** @rva 0x8A12F0  public void set_RecoveryFixed(int value) { } */
    set_RecoveryFixed(value: int): void { this._RecoveryFixed = value; /* auto-property */ }
    /** @rva 0x192CF10  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192CF60  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this._RecoveryRatio = info._EffectValue1;
        this._RecoveryFixed = info._EffectValue2;
        return this;
    }
    /** @rva 0x192CD60 slot 8  public override Decimal GetBaseRecoveryValue(BattleUnit userUnit) { } */
    GetBaseRecoveryValue(userUnit: BattleUnit): Decimal {
        const value = Decimal.fromInt(userUnit._MaxHP).mul(Decimal.fromInt(this._RecoveryRatio).div(Decimal.fromInt(1000))).add(Decimal.fromInt(this._RecoveryFixed));
        if (value.lt(Decimal.Zero)) return Decimal.Zero;
        return value;
    }
}
