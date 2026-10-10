// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, int } from "../../runtime";
import { RecoveryHpAbilityEffectBase } from "./RecoveryHpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";

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
    /** @rva 0x8A2200  public int get_RecoveryRatio() { } */
    get_RecoveryRatio(): int { return this._RecoveryRatio; /* auto-property */ }
    /** @rva 0x8A22D0  public void set_RecoveryRatio(int value) { } */
    set_RecoveryRatio(value: int): void { this._RecoveryRatio = value; /* auto-property */ }
    /** @rva 0x8A2220  public int get_RecoveryFixed() { } */
    get_RecoveryFixed(): int { return this._RecoveryFixed; /* auto-property */ }
    /** @rva 0x8A22F0  public void set_RecoveryFixed(int value) { } */
    set_RecoveryFixed(value: int): void { this._RecoveryFixed = value; /* auto-property */ }
    /** @rva 0x18FE570  protected void .ctor() { } */
    ctor(): this { return notPorted("RecoveryHpAbilityEffect..ctor", 0x18FE570); }
    /** @rva 0x18FE5C0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RecoveryHpAbilityEffect..ctor", 0x18FE5C0); }
    /** @rva 0x18FE3C0 slot 8  public override Decimal GetBaseRecoveryValue(BattleUnit userUnit) { } */
    GetBaseRecoveryValue(userUnit: BattleUnit): Decimal { return notPorted("RecoveryHpAbilityEffect.GetBaseRecoveryValue", 0x18FE3C0); }
}
