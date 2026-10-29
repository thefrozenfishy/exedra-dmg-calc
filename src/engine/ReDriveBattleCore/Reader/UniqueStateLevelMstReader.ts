// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { UniqueStateLevelMstModel } from "../Model/UniqueStateLevelMstModel";
import type { UniqueStateLevelMstRecord } from "../../Network/Definition/Skill/UniqueStateLevelMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.UniqueStateLevelMstReader  (TypeDefIndex 849, public class) ----
export class UniqueStateLevelMstReader extends BattleMstReaderBase<UniqueStateLevelMstModel, UniqueStateLevelMstRecord, int> {
    /** @rva 0x16F2D80  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
