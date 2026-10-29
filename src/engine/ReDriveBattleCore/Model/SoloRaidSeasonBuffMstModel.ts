// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { SoloRaidSeasonBuffMstRecord } from "../../Network/Definition/SoloRaid/SoloRaidSeasonBuffMstRecord";

// ---- ReDriveBattleCore.Model.SoloRaidSeasonBuffMstModel  (TypeDefIndex 897, public class) ----
export class SoloRaidSeasonBuffMstModel extends MstModelBase<SoloRaidSeasonBuffMstRecord> {
    get SoloRaidSeasonBuffMstId(): int { return this.get_SoloRaidSeasonBuffMstId(); }
    get GroupId(): int { return this.get_GroupId(); }
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get EnhancedPassiveSkillMstId(): int { return this.get_EnhancedPassiveSkillMstId(); }
    get MaxBuffPoint(): int { return this.get_MaxBuffPoint(); }
    get MaxBuffPointOnEnhanced(): int { return this.get_MaxBuffPointOnEnhanced(); }
    get BuffPointChargePassiveSkillMstId(): int { return this.get_BuffPointChargePassiveSkillMstId(); }
    get EnhancedSkillTurnGaugeValue(): int { return this.get_EnhancedSkillTurnGaugeValue(); }
    /** @rva 0x16EC020  public void .ctor(SoloRaidSeasonBuffMstRecord record) { } */
    ctor$SoloRaidSeasonBuffMstRecord(record: SoloRaidSeasonBuffMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x902330  public int get_SoloRaidSeasonBuffMstId() { } */
    get_SoloRaidSeasonBuffMstId(): int { return this.record.soloRaidSeasonBuffMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x902350  public int get_GroupId() { } */
    get_GroupId(): int { return this.record.groupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902370  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return this.record.passiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902310  public int get_EnhancedPassiveSkillMstId() { } */
    get_EnhancedPassiveSkillMstId(): int { return this.record.enhancedPassiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0xA04DB0  public int get_MaxBuffPoint() { } */
    get_MaxBuffPoint(): int { return this.record.maxBuffPoint; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA052D0  public int get_MaxBuffPointOnEnhanced() { } */
    get_MaxBuffPointOnEnhanced(): int { return this.record.maxBuffPointOnEnhanced; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0xA05290  public int get_BuffPointChargePassiveSkillMstId() { } */
    get_BuffPointChargePassiveSkillMstId(): int { return this.record.buffPointChargePassiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0xA052B0  public int get_EnhancedSkillTurnGaugeValue() { } */
    get_EnhancedSkillTurnGaugeValue(): int { return this.record.enhancedSkillTurnGaugeValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7c5; mov eax, dword ptr [rax + 0x2c]; add rsp, 0x28; ret */ }
}
