// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { EffectValueVariationUnitStateBase } from "./EffectValueVariationUnitStateBase";
import type { IBuff } from "./IBuff";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpEffectValueUnitStateBase  (TypeDefIndex 624, public abstract class) ----
export abstract class UpEffectValueUnitStateBase extends EffectValueVariationUnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** 0x88 private float <UpRatio>k__BackingField */
    _UpRatio: float = 0;
    get UpRatio(): float { return this.get_UpRatio(); }
    set UpRatio(v: float) { this.set_UpRatio(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15D0300 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpEffectValueUnitStateBase.get_IconName", 0x15D0300); }
    /** @rva 0xC646A0  public float get_UpRatio() { } */
    get_UpRatio(): float { return this._UpRatio; /* auto-property */ }
    /** @rva 0xC646B0  public void set_UpRatio(float value) { } */
    set_UpRatio(value: float): void { this._UpRatio = value; /* auto-property */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("UpEffectValueUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B9DC0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpEffectValueUnitStateBase..ctor", 0x15B9DC0); }
}
