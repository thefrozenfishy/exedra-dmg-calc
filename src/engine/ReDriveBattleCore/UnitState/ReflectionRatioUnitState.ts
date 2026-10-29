// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UnitStateBase } from "./UnitStateBase";
import { Decimal, f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { ReflectionUnitStateBase } from "./ReflectionUnitStateBase";

// ---- ReDriveBattleCore.UnitState.ReflectionRatioUnitState  (TypeDefIndex 648, public class) ----
export class ReflectionRatioUnitState extends ReflectionUnitStateBase {
    /** 0x90 private float <ReflectionRatio>k__BackingField */
    _ReflectionRatio: float = 0;
    get ReflectionRatio(): float { return this.get_ReflectionRatio(); }
    set ReflectionRatio(v: float) { this.set_ReflectionRatio(v); }
    /** @rva 0x754560  public float get_ReflectionRatio() { } */
    get_ReflectionRatio(): float { return this._ReflectionRatio; /* auto-property */ }
    /** @rva 0x754810  public void set_ReflectionRatio(float value) { } */
    set_ReflectionRatio(value: float): void { this._ReflectionRatio = value; /* auto-property */ }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16EA0D0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        UnitStateBase.prototype.ctor$AbilityEffectInfo.call(this, info); // the game calls UnitStateBase..ctor directly
        this._DamageTarget = (info._EffectValue2 > 0 ? 1 : 0) as any;
        this._ReflectionRatio = f32(f32(info._EffectValue1) / 10);
        return this;
    }
    /** @rva 0x16E9EA0 slot 25  protected override Decimal GetDamageBase(BattleUnit userUnit) { } */
    GetDamageBase(userUnit: BattleUnit): Decimal {
        const barrierEndurance = userUnit._Condition._BarrierEndurance;
        const first = Decimal.fromFloat(this._ReflectionRatio).div(Decimal.fromInt(100)).mul(Decimal.fromInt(barrierEndurance));
        const second = Decimal.fromDouble(Math.pow(barrierEndurance / 124.0, 1.2)).add(Decimal.fromInt(12)).div(Decimal.fromInt(20));
        return first.mul(second);
    }
}
