// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, float, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.EpCharger  (TypeDefIndex 395, public class) ----
export class EpCharger {
    /** 0x0 private static readonly int NormalAttackChargePoint */
    static NormalAttackChargePoint: int = 0;
    /** 0x4 private static readonly int ActiveSkillChargePoint */
    static ActiveSkillChargePoint: int = 0;
    /** 0x8 private static readonly int SpecialAttackChargePoint */
    static SpecialAttackChargePoint: int = 0;
    /** 0xC private static readonly int DefeatUnitChargePoint */
    static DefeatUnitChargePoint: int = 0;
    /** 0x10 private static readonly Dictionary<int, int> ReceiveDamageChargePointDic */
    static ReceiveDamageChargePointDic: Dictionary<int, int> = null!;
    /** 0x18 private static readonly int ReceiveSlipDamageChargePoint */
    static ReceiveSlipDamageChargePoint: int = 0;
    /** @rva 0x14974A0  public static void ChargeByNormalAttack(BattleUnit attacker) { } */
    static ChargeByNormalAttack(attacker: BattleUnit): void { return notPorted("EpCharger.ChargeByNormalAttack", 0x14974A0); }
    /** @rva 0x1497320  public static void ChargeByActiveSkill(BattleUnit attacker) { } */
    static ChargeByActiveSkill(attacker: BattleUnit): void { return notPorted("EpCharger.ChargeByActiveSkill", 0x1497320); }
    /** @rva 0x1497900  public static void ChargeBySpecialAttack(BattleUnit attacker) { } */
    static ChargeBySpecialAttack(attacker: BattleUnit): void { return notPorted("EpCharger.ChargeBySpecialAttack", 0x1497900); }
    /** @rva 0x14973A0  public static void ChargeByDefeatUnit(BattleUnit attacker) { } */
    static ChargeByDefeatUnit(attacker: BattleUnit): void { return notPorted("EpCharger.ChargeByDefeatUnit", 0x14973A0); }
    /** @rva 0x1497520  public static void ChargeByReceiveDamage(BattleUnit receiveDamageUnit) { } */
    static ChargeByReceiveDamage(receiveDamageUnit: BattleUnit): void { return notPorted("EpCharger.ChargeByReceiveDamage", 0x1497520); }
    /** @rva 0x1497880  public static void ChargeByReceiveSlipDamage(BattleUnit receiveSlipDamageUnit) { } */
    static ChargeByReceiveSlipDamage(receiveSlipDamageUnit: BattleUnit): void { return notPorted("EpCharger.ChargeByReceiveSlipDamage", 0x1497880); }
    /** @rva 0x1497420  public static void ChargeByEpAbilityEffect(float recoveryEp, BattleUnit targetUnit) { } */
    static ChargeByEpAbilityEffect(recoveryEp: float, targetUnit: BattleUnit): void { return notPorted("EpCharger.ChargeByEpAbilityEffect", 0x1497420); }
    /** @rva 0x1497980  private static int GetProcessedRecoveryEp(float recoveryEp, BattleUnit unit) { } */
    static GetProcessedRecoveryEp(recoveryEp: float, unit: BattleUnit): int { return notPorted("EpCharger.GetProcessedRecoveryEp", 0x1497980); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1498020  private static void .cctor() { } */
    static cctor(): void { return notPorted("EpCharger..cctor", 0x1498020); }
}
