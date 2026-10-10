// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.BreakMstModel  (TypeDefIndex 879, public class) ----
export class BreakMstModel extends MstModelBase<any /* BreakMstRecord */> {
    get BreakMstId(): int { return this.get_BreakMstId(); }
    get BreakPoint(): int { return this.get_BreakPoint(); }
    get BreakPointRecoveryPerTurn(): int { return this.get_BreakPointRecoveryPerTurn(); }
    get BreakTurnGaugeSlowRatio(): int { return this.get_BreakTurnGaugeSlowRatio(); }
    get InitialBreakedDamageReceiveRate(): int { return this.get_InitialBreakedDamageReceiveRate(); }
    get MaxBreakedDamageReceiveRate(): int { return this.get_MaxBreakedDamageReceiveRate(); }
    get BreakedDamageReceiveRateIncreaseRate(): int { return this.get_BreakedDamageReceiveRateIncreaseRate(); }
    /** @rva 0x16CF080  public void .ctor(BreakMstRecord record) { } */
    ctor$BreakMstRecord(record: any /* BreakMstRecord */): this { return notPorted("BreakMstModel..ctor", 0x16CF080); }
    /** @rva 0x901770  public int get_BreakMstId() { } */
    get_BreakMstId(): int { return notPorted("BreakMstModel.get_BreakMstId", 0x901770); }
    /** @rva 0x901790  public int get_BreakPoint() { } */
    get_BreakPoint(): int { return notPorted("BreakMstModel.get_BreakPoint", 0x901790); }
    /** @rva 0x902C70  public int get_BreakPointRecoveryPerTurn() { } */
    get_BreakPointRecoveryPerTurn(): int { return notPorted("BreakMstModel.get_BreakPointRecoveryPerTurn", 0x902C70); }
    /** @rva 0x902C50  public int get_BreakTurnGaugeSlowRatio() { } */
    get_BreakTurnGaugeSlowRatio(): int { return notPorted("BreakMstModel.get_BreakTurnGaugeSlowRatio", 0x902C50); }
    /** @rva 0xA0D840  public int get_InitialBreakedDamageReceiveRate() { } */
    get_InitialBreakedDamageReceiveRate(): int { return notPorted("BreakMstModel.get_InitialBreakedDamageReceiveRate", 0xA0D840); }
    /** @rva 0xA0E7D0  public int get_MaxBreakedDamageReceiveRate() { } */
    get_MaxBreakedDamageReceiveRate(): int { return notPorted("BreakMstModel.get_MaxBreakedDamageReceiveRate", 0xA0E7D0); }
    /** @rva 0xA0E790  public int get_BreakedDamageReceiveRateIncreaseRate() { } */
    get_BreakedDamageReceiveRateIncreaseRate(): int { return notPorted("BreakMstModel.get_BreakedDamageReceiveRateIncreaseRate", 0xA0E790); }
}
