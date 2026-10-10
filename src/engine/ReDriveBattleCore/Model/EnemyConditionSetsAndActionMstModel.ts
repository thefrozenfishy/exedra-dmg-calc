// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.EnemyConditionSetsAndActionMstModel  (TypeDefIndex 881, public class) ----
export class EnemyConditionSetsAndActionMstModel extends MstModelBase<any /* EnemyConditionSetsAndActionMstRecord */> {
    get Id(): int { return this.get_Id(); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    get EnemyConditionSkillSetId(): int { return this.get_EnemyConditionSkillSetId(); }
    get ConditionSetMstIdCsv(): string { return this.get_ConditionSetMstIdCsv(); }
    get SkillMstIdCsv(): string { return this.get_SkillMstIdCsv(); }
    get IsSkillBundle(): boolean { return this.get_IsSkillBundle(); }
    get IsSkillReusable(): boolean { return this.get_IsSkillReusable(); }
    get Priority(): int { return this.get_Priority(); }
    /** @rva 0x16D09E0  public void .ctor(EnemyConditionSetsAndActionMstRecord record) { } */
    ctor$EnemyConditionSetsAndActionMstRecord(record: any /* EnemyConditionSetsAndActionMstRecord */): this { return notPorted("EnemyConditionSetsAndActionMstModel..ctor", 0x16D09E0); }
    /** @rva 0x901770  public int get_Id() { } */
    get_Id(): int { return notPorted("EnemyConditionSetsAndActionMstModel.get_Id", 0x901770); }
    /** @rva 0x901790  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return notPorted("EnemyConditionSetsAndActionMstModel.get_QuestEnemyAppearanceMstId", 0x901790); }
    /** @rva 0x902C70  public int get_EnemyConditionSkillSetId() { } */
    get_EnemyConditionSkillSetId(): int { return notPorted("EnemyConditionSetsAndActionMstModel.get_EnemyConditionSkillSetId", 0x902C70); }
    /** @rva 0x9017E0  public string get_ConditionSetMstIdCsv() { } */
    get_ConditionSetMstIdCsv(): string { return notPorted("EnemyConditionSetsAndActionMstModel.get_ConditionSetMstIdCsv", 0x9017E0); }
    /** @rva 0x116EC30  public string get_SkillMstIdCsv() { } */
    get_SkillMstIdCsv(): string { return notPorted("EnemyConditionSetsAndActionMstModel.get_SkillMstIdCsv", 0x116EC30); }
    /** @rva 0xCC05E0  public bool get_IsSkillBundle() { } */
    get_IsSkillBundle(): boolean { return notPorted("EnemyConditionSetsAndActionMstModel.get_IsSkillBundle", 0xCC05E0); }
    /** @rva 0x16D0A30  public bool get_IsSkillReusable() { } */
    get_IsSkillReusable(): boolean { return notPorted("EnemyConditionSetsAndActionMstModel.get_IsSkillReusable", 0x16D0A30); }
    /** @rva 0xA0E810  public int get_Priority() { } */
    get_Priority(): int { return notPorted("EnemyConditionSetsAndActionMstModel.get_Priority", 0xA0E810); }
}
