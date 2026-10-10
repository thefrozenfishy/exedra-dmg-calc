// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.PoisonUnitStateBase  (TypeDefIndex 499, public abstract class) ----
export abstract class PoisonUnitStateBase extends ReceiveSlipDamageUnitStateBase {
    /** @rva 0x15BF550 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("PoisonUnitStateBase.get_IconName", 0x15BF550); }
    /** @rva 0x15BF520 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("PoisonUnitStateBase.get_GiveVisualEffectName", 0x15BF520); }
    /** @rva 0x15BF580 slot 33  public override string get_SlipDamageVisualEffectName() { } */
    get_SlipDamageVisualEffectName(): string { return notPorted("PoisonUnitStateBase.get_SlipDamageVisualEffectName", 0x15BF580); }
    /** @rva 0xD447A0 slot 31  public override TargetElementType get_AttackElement() { } */
    get_AttackElement(): TargetElementType { return 3 as TargetElementType; /* asm: mov eax, 3; ret */ }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this { return notPorted("PoisonUnitStateBase..ctor", 0x15B5FF0); }
    /** @rva 0x15B5F70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("PoisonUnitStateBase..ctor", 0x15B5F70); }
}
