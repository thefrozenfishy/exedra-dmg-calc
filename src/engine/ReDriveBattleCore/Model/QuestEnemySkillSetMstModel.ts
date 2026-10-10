// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.QuestEnemySkillSetMstModel  (TypeDefIndex 890, public class) ----
export class QuestEnemySkillSetMstModel extends MstModelBase<any /* QuestEnemySkillSetMstRecord */> {
    get QuestEnemySkillSetMstId(): int { return this.get_QuestEnemySkillSetMstId(); }
    get EnemySkillSetId(): int { return this.get_EnemySkillSetId(); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    get WeightValue(): int { return this.get_WeightValue(); }
    get HpGaugeValue(): int { return this.get_HpGaugeValue(); }
    get IsDescriptionHidden(): boolean { return this.get_IsDescriptionHidden(); }
    /** @rva 0x16D5700  public void .ctor(QuestEnemySkillSetMstRecord record) { } */
    ctor$QuestEnemySkillSetMstRecord(record: any /* QuestEnemySkillSetMstRecord */): this { return notPorted("QuestEnemySkillSetMstModel..ctor", 0x16D5700); }
    /** @rva 0x901770  public int get_QuestEnemySkillSetMstId() { } */
    get_QuestEnemySkillSetMstId(): int { return notPorted("QuestEnemySkillSetMstModel.get_QuestEnemySkillSetMstId", 0x901770); }
    /** @rva 0x901790  public int get_EnemySkillSetId() { } */
    get_EnemySkillSetId(): int { return notPorted("QuestEnemySkillSetMstModel.get_EnemySkillSetId", 0x901790); }
    /** @rva 0x902C70  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return notPorted("QuestEnemySkillSetMstModel.get_SkillMstId", 0x902C70); }
    /** @rva 0x902C50  public int get_WeightValue() { } */
    get_WeightValue(): int { return notPorted("QuestEnemySkillSetMstModel.get_WeightValue", 0x902C50); }
    /** @rva 0xA0D840  public int get_HpGaugeValue() { } */
    get_HpGaugeValue(): int { return notPorted("QuestEnemySkillSetMstModel.get_HpGaugeValue", 0xA0D840); }
    /** @rva 0xA11CE0  public bool get_IsDescriptionHidden() { } */
    get_IsDescriptionHidden(): boolean { return notPorted("QuestEnemySkillSetMstModel.get_IsDescriptionHidden", 0xA11CE0); }
}
