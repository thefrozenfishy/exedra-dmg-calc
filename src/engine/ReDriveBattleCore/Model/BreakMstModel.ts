// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { BreakMstRecord } from "../../Network/Definition/QuestOutGame/BreakMstRecord";

// ---- ReDriveBattleCore.Model.BreakMstModel  (TypeDefIndex 879, public class) ----
export class BreakMstModel extends MstModelBase<BreakMstRecord> {
    get BreakMstId(): int { return this.get_BreakMstId(); }
    get BreakPoint(): int { return this.get_BreakPoint(); }
    get BreakPointRecoveryPerTurn(): int { return this.get_BreakPointRecoveryPerTurn(); }
    get BreakTurnGaugeSlowRatio(): int { return this.get_BreakTurnGaugeSlowRatio(); }
    get InitialBreakedDamageReceiveRate(): int { return this.get_InitialBreakedDamageReceiveRate(); }
    get MaxBreakedDamageReceiveRate(): int { return this.get_MaxBreakedDamageReceiveRate(); }
    get BreakedDamageReceiveRateIncreaseRate(): int { return this.get_BreakedDamageReceiveRateIncreaseRate(); }
    /** @rva 0x16CF080  public void .ctor(BreakMstRecord record) { } */
    ctor$BreakMstRecord(record: BreakMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901770  public int get_BreakMstId() { } */
    get_BreakMstId(): int { return this.record.breakMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_BreakPoint() { } */
    get_BreakPoint(): int { return this.record.breakPoint; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902C70  public int get_BreakPointRecoveryPerTurn() { } */
    get_BreakPointRecoveryPerTurn(): int { return this.record.breakPointRecoveryPerTurn; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902C50  public int get_BreakTurnGaugeSlowRatio() { } */
    get_BreakTurnGaugeSlowRatio(): int { return this.record.breakTurnGaugeSlowRatio; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0xA0D840  public int get_InitialBreakedDamageReceiveRate() { } */
    get_InitialBreakedDamageReceiveRate(): int { return this.record.initialBreakedDamageReceiveRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E7D0  public int get_MaxBreakedDamageReceiveRate() { } */
    get_MaxBreakedDamageReceiveRate(): int { return this.record.maxBreakedDamageReceiveRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E790  public int get_BreakedDamageReceiveRateIncreaseRate() { } */
    get_BreakedDamageReceiveRateIncreaseRate(): int { return this.record.breakedDamageReceiveRateIncreaseRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
}
