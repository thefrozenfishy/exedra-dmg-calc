// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { BattleConditionSetMstRecord } from "../../Network/Definition/QuestBattle/BattleConditionSetMstRecord";

// ---- ReDriveBattleCore.Model.BattleConditionSetMstModel  (TypeDefIndex 878, public class) ----
export class BattleConditionSetMstModel extends MstModelBase<BattleConditionSetMstRecord> {
    get Id(): int { return this.get_Id(); }
    get Description(): string { return this.get_Description(); }
    get BattleConditionMstIdCsv(): string { return this.get_BattleConditionMstIdCsv(); }
    /** @rva 0x16CBFC0  public void .ctor(BattleConditionSetMstRecord record) { } */
    ctor$BattleConditionSetMstRecord(record: BattleConditionSetMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901770  public int get_Id() { } */
    get_Id(): int { return this.record.battleConditionSetMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_Description() { } */
    get_Description(): string { return this.record.description; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x9017E0  public string get_BattleConditionMstIdCsv() { } */
    get_BattleConditionMstIdCsv(): string { return this.record.battleConditionMstIdCsv; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
}
