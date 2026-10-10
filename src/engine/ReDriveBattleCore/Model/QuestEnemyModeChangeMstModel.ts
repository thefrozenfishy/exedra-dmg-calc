// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.QuestEnemyModeChangeMstModel  (TypeDefIndex 889, public class) ----
export class QuestEnemyModeChangeMstModel extends MstModelBase<any /* QuestEnemyModeChangeMstRecord */> {
    get QuestEnemyModeChangeMstId(): int { return this.get_QuestEnemyModeChangeMstId(); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    get Step(): int { return this.get_Step(); }
    get Type(): int { return this.get_Type(); }
    get ThresholdValue(): int { return this.get_ThresholdValue(); }
    /** @rva 0x16D5670  public void .ctor(QuestEnemyModeChangeMstRecord record) { } */
    ctor$QuestEnemyModeChangeMstRecord(record: any /* QuestEnemyModeChangeMstRecord */): this { return notPorted("QuestEnemyModeChangeMstModel..ctor", 0x16D5670); }
    /** @rva 0x901770  public int get_QuestEnemyModeChangeMstId() { } */
    get_QuestEnemyModeChangeMstId(): int { return notPorted("QuestEnemyModeChangeMstModel.get_QuestEnemyModeChangeMstId", 0x901770); }
    /** @rva 0x901790  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return notPorted("QuestEnemyModeChangeMstModel.get_QuestEnemyAppearanceMstId", 0x901790); }
    /** @rva 0x902C70  public int get_Step() { } */
    get_Step(): int { return notPorted("QuestEnemyModeChangeMstModel.get_Step", 0x902C70); }
    /** @rva 0x902C50  public int get_Type() { } */
    get_Type(): int { return notPorted("QuestEnemyModeChangeMstModel.get_Type", 0x902C50); }
    /** @rva 0xA0D840  public int get_ThresholdValue() { } */
    get_ThresholdValue(): int { return notPorted("QuestEnemyModeChangeMstModel.get_ThresholdValue", 0xA0D840); }
    /** @rva 0x16D5560  public static string GetModeChangeAssetName(int questEnemyAppearanceMstId, int step) { } */
    static GetModeChangeAssetName(questEnemyAppearanceMstId: int, step: int): string { return notPorted("QuestEnemyModeChangeMstModel.GetModeChangeAssetName", 0x16D5560); }
}
