// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.BleedUnitStateBase  (TypeDefIndex 501, public abstract class) ----
export abstract class BleedUnitStateBase extends ReceiveSlipDamageUnitStateBase {
    /** @rva 0x15B6160 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "bleed";
    }
    /** @rva 0x15B6130 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_statehit_006";
    }
    /** @rva 0x15B6190 slot 33  public override string get_SlipDamageVisualEffectName() { } */
    get_SlipDamageVisualEffectName(): string {
        return "eff_cmn_act_state_lacerate_001";
    }
    /** @rva 0xDB7A40 slot 31  public override TargetElementType get_AttackElement() { } */
    get_AttackElement(): TargetElementType { return 6 as TargetElementType; /* asm: mov eax, 6; ret */ }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5F70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
}
