// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IMstIdDetailMstDicHolder } from "./IBattleMstReader";
import { PassiveSkillDetailMstModel } from "../Model/PassiveSkillDetailMstModel";
import { isImpl, notPorted } from "../../runtime";
import type { List, int } from "../../runtime";

import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { PassiveSkillDetailMstRecord } from "../../Network/Definition/Skill/PassiveSkillDetailMstRecord";

// ---- ReDriveBattleCore.Reader.PassiveSkillDetailMstReader  (TypeDefIndex 855, public class) ----
export class PassiveSkillDetailMstReader extends BattleMstReaderBase<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord, int> {
    /** @rva 0x16E70A0  public static List<PassiveSkillDetailMstModel> GetDetailModelsByMstId(int id) { } */
    static GetDetailModelsByMstId(id: int): List<PassiveSkillDetailMstModel> {
        const reader = BattleMstReaderBase.get_Instance<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord, int>(PassiveSkillDetailMstModel);
        // 3.21.0: a holder whose dictionary is null also takes the fallback
        const dic = isImpl(reader, "IMstIdDetailMstDicHolder") ? (reader as unknown as IMstIdDetailMstDicHolder<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord>).GetMstIdDetailModelsDic() : null;
        if (dic != null) {
            const list = dic.get(id);
            if (list !== undefined) return list; // TryGetValue
            return [];
        }
        // Game quirk: this fallback compares record 0x10 (passiveSkillDetailMstId), not passiveSkillMstId. The client
        // repository is an IMstIdDetailMstDicHolder, so the branch above is the one that runs.
        return [...BattleMstReaderBase.get_Instance<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord, int>(PassiveSkillDetailMstModel)
            .GetModelList(m => m.passiveSkillDetailMstId === id)]; // <GetDetailModelsByMstId>b__0
    }
    /** @rva 0x16E7330  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
