// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
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
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16D6520  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ReflectionRatioUnitState..ctor", 0x16D6520); }
    /** @rva 0x16D62F0 slot 25  protected override Decimal GetDamageBase(BattleUnit userUnit) { } */
    GetDamageBase(userUnit: BattleUnit): Decimal { return notPorted("ReflectionRatioUnitState.GetDamageBase", 0x16D62F0); }
}
