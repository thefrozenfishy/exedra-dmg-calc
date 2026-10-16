// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";

// ---- ReDriveBattleCore.UnitState.ITurnEndTrigger  (TypeDefIndex 732, public interface) ----
export interface ITurnEndTrigger {
    /** @rva -1 slot 0  public abstract AffectedUnitNoticeBundle TriggeringAtTurnEnd(BattleUnit userUnit, GameDirectorBase gameDirector); */
    TriggeringAtTurnEnd(userUnit: BattleUnit, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle;
}
