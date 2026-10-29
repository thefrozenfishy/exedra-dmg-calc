// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { QuestStageMstModel } from "../Model/QuestStageMstModel";
import type { QuestStageMstRecord } from "../../Network/Definition/QuestOutGame/QuestStageMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.QuestStageMstReader  (TypeDefIndex 865, public class) ----
export class QuestStageMstReader extends BattleMstReaderBase<QuestStageMstModel, QuestStageMstRecord, int> {
    /** @rva 0x16E97F0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
