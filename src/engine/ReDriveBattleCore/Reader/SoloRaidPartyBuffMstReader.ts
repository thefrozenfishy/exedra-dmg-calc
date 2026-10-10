// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { SoloRaidPartyBuffMstModel } from "../Model/SoloRaidPartyBuffMstModel";
import type { SoloRaidPartyBuffMstRecord } from "../../Network/Definition/SoloRaid/SoloRaidPartyBuffMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.SoloRaidPartyBuffMstReader  (TypeDefIndex 858, public class) ----
export class SoloRaidPartyBuffMstReader extends BattleMstReaderBase<SoloRaidPartyBuffMstModel, SoloRaidPartyBuffMstRecord, int> {
    /** @rva 0x16D8710  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
