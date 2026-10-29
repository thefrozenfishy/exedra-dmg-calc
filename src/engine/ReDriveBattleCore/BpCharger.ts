// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
    /** @rva 0x14A16B0  public static void ChargeByNormalAttack(BattleUnit attacker) { } */
    static ChargeByNormalAttack(attacker: BattleUnit): void {
        attacker.AddBP(BpCharger.NormalAttackChargePoint); // tail call
    }
    /** @rva 0x14A15D0  public static void ChargeByActiveSkill(BattleUnit attacker) { } */
    static ChargeByActiveSkill(attacker: BattleUnit): void {
        attacker.AddBP(BpCharger.ActiveSkillChargePoint); // tail call
    }
    /** @rva 0x14A1640  public static void ChargeByEpAbilityEffect(BattleUnit targetUnit) { } */
    static ChargeByEpAbilityEffect(targetUnit: BattleUnit): void {
        targetUnit.AddBP(BpCharger.EpAbilityEffectChargePoint); // tail call
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x14A1720  private static void .cctor() { } */
    static cctor(): void {
        BpCharger.NormalAttackChargePoint = 1;
        BpCharger.ActiveSkillChargePoint = 2;
        BpCharger.EpAbilityEffectChargePoint = 1;
    }
}

BpCharger.cctor(); // C# static constructor