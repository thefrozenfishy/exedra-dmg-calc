// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { PassiveSkillMstModel } from "../Model/PassiveSkillMstModel";
import type { PassiveSkillMstRecord } from "../../Network/Definition/Skill/PassiveSkillMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.PassiveSkillMstReader  (TypeDefIndex 856, public class) ----
export class PassiveSkillMstReader extends BattleMstReaderBase<PassiveSkillMstModel, PassiveSkillMstRecord, int> {
    /** @rva 0x16E73C0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
