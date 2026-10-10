// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { SkillDetailMstRecord } from "../../Network/Definition/Skill/SkillDetailMstRecord";

// ---- ReDriveBattleCore.Model.SkillDetailMstModel  (TypeDefIndex 894, public class) ----
export class SkillDetailMstModel extends MstModelBase<SkillDetailMstRecord> {
    get SkillDetailMstId(): int { return this.get_SkillDetailMstId(); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    get AbilityEffectType(): string { return this.get_AbilityEffectType(); }
    get Element(): int { return this.get_Element(); }
    get Turn(): int { return this.get_Turn(); }
    get RemainCount(): int { return this.get_RemainCount(); }
    get Range(): int { return this.get_Range(); }
    get Probability(): int { return this.get_Probability(); }
    get IsFixedProbability(): boolean { return this.get_IsFixedProbability(); }
    get Value1(): int { return this.get_Value1(); }
    get Value2(): int { return this.get_Value2(); }
    get Value3(): int { return this.get_Value3(); }
    get Value4(): int { return this.get_Value4(); }
    get Value5(): int { return this.get_Value5(); }
    get Description(): string { return this.get_Description(); }
    get DescriptionType(): int { return this.get_DescriptionType(); }
    get Role(): int { return this.get_Role(); }
    get StartConditionSetIdCsv(): string { return this.get_StartConditionSetIdCsv(); }
    get ActiveConditionSetIdCsv(): string { return this.get_ActiveConditionSetIdCsv(); }
    /** @rva 0x16D7F20  public void .ctor(SkillDetailMstRecord record) { } */
    ctor$SkillDetailMstRecord(record: SkillDetailMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901770  public int get_SkillDetailMstId() { } */
    get_SkillDetailMstId(): int { return this.record.skillDetailMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this.record.skillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_AbilityEffectType() { } */
    get_AbilityEffectType(): string { return this.record.abilityEffectType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E810  public int get_Element() { } */
    get_Element(): int { return this.record.element; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e825; mov eax, dword ptr [rax + 0x34]; add rsp, 0x28; ret */ }
    /** @rva 0x16CBED0  public int get_Turn() { } */
    get_Turn(): int { return this.record.turn; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbee5; mov eax, dword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
    /** @rva 0x16D31F0  public int get_RemainCount() { } */
    get_RemainCount(): int { return this.record.remainCount; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d3205; mov eax, dword ptr [rax + 0x3c]; add rsp, 0x28; ret */ }
    /** @rva 0x16D7FB0  public int get_Range() { } */
    get_Range(): int { return this.record.range; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d7fc5; mov eax, dword ptr [rax + 0x44]; add rsp, 0x28; ret */ }
    /** @rva 0x9019A0  public int get_Probability() { } */
    get_Probability(): int { return this.record.probability; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9019b5; mov eax, dword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0x16D7F90  public bool get_IsFixedProbability() { } */
    get_IsFixedProbability(): boolean { return this.record.isFixedProbability; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d7fa6; movzx eax, byte ptr [rax + 0x4c]; add rsp, 0x28; ret */ }
    /** @rva 0xA0D840  public int get_Value1() { } */
    get_Value1(): int { return this.record.value1; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E7D0  public int get_Value2() { } */
    get_Value2(): int { return this.record.value2; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E790  public int get_Value3() { } */
    get_Value3(): int { return this.record.value3; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E7B0  public int get_Value4() { } */
    get_Value4(): int { return this.record.value4; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7c5; mov eax, dword ptr [rax + 0x2c]; add rsp, 0x28; ret */ }
    /** @rva 0x901940  public int get_Value5() { } */
    get_Value5(): int { return this.record.value5; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901955; mov eax, dword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x16D7F70  public string get_Description() { } */
    get_Description(): string { return this.record.description; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d7f86; mov rax, qword ptr [rax + 0x50]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0B20  public int get_DescriptionType() { } */
    get_DescriptionType(): int { return this.record.descriptionType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b35; mov eax, dword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x901960  public int get_Role() { } */
    get_Role(): int { return this.record.role; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901975; mov eax, dword ptr [rax + 0x40]; add rsp, 0x28; ret */ }
    /** @rva 0x16D3210  public string get_StartConditionSetIdCsv() { } */
    get_StartConditionSetIdCsv(): string { return this.record.startConditionSetIdCsv; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d3226; mov rax, qword ptr [rax + 0x60]; add rsp, 0x28; ret */ }
    /** @rva 0x16D31D0  public string get_ActiveConditionSetIdCsv() { } */
    get_ActiveConditionSetIdCsv(): string { return this.record.activeConditionSetIdCsv; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d31e6; mov rax, qword ptr [rax + 0x68]; add rsp, 0x28; ret */ }
}
