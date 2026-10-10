// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { DamageVariationUnitStateBase } from "./DamageVariationUnitStateBase";
import type { IDebuff } from "./IDebuff";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.AimDamageWorseUnitStateBase  (TypeDefIndex 534, public abstract class) ----
export abstract class AimDamageWorseUnitStateBase extends DamageVariationUnitStateBase {  // implements IDebuff
    static readonly __interfaces: readonly string[] = ['IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15B5280 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("AimDamageWorseUnitStateBase.get_GiveVisualEffectName", 0x15B5280); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("AimDamageWorseUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("AimDamageWorseUnitStateBase..ctor", 0x15B5240); }
}
