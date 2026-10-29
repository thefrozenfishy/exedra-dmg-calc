// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { UniqueStatePatternMstModel } from "../Model/UniqueStatePatternMstModel";
import type { UniqueStatePatternMstRecord } from "../../Network/Definition/Skill/UniqueStatePatternMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.UniqueStatePatternMstReader  (TypeDefIndex 848, public class) ----
export class UniqueStatePatternMstReader extends BattleMstReaderBase<UniqueStatePatternMstModel, UniqueStatePatternMstRecord, int> {
    /** @rva 0x16F2E10  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
