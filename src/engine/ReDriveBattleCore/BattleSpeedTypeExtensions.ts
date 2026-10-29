// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { float } from "../runtime";
import type { BattleSpeedType } from "./BattleSpeedType";

// ---- ReDriveBattleCore.BattleSpeedTypeExtensions  (TypeDefIndex 346, public static class) ----
export class BattleSpeedTypeExtensions {
    /** @rva 0x1392BE0  public static float GetTimeScale(BattleSpeedType battleSpeedType) { } */
    static GetTimeScale(battleSpeedType: BattleSpeedType): float {
        if (battleSpeedType !== 0 && battleSpeedType === 1) return 2.0;
        return 1.0;
    }
    /** @rva 0x1392BD0  public static BattleSpeedType GetNextSpeedType(BattleSpeedType currentBattleSpeedType) { } */
    static GetNextSpeedType(currentBattleSpeedType: BattleSpeedType): BattleSpeedType {
        if (currentBattleSpeedType === 0) return 1 as BattleSpeedType;
        return 0 as BattleSpeedType;
    }
}
