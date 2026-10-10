// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { BattleConditionSetMstModel } from "../Model/BattleConditionSetMstModel";
import type { BattleConditionSetMstRecord } from "../../Network/Definition/QuestBattle/BattleConditionSetMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.BattleConditionSetMstReader  (TypeDefIndex 851, public class) ----
export class BattleConditionSetMstReader extends BattleMstReaderBase<BattleConditionSetMstModel, BattleConditionSetMstRecord, int> {
    /** @rva 0x16CC010  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
