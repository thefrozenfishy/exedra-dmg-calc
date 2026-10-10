// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.BurnUnitStateBase  (TypeDefIndex 498, public abstract class) ----
export abstract class BurnUnitStateBase extends ReceiveSlipDamageUnitStateBase {
    /** @rva 0x15B6340 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("BurnUnitStateBase.get_IconName", 0x15B6340); }
    /** @rva 0x15B6310 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("BurnUnitStateBase.get_GiveVisualEffectName", 0x15B6310); }
    /** @rva 0x15B6370 slot 33  public override string get_SlipDamageVisualEffectName() { } */
    get_SlipDamageVisualEffectName(): string { return notPorted("BurnUnitStateBase.get_SlipDamageVisualEffectName", 0x15B6370); }
    /** @rva 0x759B30 slot 31  public override TargetElementType get_AttackElement() { } */
    get_AttackElement(): TargetElementType { return 1 as TargetElementType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this { return notPorted("BurnUnitStateBase..ctor", 0x15B5FF0); }
    /** @rva 0x15B5F70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("BurnUnitStateBase..ctor", 0x15B5F70); }
}
