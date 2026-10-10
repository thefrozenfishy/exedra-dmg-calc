// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { CalculationPointPolicyType } from "../../Network/Definition/CalcPoint/CalculationPointPolicyType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.CalculationPointPolicyMstModel  (TypeDefIndex 880, public class) ----
export class CalculationPointPolicyMstModel extends MstModelBase<any /* CalculationPointPolicyMstRecord */> {
    get CalculationPointPolicyMstId(): int { return this.get_CalculationPointPolicyMstId(); }
    get PolicyType(): CalculationPointPolicyType { return this.get_PolicyType(); }
    get CoefficientName(): string { return this.get_CoefficientName(); }
    get ConditionValue(): int { return this.get_ConditionValue(); }
    get Value(): int { return this.get_Value(); }
    get StartTime(): any /* DateTimeOffset */ { return this.get_StartTime(); }
    /** @rva 0x16CF660  public void .ctor(CalculationPointPolicyMstRecord record) { } */
    ctor$CalculationPointPolicyMstRecord(record: any /* CalculationPointPolicyMstRecord */): this { return notPorted("CalculationPointPolicyMstModel..ctor", 0x16CF660); }
    /** @rva 0x901770  public int get_CalculationPointPolicyMstId() { } */
    get_CalculationPointPolicyMstId(): int { return notPorted("CalculationPointPolicyMstModel.get_CalculationPointPolicyMstId", 0x901770); }
    /** @rva 0x901790  public CalculationPointPolicyType get_PolicyType() { } */
    get_PolicyType(): CalculationPointPolicyType { return notPorted("CalculationPointPolicyMstModel.get_PolicyType", 0x901790); }
    /** @rva 0x85E540  public string get_CoefficientName() { } */
    get_CoefficientName(): string { return notPorted("CalculationPointPolicyMstModel.get_CoefficientName", 0x85E540); }
    /** @rva 0xA0D840  public int get_ConditionValue() { } */
    get_ConditionValue(): int { return notPorted("CalculationPointPolicyMstModel.get_ConditionValue", 0xA0D840); }
    /** @rva 0xA0E790  public int get_Value() { } */
    get_Value(): int { return notPorted("CalculationPointPolicyMstModel.get_Value", 0xA0E790); }
    /** @rva 0x16CF6B0  public DateTimeOffset get_StartTime() { } */
    get_StartTime(): any /* DateTimeOffset */ { return notPorted("CalculationPointPolicyMstModel.get_StartTime", 0x16CF6B0); }
}
