// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.CurseUnitStateBase  (TypeDefIndex 500, public abstract class) ----
export abstract class CurseUnitStateBase extends ReceiveSlipDamageUnitStateBase {
    /** @rva 0x15C7E30 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "curse";
    }
    /** @rva 0x15C7E00 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_statehit_005";
    }
    /** @rva 0x15C7E60 slot 33  public override string get_SlipDamageVisualEffectName() { } */
    get_SlipDamageVisualEffectName(): string {
        return "eff_cmn_act_state_curse_001";
    }
    /** @rva 0x10410E0 slot 31  public override TargetElementType get_AttackElement() { } */
    get_AttackElement(): TargetElementType { return 5 as TargetElementType; /* asm: mov eax, 5; ret */ }
    /** @rva 0x15C6960  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C68E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
}
