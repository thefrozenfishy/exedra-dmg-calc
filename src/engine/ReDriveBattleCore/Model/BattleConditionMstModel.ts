// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { CompareContent } from "../BattleCondition/CompareContent";
import type { CompareOperator } from "../BattleCondition/CompareOperator";
import type { CompareTarget } from "../BattleCondition/CompareTarget";
import { MstModelBase } from "./MstModelBase";
import type { BattleConditionMstRecord } from "../../Network/Definition/QuestBattle/BattleConditionMstRecord";

// ---- ReDriveBattleCore.Model.BattleConditionMstModel  (TypeDefIndex 877, public class) ----
export class BattleConditionMstModel extends MstModelBase<BattleConditionMstRecord> {
    get Id(): int { return this.get_Id(); }
    get Description(): string { return this.get_Description(); }
    get CompareTarget(): CompareTarget { return this.get_CompareTarget(); }
    get CompareContent(): CompareContent { return this.get_CompareContent(); }
    get CompareOperator(): CompareOperator { return this.get_CompareOperator(); }
    get CompareValue(): string { return this.get_CompareValue(); }
    /** @rva 0x16DF6D0  public void .ctor(BattleConditionMstRecord record) { } */
    ctor$BattleConditionMstRecord(record: BattleConditionMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x902330  public int get_Id() { } */
    get_Id(): int { return this.record.battleConditionMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_Description() { } */
    get_Description(): string { return this.record.description; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0xA04DB0  public CompareTarget get_CompareTarget() { } */
    get_CompareTarget(): CompareTarget { return this.record.compareTarget as CompareTarget; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA052D0  public CompareContent get_CompareContent() { } */
    get_CompareContent(): CompareContent { return this.record.compareContent as CompareContent; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0xA05290  public CompareOperator get_CompareOperator() { } */
    get_CompareOperator(): CompareOperator { return this.record.compareOperator as CompareOperator; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9BC0  public string get_CompareValue() { } */
    get_CompareValue(): string { return this.record.compareValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9bd6; mov rax, qword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
}
