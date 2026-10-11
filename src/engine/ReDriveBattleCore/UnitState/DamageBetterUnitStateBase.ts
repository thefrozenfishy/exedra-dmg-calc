// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DamageVariationUnitStateBase } from "./DamageVariationUnitStateBase";
import type { IBuff } from "./IBuff";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DamageBetterUnitStateBase  (TypeDefIndex 562, public abstract class) ----
export abstract class DamageBetterUnitStateBase extends DamageVariationUnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15B80F0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15B8090 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        // DamageBetterUnitStateBase.CanAddTo (0x15B8090)
        if (!targetUnit.IsMatch$TargetRoleType(this._TargetRole)) return false;
        return targetUnit.IsMatch$TargetElementType(this._TargetElement);
    }
}
