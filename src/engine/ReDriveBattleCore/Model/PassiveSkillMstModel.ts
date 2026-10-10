// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.PassiveSkillMstModel  (TypeDefIndex 886, public class) ----
export class PassiveSkillMstModel extends MstModelBase<any /* PassiveSkillMstRecord */> {  // implements IEnhanceSkill
    static readonly __interfaces: readonly string[] = ['IEnhanceSkill'];
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get SkillUniqueId(): int { return this.get_SkillUniqueId(); }
    get Name(): string { return this.get_Name(); }
    get Level(): int { return this.get_Level(); }
    get Description(): string { return this.get_Description(); }
    get ConditionElement(): TargetElementType { return this.get_ConditionElement(); }
    get ConditionRole(): TargetRoleType { return this.get_ConditionRole(); }
    get SkillButtonIcon(): string { return this.get_SkillButtonIcon(); }
    /** @rva 0x16D3770  public void .ctor(PassiveSkillMstRecord record) { } */
    ctor$PassiveSkillMstRecord(record: any /* PassiveSkillMstRecord */): this { return notPorted("PassiveSkillMstModel..ctor", 0x16D3770); }
    /** @rva 0x901770  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return notPorted("PassiveSkillMstModel.get_PassiveSkillMstId", 0x901770); }
    /** @rva 0x901790  public int get_SkillUniqueId() { } */
    get_SkillUniqueId(): int { return notPorted("PassiveSkillMstModel.get_SkillUniqueId", 0x901790); }
    /** @rva 0x9017E0 slot 4  public string get_Name() { } */
    get_Name(): string { return notPorted("PassiveSkillMstModel.get_Name", 0x9017E0); }
    /** @rva 0x902C70  public int get_Level() { } */
    get_Level(): int { return notPorted("PassiveSkillMstModel.get_Level", 0x902C70); }
    /** @rva 0x116EC30 slot 5  public string get_Description() { } */
    get_Description(): string { return notPorted("PassiveSkillMstModel.get_Description", 0x116EC30); }
    /** @rva 0x901940  public TargetElementType get_ConditionElement() { } */
    get_ConditionElement(): TargetElementType { return notPorted("PassiveSkillMstModel.get_ConditionElement", 0x901940); }
    /** @rva 0xA0E810  public TargetRoleType get_ConditionRole() { } */
    get_ConditionRole(): TargetRoleType { return notPorted("PassiveSkillMstModel.get_ConditionRole", 0xA0E810); }
    /** @rva 0x901750  public string get_SkillButtonIcon() { } */
    get_SkillButtonIcon(): string { return notPorted("PassiveSkillMstModel.get_SkillButtonIcon", 0x901750); }
}
