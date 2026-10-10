// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";

// ---- ReDriveBattleCore.IBattleStartTriggerPriority  (TypeDefIndex 413, public interface) ----
export interface IBattleStartTriggerPriority {
    readonly Priority: int;
}

// ---- ReDriveBattleCore.IBattleStartTriggerPriority.Define  (TypeDefIndex 412, public static class) ----
export class IBattleStartTriggerPriority_Define {
    /** 0x0 public static readonly int DefaultPriority */
    static DefaultPriority: int = 0;
    /** 0x4 public static readonly int BarrierValueVariationUnitStatePriority */
    static BarrierValueVariationUnitStatePriority: int = 0;
    /** 0x8 public static readonly int EffectValueVariationUnitStatePriority */
    static EffectValueVariationUnitStatePriority: int = 0;
    /** 0xC public static readonly int AddTurnUnitStatePriority */
    static AddTurnUnitStatePriority: int = 0;
    /** @rva 0x1494C00  private static void .cctor() { } */
    static cctor(): void { return notPorted("IBattleStartTriggerPriority_Define..cctor", 0x1494C00); }
}
