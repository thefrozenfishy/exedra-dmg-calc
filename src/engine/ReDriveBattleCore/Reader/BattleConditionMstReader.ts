// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { BattleConditionMstModel } from "../Model/BattleConditionMstModel";
import type { BattleConditionMstRecord } from "../../Network/Definition/QuestBattle/BattleConditionMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.BattleConditionMstReader  (TypeDefIndex 850, public class) ----
export class BattleConditionMstReader extends BattleMstReaderBase<BattleConditionMstModel, BattleConditionMstRecord, int> {
    /** @rva 0x16DF720  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
