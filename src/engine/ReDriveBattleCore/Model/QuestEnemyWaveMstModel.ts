// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { LinkHpType } from "../../Network/Definition/QuestOutGame/LinkHpType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.QuestEnemyWaveMstModel  (TypeDefIndex 891, public class) ----
export class QuestEnemyWaveMstModel extends MstModelBase<any /* QuestEnemyWaveMstRecord */> {
    get QuestEnemyWaveMstId(): int { return this.get_QuestEnemyWaveMstId(); }
    get QuestStageMstId(): int { return this.get_QuestStageMstId(); }
    get Wave(): int { return this.get_Wave(); }
    get LinkHpType(): LinkHpType { return this.get_LinkHpType(); }
    get LinkHpName(): string { return this.get_LinkHpName(); }
    get StagePrefabName(): string { return this.get_StagePrefabName(); }
    get DioramaBackGroundMstId(): int { return this.get_DioramaBackGroundMstId(); }
    get EnemyTipsText(): string { return this.get_EnemyTipsText(); }
    /** @rva 0x16D5790  public void .ctor(QuestEnemyWaveMstRecord record) { } */
    ctor$QuestEnemyWaveMstRecord(record: any /* QuestEnemyWaveMstRecord */): this { return notPorted("QuestEnemyWaveMstModel..ctor", 0x16D5790); }
    /** @rva 0x901770  public int get_QuestEnemyWaveMstId() { } */
    get_QuestEnemyWaveMstId(): int { return notPorted("QuestEnemyWaveMstModel.get_QuestEnemyWaveMstId", 0x901770); }
    /** @rva 0x901790  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return notPorted("QuestEnemyWaveMstModel.get_QuestStageMstId", 0x901790); }
    /** @rva 0x902C70  public int get_Wave() { } */
    get_Wave(): int { return notPorted("QuestEnemyWaveMstModel.get_Wave", 0x902C70); }
    /** @rva 0x902C50  public LinkHpType get_LinkHpType() { } */
    get_LinkHpType(): LinkHpType { return notPorted("QuestEnemyWaveMstModel.get_LinkHpType", 0x902C50); }
    /** @rva 0x9017E0  public string get_LinkHpName() { } */
    get_LinkHpName(): string { return notPorted("QuestEnemyWaveMstModel.get_LinkHpName", 0x9017E0); }
    /** @rva 0x116EC30  public string get_StagePrefabName() { } */
    get_StagePrefabName(): string { return notPorted("QuestEnemyWaveMstModel.get_StagePrefabName", 0x116EC30); }
    /** @rva 0x901940  public int get_DioramaBackGroundMstId() { } */
    get_DioramaBackGroundMstId(): int { return notPorted("QuestEnemyWaveMstModel.get_DioramaBackGroundMstId", 0x901940); }
    /** @rva 0x901750  public string get_EnemyTipsText() { } */
    get_EnemyTipsText(): string { return notPorted("QuestEnemyWaveMstModel.get_EnemyTipsText", 0x901750); }
}
