// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { EnemyConditionSetsAndActionMstRecord } from "../../Network/Definition/QuestBattle/EnemyConditionSetsAndActionMstRecord";

// ---- ReDriveBattleCore.Model.EnemyConditionSetsAndActionMstModel  (TypeDefIndex 881, public class) ----
export class EnemyConditionSetsAndActionMstModel extends MstModelBase<EnemyConditionSetsAndActionMstRecord> {
    get Id(): int { return this.get_Id(); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    get EnemyConditionSkillSetId(): int { return this.get_EnemyConditionSkillSetId(); }
    get ConditionSetMstIdCsv(): string { return this.get_ConditionSetMstIdCsv(); }
    get SkillMstIdCsv(): string { return this.get_SkillMstIdCsv(); }
    get IsSkillBundle(): boolean { return this.get_IsSkillBundle(); }
    get IsSkillReusable(): boolean { return this.get_IsSkillReusable(); }
    get Priority(): int { return this.get_Priority(); }
    /** @rva 0x16D09E0  public void .ctor(EnemyConditionSetsAndActionMstRecord record) { } */
    ctor$EnemyConditionSetsAndActionMstRecord(record: EnemyConditionSetsAndActionMstRecord): this { return notPorted("EnemyConditionSetsAndActionMstModel..ctor", 0x16D09E0); }
    /** @rva 0x901770  public int get_Id() { } */
    get_Id(): int { return this.record.enemyConditionSetsAndActionMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this.record.questEnemyAppearanceMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902C70  public int get_EnemyConditionSkillSetId() { } */
    get_EnemyConditionSkillSetId(): int { return this.record.enemyConditionSkillSetId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x9017E0  public string get_ConditionSetMstIdCsv() { } */
    get_ConditionSetMstIdCsv(): string { return this.record.conditionSetMstIdCsv; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x116EC30  public string get_SkillMstIdCsv() { } */
    get_SkillMstIdCsv(): string { return this.record.skillMstIdCsv; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x116ec46; mov rax, qword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0xCC05E0  public bool get_IsSkillBundle() { } */
    get_IsSkillBundle(): boolean { return this.record.isSkillBundle; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xcc05f6; movzx eax, byte ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0A30  public bool get_IsSkillReusable() { } */
    get_IsSkillReusable(): boolean { return this.record.isSkillReusable; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0a46; movzx eax, byte ptr [rax + 0x31]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E810  public int get_Priority() { } */
    get_Priority(): int { return this.record.priority; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e825; mov eax, dword ptr [rax + 0x34]; add rsp, 0x28; ret */ }
}
