// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";
import { MstModelBase } from "./MstModelBase";
import type { PassiveSkillMstRecord } from "../../Network/Definition/Skill/PassiveSkillMstRecord";

// ---- ReDriveBattleCore.Model.PassiveSkillMstModel  (TypeDefIndex 886, public class) ----
export class PassiveSkillMstModel extends MstModelBase<PassiveSkillMstRecord> {  // implements IEnhanceSkill
    static readonly __interfaces: readonly string[] = ['IEnhanceSkill'];
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get SkillUniqueId(): int { return this.get_SkillUniqueId(); }
    get Name(): string { return this.get_Name(); }
    get Level(): int { return this.get_Level(); }
    get Description(): string { return this.get_Description(); }
    get ConditionElement(): TargetElementType { return this.get_ConditionElement(); }
    get ConditionRole(): TargetRoleType { return this.get_ConditionRole(); }
    get SkillButtonIcon(): string { return this.get_SkillButtonIcon(); }
    /** @rva 0x16E7370  public void .ctor(PassiveSkillMstRecord record) { } */
    ctor$PassiveSkillMstRecord(record: PassiveSkillMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x902330  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return this.record.passiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x902350  public int get_SkillUniqueId() { } */
    get_SkillUniqueId(): int { return this.record.skillUniqueId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902E70 slot 4  public string get_Name() { } */
    get_Name(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x902370  public int get_Level() { } */
    get_Level(): int { return this.record.level; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902F80 slot 5  public string get_Description() { } */
    get_Description(): string { return this.record.description; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x116ec46; mov rax, qword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x902EB0  public TargetElementType get_ConditionElement() { } */
    get_ConditionElement(): TargetElementType { return this.record.conditionElement as TargetElementType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901955; mov eax, dword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x902EF0  public TargetRoleType get_ConditionRole() { } */
    get_ConditionRole(): TargetRoleType { return this.record.conditionRole as TargetRoleType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e825; mov eax, dword ptr [rax + 0x34]; add rsp, 0x28; ret */ }
    /** @rva 0xA04FE0  public string get_SkillButtonIcon() { } */
    get_SkillButtonIcon(): string { return this.record.skillButtonIcon; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901766; mov rax, qword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
}
