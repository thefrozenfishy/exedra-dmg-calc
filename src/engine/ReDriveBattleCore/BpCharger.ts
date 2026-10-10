// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.BpCharger  (TypeDefIndex 363, public class) ----
export class BpCharger {
    /** 0x0 private static readonly int NormalAttackChargePoint */
    static NormalAttackChargePoint: int = 0;
    /** 0x4 private static readonly int ActiveSkillChargePoint */
    static ActiveSkillChargePoint: int = 0;
    /** 0x8 private static readonly int EpAbilityEffectChargePoint */
    static EpAbilityEffectChargePoint: int = 0;
    /** @rva 0x14913E0  public static void ChargeByNormalAttack(BattleUnit attacker) { } */
    static ChargeByNormalAttack(attacker: BattleUnit): void { return notPorted("BpCharger.ChargeByNormalAttack", 0x14913E0); }
    /** @rva 0x1491300  public static void ChargeByActiveSkill(BattleUnit attacker) { } */
    static ChargeByActiveSkill(attacker: BattleUnit): void { return notPorted("BpCharger.ChargeByActiveSkill", 0x1491300); }
    /** @rva 0x1491370  public static void ChargeByEpAbilityEffect(BattleUnit targetUnit) { } */
    static ChargeByEpAbilityEffect(targetUnit: BattleUnit): void { return notPorted("BpCharger.ChargeByEpAbilityEffect", 0x1491370); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1491450  private static void .cctor() { } */
    static cctor(): void { return notPorted("BpCharger..cctor", 0x1491450); }
}
