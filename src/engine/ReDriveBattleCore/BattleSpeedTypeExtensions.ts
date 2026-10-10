// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { float } from "../runtime";
import type { BattleSpeedType } from "./BattleSpeedType";

// ---- ReDriveBattleCore.BattleSpeedTypeExtensions  (TypeDefIndex 346, public static class) ----
export class BattleSpeedTypeExtensions {
    /** @rva 0x1381830  public static float GetTimeScale(BattleSpeedType battleSpeedType) { } */
    static GetTimeScale(battleSpeedType: BattleSpeedType): float { return notPorted("BattleSpeedTypeExtensions.GetTimeScale", 0x1381830); }
    /** @rva 0x1381820  public static BattleSpeedType GetNextSpeedType(BattleSpeedType currentBattleSpeedType) { } */
    static GetNextSpeedType(currentBattleSpeedType: BattleSpeedType): BattleSpeedType { return notPorted("BattleSpeedTypeExtensions.GetNextSpeedType", 0x1381820); }
}
