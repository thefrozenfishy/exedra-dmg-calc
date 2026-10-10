// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float, int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IAccum } from "./IAccum";
import type { IBlendable } from "./IBlendable";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import type { UnitStateBase } from "./UnitStateBase";
import { UpDefenseUnitStateBase } from "./UpDefenseUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpDefAccumRatioUnitState  (TypeDefIndex 772, public class) ----
export class UpDefAccumRatioUnitState extends UpDefenseUnitStateBase {  // implements IAccum, IBlendable, IHasUpdateableEffectValue, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IAccum', 'IBlendable', 'IHasUpdateableEffectValue', 'IStateIconNumberDisplayable'];
    /** 0x90 private int <AccumCountMax>k__BackingField */
    _AccumCountMax: int = 0;
    /** 0x94 private int <AccumCount>k__BackingField */
    _AccumCount: int = 0;
    get UpRatio(): float { return this.get_UpRatio(); }
    get AccumCountMax(): int { return this.get_AccumCountMax(); }
    set AccumCountMax(v: int) { this.set_AccumCountMax(v); }
    get AccumCount(): int { return this.get_AccumCount(); }
    set AccumCount(v: int) { this.set_AccumCount(v); }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("UpDefAccumRatioUnitState.get_UpRatio", 0x15BBF20); }
    /** @rva 0x902980 slot 31  public int get_AccumCountMax() { } */
    get_AccumCountMax(): int { return this._AccumCountMax; /* auto-property */ }
    /** @rva 0x9029B0 slot 32  public void set_AccumCountMax(int value) { } */
    set_AccumCountMax(value: int): void { this._AccumCountMax = value; /* auto-property */ }
    /** @rva 0x902970 slot 33  public int get_AccumCount() { } */
    get_AccumCount(): int { return this._AccumCount; /* auto-property */ }
    /** @rva 0x9029A0 slot 34  public void set_AccumCount(int value) { } */
    set_AccumCount(value: int): void { this._AccumCount = value; /* auto-property */ }
    /** @rva 0x16E0870  protected void .ctor() { } */
    ctor(): this { return notPorted("UpDefAccumRatioUnitState..ctor", 0x16E0870); }
    /** @rva 0x16E0810  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpDefAccumRatioUnitState..ctor", 0x16E0810); }
    /** @rva 0x16E2C30 slot 30  public override Decimal GetDefVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetDefVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpDefAccumRatioUnitState.GetDefVariationValue", 0x16E2C30); }
    /** @rva 0x16E2BE0 slot 38  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean { return notPorted("UpDefAccumRatioUnitState.Blend", 0x16E2BE0); }
}
