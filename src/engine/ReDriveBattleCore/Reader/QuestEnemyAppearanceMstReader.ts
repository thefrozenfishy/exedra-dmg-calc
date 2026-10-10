// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { QuestEnemyAppearanceMstModel } from "../Model/QuestEnemyAppearanceMstModel";

// base type BattleMstReaderBase<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int> is outside the ported set
// ---- ReDriveBattleCore.Reader.QuestEnemyAppearanceMstReader  (TypeDefIndex 862, public class) ----
export class QuestEnemyAppearanceMstReader {
    /** @rva 0x16D51C0  public static List<QuestEnemyAppearanceMstModel> GetModelListForBattleStart(int questStageMstId, int wave) { } */
    static GetModelListForBattleStart(questStageMstId: int, wave: int): List<QuestEnemyAppearanceMstModel> { return notPorted("QuestEnemyAppearanceMstReader.GetModelListForBattleStart", 0x16D51C0); }
    /** @rva 0x16D5520  public void .ctor() { } */
    ctor(): this { return notPorted("QuestEnemyAppearanceMstReader..ctor", 0x16D5520); }
}
