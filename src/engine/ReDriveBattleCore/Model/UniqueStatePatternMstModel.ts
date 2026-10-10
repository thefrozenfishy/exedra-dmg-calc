// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { UniqueStatePatternMstRecord } from "../../Network/Definition/Skill/UniqueStatePatternMstRecord";

// ---- ReDriveBattleCore.Model.UniqueStatePatternMstModel  (TypeDefIndex 900, public class) ----
export class UniqueStatePatternMstModel extends MstModelBase<UniqueStatePatternMstRecord> {
    get UniqueStatePatternMstId(): int { return this.get_UniqueStatePatternMstId(); }
    get Name(): string { return this.get_Name(); }
    get StateFlipName(): string { return this.get_StateFlipName(); }
    get IconName(): string { return this.get_IconName(); }
    /** @rva 0x16DEC40  public void .ctor(UniqueStatePatternMstRecord record) { } */
    ctor$UniqueStatePatternMstRecord(record: UniqueStatePatternMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901770  public int get_UniqueStatePatternMstId() { } */
    get_UniqueStatePatternMstId(): int { return this.record.uniqueStatePatternMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_Name() { } */
    get_Name(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x9017E0  public string get_StateFlipName() { } */
    get_StateFlipName(): string { return this.record.stateFlipName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x116EC30  public string get_IconName() { } */
    get_IconName(): string { return this.record.iconName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x116ec46; mov rax, qword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
}
