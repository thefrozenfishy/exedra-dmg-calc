// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { BreakMstModel } from "../Model/BreakMstModel";
import type { BreakMstRecord } from "../../Network/Definition/QuestOutGame/BreakMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.BreakMstReader  (TypeDefIndex 870, public class) ----
export class BreakMstReader extends BattleMstReaderBase<BreakMstModel, BreakMstRecord, int> {
    /** @rva 0x16CF0D0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
