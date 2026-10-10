// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { QuestEnemyWaveMstModel } from "../Model/QuestEnemyWaveMstModel";
import type { QuestEnemyWaveMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemyWaveMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.QuestEnemyWaveMstReader  (TypeDefIndex 864, public class) ----
export class QuestEnemyWaveMstReader extends BattleMstReaderBase<QuestEnemyWaveMstModel, QuestEnemyWaveMstRecord, int> {
    /** @rva 0x16D57E0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
