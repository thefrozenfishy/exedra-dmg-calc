// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IMstIdDetailMstDicHolder } from "./IBattleMstReader";
import { SkillDetailMstModel } from "../Model/SkillDetailMstModel";
import { isImpl, notPorted } from "../../runtime";
import type { List, int } from "../../runtime";

import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { SkillDetailMstRecord } from "../../Network/Definition/Skill/SkillDetailMstRecord";

// ---- ReDriveBattleCore.Reader.SkillDetailMstReader  (TypeDefIndex 867, public class) ----
export class SkillDetailMstReader extends BattleMstReaderBase<SkillDetailMstModel, SkillDetailMstRecord, int> {
    /** @rva 0x1701E90  public static List<SkillDetailMstModel> GetDetailModelsByMstId(int id) { } */
    static GetDetailModelsByMstId(id: int): List<SkillDetailMstModel> {
        const reader = BattleMstReaderBase.get_Instance<SkillDetailMstModel, SkillDetailMstRecord, int>(SkillDetailMstModel);
        if (isImpl(reader, "IMstIdDetailMstDicHolder")) {
            const dic = (reader as unknown as IMstIdDetailMstDicHolder<SkillDetailMstModel, SkillDetailMstRecord>).GetMstIdDetailModelsDic();
            const list = dic.get(id);
            if (list !== undefined) return list; // TryGetValue
            return [];
        }
        return [...BattleMstReaderBase.get_Instance<SkillDetailMstModel, SkillDetailMstRecord, int>(SkillDetailMstModel)
            .GetModelList(m => m.skillMstId === id)]; // <GetDetailModelsByMstId>b__0 (record 0x14)
    }
    /** @rva 0x1702120  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
