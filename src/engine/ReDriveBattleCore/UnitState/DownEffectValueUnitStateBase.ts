// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { EffectValueVariationUnitStateBase } from "./EffectValueVariationUnitStateBase";
import type { IDebuff } from "./IDebuff";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DownEffectValueUnitStateBase  (TypeDefIndex 625, public abstract class) ----
export abstract class DownEffectValueUnitStateBase extends EffectValueVariationUnitStateBase {  // implements IDebuff
    static readonly __interfaces: readonly string[] = ['IDebuff'];
    /** 0x88 private float <DownRatio>k__BackingField */
    _DownRatio: float = 0;
    get DownRatio(): float { return this.get_DownRatio(); }
    set DownRatio(v: float) { this.set_DownRatio(v); }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16E2800 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_increase";
    }
    /** @rva 0xC6F3E0  public float get_DownRatio() { } */
    get_DownRatio(): float { return this._DownRatio; /* auto-property */ }
    /** @rva 0xC6F3F0  public void set_DownRatio(float value) { } */
    set_DownRatio(value: float): void { this._DownRatio = value; /* auto-property */ }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x16E27B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._DownRatio = f32(f32(info._EffectValue1) / 10);
        return this;
    }
}
