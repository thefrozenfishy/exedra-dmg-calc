// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { CalculationPointPolicyType } from "../../Network/Definition/CalcPoint/CalculationPointPolicyType";
import { MstModelBase } from "./MstModelBase";
import type { CalculationPointPolicyMstRecord } from "../../Network/Definition/CalcPoint/CalculationPointPolicyMstRecord";

// ---- ReDriveBattleCore.Model.CalculationPointPolicyMstModel  (TypeDefIndex 880, public class) ----
export class CalculationPointPolicyMstModel extends MstModelBase<CalculationPointPolicyMstRecord> {
    get CalculationPointPolicyMstId(): int { return this.get_CalculationPointPolicyMstId(); }
    get PolicyType(): CalculationPointPolicyType { return this.get_PolicyType(); }
    get CoefficientName(): string { return this.get_CoefficientName(); }
    get ConditionValue(): int { return this.get_ConditionValue(); }
    get Value(): int { return this.get_Value(); }
    get StartTime(): any /* DateTimeOffset */ { return this.get_StartTime(); }
    /** @rva 0x16CF660  public void .ctor(CalculationPointPolicyMstRecord record) { } */
    ctor$CalculationPointPolicyMstRecord(record: CalculationPointPolicyMstRecord): this { return notPorted("CalculationPointPolicyMstModel..ctor", 0x16CF660); }
    /** @rva 0x901770  public int get_CalculationPointPolicyMstId() { } */
    get_CalculationPointPolicyMstId(): int { return this.record.calculationPointPolicyMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public CalculationPointPolicyType get_PolicyType() { } */
    get_PolicyType(): CalculationPointPolicyType { return this.record.policyType as CalculationPointPolicyType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_CoefficientName() { } */
    get_CoefficientName(): string { return this.record.coefficientName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0xA0D840  public int get_ConditionValue() { } */
    get_ConditionValue(): int { return this.record.conditionValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E790  public int get_Value() { } */
    get_Value(): int { return this.record.value; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x16CF6B0  public DateTimeOffset get_StartTime() { } */
    get_StartTime(): any /* DateTimeOffset */ { return notPorted("CalculationPointPolicyMstModel.get_StartTime", 0x16CF6B0); }
}
