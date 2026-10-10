// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { SkillDetailMstModel } from "../Model/SkillDetailMstModel";

// base type BattleMstReaderBase<SkillDetailMstModel, SkillDetailMstRecord, int> is outside the ported set
// ---- ReDriveBattleCore.Reader.SkillDetailMstReader  (TypeDefIndex 867, public class) ----
export class SkillDetailMstReader {
    /** @rva 0x16D7FD0  public static List<SkillDetailMstModel> GetDetailModelsByMstId(int id) { } */
    static GetDetailModelsByMstId(id: int): List<SkillDetailMstModel> { return notPorted("SkillDetailMstReader.GetDetailModelsByMstId", 0x16D7FD0); }
    /** @rva 0x16D8260  public void .ctor() { } */
    ctor(): this { return notPorted("SkillDetailMstReader..ctor", 0x16D8260); }
}
