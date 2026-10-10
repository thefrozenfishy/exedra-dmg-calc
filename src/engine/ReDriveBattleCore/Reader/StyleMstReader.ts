// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { StyleMstModel } from "../Model/StyleMstModel";
import type { StyleMstRecord } from "../../Network/Definition/Style/StyleMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.StyleMstReader  (TypeDefIndex 869, public class) ----
export class StyleMstReader extends BattleMstReaderBase<StyleMstModel, StyleMstRecord, int> {
    /** @rva 0x16D8BF0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
