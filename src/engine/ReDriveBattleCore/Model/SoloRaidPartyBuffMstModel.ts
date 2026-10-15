// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { SoloRaidPartyBuffMstRecord } from "../../Network/Definition/SoloRaid/SoloRaidPartyBuffMstRecord";

// ---- ReDriveBattleCore.Model.SoloRaidPartyBuffMstModel  (TypeDefIndex 896, public class) ----
export class SoloRaidPartyBuffMstModel extends MstModelBase<SoloRaidPartyBuffMstRecord> {
    get SoloRaidPartyBuffMstId(): int { return this.get_SoloRaidPartyBuffMstId(); }
    get GroupId(): int { return this.get_GroupId(); }
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get BuffPointChargePassiveSkillMstId(): int { return this.get_BuffPointChargePassiveSkillMstId(); }
    /** @rva 0x17022C0  public void .ctor(SoloRaidPartyBuffMstRecord record) { } */
    ctor$SoloRaidPartyBuffMstRecord(record: SoloRaidPartyBuffMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901380  public int get_SoloRaidPartyBuffMstId() { } */
    get_SoloRaidPartyBuffMstId(): int { return this.record.soloRaidPartyBuffMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x9013A0  public int get_GroupId() { } */
    get_GroupId(): int { return this.record.groupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x9013C0  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return this.record.passiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x901360  public int get_BuffPointChargePassiveSkillMstId() { } */
    get_BuffPointChargePassiveSkillMstId(): int { return this.record.buffPointChargePassiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
}
