// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { PassiveSkillDetailMstModel } from "../Model/PassiveSkillDetailMstModel";

// base type BattleMstReaderBase<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord, int> is outside the ported set
// ---- ReDriveBattleCore.Reader.PassiveSkillDetailMstReader  (TypeDefIndex 855, public class) ----
export class PassiveSkillDetailMstReader {
    /** @rva 0x16D34E0  public static List<PassiveSkillDetailMstModel> GetDetailModelsByMstId(int id) { } */
    static GetDetailModelsByMstId(id: int): List<PassiveSkillDetailMstModel> { return notPorted("PassiveSkillDetailMstReader.GetDetailModelsByMstId", 0x16D34E0); }
    /** @rva 0x16D3730  public void .ctor() { } */
    ctor(): this { return notPorted("PassiveSkillDetailMstReader..ctor", 0x16D3730); }
}
