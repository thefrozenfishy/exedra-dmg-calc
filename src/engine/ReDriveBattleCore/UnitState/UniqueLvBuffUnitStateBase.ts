// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { IBuff } from "./IBuff";
import { UniqueLvUnitStateBase } from "./UniqueLvUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueLvBuffUnitStateBase  (TypeDefIndex 670, public abstract class) ----
export abstract class UniqueLvBuffUnitStateBase extends UniqueLvUnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16DE3C0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("UniqueLvBuffUnitStateBase.get_GiveVisualEffectName", 0x16DE3C0); }
    /** @rva 0x16DE240  protected void .ctor() { } */
    ctor(): this { return notPorted("UniqueLvBuffUnitStateBase..ctor", 0x16DE240); }
    /** @rva 0x16DE260  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UniqueLvBuffUnitStateBase..ctor", 0x16DE260); }
}
