// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { SoloRaidSeasonBuffMstModel } from "../Model/SoloRaidSeasonBuffMstModel";
import type { SoloRaidSeasonBuffMstRecord } from "../../Network/Definition/SoloRaid/SoloRaidSeasonBuffMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.SoloRaidSeasonBuffMstReader  (TypeDefIndex 857, public class) ----
export class SoloRaidSeasonBuffMstReader extends BattleMstReaderBase<SoloRaidSeasonBuffMstModel, SoloRaidSeasonBuffMstRecord, int> {
    /** @rva 0x16EC070  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
