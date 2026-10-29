// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { EnemyConditionSetsAndActionMstModel } from "../Model/EnemyConditionSetsAndActionMstModel";
import type { EnemyConditionSetsAndActionMstRecord } from "../../Network/Definition/QuestBattle/EnemyConditionSetsAndActionMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.EnemyConditionSetsAndActionMstReader  (TypeDefIndex 852, public class) ----
export class EnemyConditionSetsAndActionMstReader extends BattleMstReaderBase<EnemyConditionSetsAndActionMstModel, EnemyConditionSetsAndActionMstRecord, int> {
    /** @rva 0x16E55B0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
