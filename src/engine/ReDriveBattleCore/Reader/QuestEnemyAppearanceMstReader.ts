// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { ModeChangeReferee } from "../ModeChangeReferee";
import { QuestEnemyAppearanceMstModel } from "../Model/QuestEnemyAppearanceMstModel";
import { indexHint, notPorted } from "../../runtime";
import type { List, int } from "../../runtime";

import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { QuestEnemyAppearanceMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";

// ---- ReDriveBattleCore.Reader.QuestEnemyAppearanceMstReader  (TypeDefIndex 862, public class) ----
export class QuestEnemyAppearanceMstReader extends BattleMstReaderBase<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int> {
    /** @rva 0x16D51C0  public static List<QuestEnemyAppearanceMstModel> GetModelListForBattleStart(int questStageMstId, int wave) { } */
    static GetModelListForBattleStart(questStageMstId: int, wave: int): List<QuestEnemyAppearanceMstModel> {
        const list = [...BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
            .GetModelList(indexHint(mst => mst.questStageMstId === questStageMstId && mst.wave === wave, "questStageMstId", questStageMstId))] // <GetModelListForBattleStart>b__0
            .filter(mst => mst.record.conditionType === 0)                                     // b__0_1
            .map((m, i) => ({ m, i })).sort((a, b) => a.m.record.questEnemyAppearanceMstId - b.m.record.questEnemyAppearanceMstId || a.i - b.i)
            .map(x => x.m);                                                                      // OrderBy(b__0_2), stable
        return [...QuestEnemyAppearanceMstModel.Sort(ModeChangeReferee.RemoveModeChangeFirstOther(list))];
    }
    /** @rva 0x16D5520  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
