// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import { UnitStateBase } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.ParameterVariationUnitStateBase  (TypeDefIndex 689, public abstract class) ----
export abstract class ParameterVariationUnitStateBase extends UnitStateBase {  // implements IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    get Addition(): AdditionType { return this.get_Addition(); }
    /** @rva 0xC6F3E0 slot 25  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC6F3F0 slot 26  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva -1 slot 27  public abstract AdditionType get_Addition(); */
    abstract get_Addition(): AdditionType;
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x15C8A00 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        // DamageBetterUnitStateBase.CanAddTo (0x15B8090)
        if (!targetUnit.IsMatch$TargetRoleType(this._TargetRole)) return false;
        return targetUnit.IsMatch$TargetElementType(this._TargetElement);
    }
}
