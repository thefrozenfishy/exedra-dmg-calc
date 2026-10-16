// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { UniqueStateLevelMstRecord } from "../../Network/Definition/Skill/UniqueStateLevelMstRecord";

// ---- ReDriveBattleCore.Model.UniqueStateLevelMstModel  (TypeDefIndex 899, public class) ----
export class UniqueStateLevelMstModel extends MstModelBase<UniqueStateLevelMstRecord> {
    get UniqueStateLevelMstId(): int { return this.get_UniqueStateLevelMstId(); }
    get GroupId(): int { return this.get_GroupId(); }
    get Level(): int { return this.get_Level(); }
    get ConditionCount(): int { return this.get_ConditionCount(); }
    /** @rva 0x1709060  public void .ctor(UniqueStateLevelMstRecord record) { } */
    ctor$UniqueStateLevelMstRecord(record: UniqueStateLevelMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901380  public int get_UniqueStateLevelMstId() { } */
    get_UniqueStateLevelMstId(): int { return this.record.uniqueStateLevelMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x9013A0  public int get_GroupId() { } */
    get_GroupId(): int { return this.record.groupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x9013C0  public int get_Level() { } */
    get_Level(): int { return this.record.level; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x901360  public int get_ConditionCount() { } */
    get_ConditionCount(): int { return this.record.conditionCount; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
}
