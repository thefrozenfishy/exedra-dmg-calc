// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { QuestEnemyModeChangeMstModel } from "../Model/QuestEnemyModeChangeMstModel";
import type { QuestEnemyModeChangeMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemyModeChangeMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.QuestEnemyModeChangeMstReader  (TypeDefIndex 859, public class) ----
export class QuestEnemyModeChangeMstReader extends BattleMstReaderBase<QuestEnemyModeChangeMstModel, QuestEnemyModeChangeMstRecord, int> {
    /** @rva 0x16D56C0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
