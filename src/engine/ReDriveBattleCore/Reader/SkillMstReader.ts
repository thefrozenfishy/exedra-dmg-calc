// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { SkillMstModel } from "../Model/SkillMstModel";
import type { SkillMstRecord } from "../../Network/Definition/Skill/SkillMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.SkillMstReader  (TypeDefIndex 868, public class) ----
export class SkillMstReader extends BattleMstReaderBase<SkillMstModel, SkillMstRecord, int> {
    /** @rva 0x16EBF40  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
