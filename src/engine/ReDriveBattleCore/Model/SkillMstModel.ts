// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { MstModelBase } from "./MstModelBase";
import type { SkillMstRecord } from "../../Network/Definition/Skill/SkillMstRecord";

// ---- ReDriveBattleCore.Model.SkillMstModel  (TypeDefIndex 895, public class) ----
export class SkillMstModel extends MstModelBase<SkillMstRecord> {  // implements IEnhanceSkill
    static readonly __interfaces: readonly string[] = ['IEnhanceSkill'];
    get SkillMstId(): int { return this.get_SkillMstId(); }
    get SkillUniqueId(): int { return this.get_SkillUniqueId(); }
    get Name(): string { return this.get_Name(); }
    get Type(): SkillType { return this.get_Type(); }
    get Level(): int { return this.get_Level(); }
    get SP(): int { return this.get_SP(); }
    get HitEffectResourceName(): string { return this.get_HitEffectResourceName(); }
    get Description(): string { return this.get_Description(); }
    get BalloonText(): string { return this.get_BalloonText(); }
    get IconName(): string { return this.get_IconName(); }
    get DirectionName(): string { return this.get_DirectionName(); }
    get CueSheetName(): string { return this.get_CueSheetName(); }
    get CueName(): string { return this.get_CueName(); }
    get IsEmphasize(): boolean { return this.get_IsEmphasize(); }
    get SkillButtonIcon(): string { return this.get_SkillButtonIcon(); }
    get IsActiveSkill(): boolean { return this.get_IsActiveSkill(); }
    get IsSpecialAttack(): boolean { return this.get_IsSpecialAttack(); }
    get AdditionalCueName(): string { return this.get_AdditionalCueName(); }
    /** @rva 0x16EBE30  public void .ctor(SkillMstRecord record) { } */
    ctor$SkillMstRecord(record: SkillMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x902330  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this.record.skillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x902350  public int get_SkillUniqueId() { } */
    get_SkillUniqueId(): int { return this.record.skillUniqueId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902E70 slot 4  public string get_Name() { } */
    get_Name(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x902EB0  public SkillType get_Type() { } */
    get_Type(): SkillType { return this.record.type as SkillType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901955; mov eax, dword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x902370  public int get_Level() { } */
    get_Level(): int { return this.record.level; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902EF0  public int get_SP() { } */
    get_SP(): int { return this.record.sp; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e825; mov eax, dword ptr [rax + 0x34]; add rsp, 0x28; ret */ }
    /** @rva 0xA04FE0  public string get_HitEffectResourceName() { } */
    get_HitEffectResourceName(): string { return this.record.hitEffectResourceName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901766; mov rax, qword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
    /** @rva 0x902F80 slot 5  public string get_Description() { } */
    get_Description(): string { return this.record.description; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x116ec46; mov rax, qword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x16DF670  public string get_BalloonText() { } */
    get_BalloonText(): string { return this.record.balloonText; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbec6; mov rax, qword ptr [rax + 0x40]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9C00  public string get_IconName() { } */
    get_IconName(): string { return this.record.iconName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9c16; mov rax, qword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0x16EBB20  public string get_DirectionName() { } */
    get_DirectionName(): string { return this.record.directionName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d7f86; mov rax, qword ptr [rax + 0x50]; add rsp, 0x28; ret */ }
    /** @rva 0x16EBEA0  public string get_CueSheetName() { } */
    get_CueSheetName(): string { return this.record.cueSheetName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8326; mov rax, qword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x16E6DD0  public string get_CueName() { } */
    get_CueName(): string { return this.record.cueName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d3226; mov rax, qword ptr [rax + 0x60]; add rsp, 0x28; ret */ }
    /** @rva 0x16EBEE0  public bool get_IsEmphasize() { } */
    get_IsEmphasize(): boolean { return this.record.isEmphasize; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8366; movzx eax, byte ptr [rax + 0x68]; add rsp, 0x28; ret */ }
    /** @rva 0x16EBF20  public string get_SkillButtonIcon() { } */
    get_SkillButtonIcon(): string { return this.record.skillButtonIcon; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d83a6; mov rax, qword ptr [rax + 0x78]; add rsp, 0x28; ret */ }
    /** @rva 0x16EBEC0  public bool get_IsActiveSkill() { } */
    get_IsActiveSkill(): boolean { return this.record.type === 1; }
    /** @rva 0x16EBF00  public bool get_IsSpecialAttack() { } */
    get_IsSpecialAttack(): boolean { return this.record.type === 2; }
    /** @rva 0x16EBE80  public string get_AdditionalCueName() { } */
    get_AdditionalCueName(): string { return this.record.additionalCueName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8306; mov rax, qword ptr [rax + 0x70]; add rsp, 0x28; ret */ }
}
