// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IRecoveryEpRateRatioVariation } from "./UnitState/IRecoveryEpRateRatioVariation";
import { GveUpFinalGainEpRatioUnitState } from "./UnitState/GveUpFinalGainEpRatioUnitState";
import { CharacterParameter } from "./CharacterParameter";
import { f32, isImpl, notPorted, orderBy, trunc } from "../runtime";
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
    static ChargeByNormalAttack(attacker: BattleUnit): void {
        const ep = EpCharger.GetProcessedRecoveryEp(f32(EpCharger.NormalAttackChargePoint), attacker);
        attacker.AddEP(ep);
    }
    /** @rva 0x1497320  public static void ChargeByActiveSkill(BattleUnit attacker) { } */
    static ChargeByActiveSkill(attacker: BattleUnit): void {
        const ep = EpCharger.GetProcessedRecoveryEp(f32(EpCharger.ActiveSkillChargePoint), attacker);
        attacker.AddEP(ep);
    }
    /** @rva 0x1497900  public static void ChargeBySpecialAttack(BattleUnit attacker) { } */
    static ChargeBySpecialAttack(attacker: BattleUnit): void {
        const ep = EpCharger.GetProcessedRecoveryEp(f32(EpCharger.SpecialAttackChargePoint), attacker);
        attacker.AddEP(ep);
    }
    /** @rva 0x14973A0  public static void ChargeByDefeatUnit(BattleUnit attacker) { } */
    static ChargeByDefeatUnit(attacker: BattleUnit): void {
        const ep = EpCharger.GetProcessedRecoveryEp(f32(EpCharger.DefeatUnitChargePoint), attacker);
        attacker.AddEP(ep);
    }
    /** @rva 0x1497520  public static void ChargeByReceiveDamage(BattleUnit receiveDamageUnit) { } */
    static ChargeByReceiveDamage(receiveDamageUnit: BattleUnit): void {
        if (receiveDamageUnit.get_IsDead()) return;
        for (const [key, value] of orderBy([...EpCharger.ReceiveDamageChargePointDic], kvp => kvp[0])) { // <ChargeByReceiveDamage>b__10_0 (kvp.Key)
            // comiss hpRate, (float)key; jae -> next entry
            if (!(receiveDamageUnit.CalculationHpRate() >= f32(key))) {
                receiveDamageUnit.AddEP(EpCharger.GetProcessedRecoveryEp(f32(value), receiveDamageUnit));
                return;
            }
        }
    }
    /** @rva 0x1497880  public static void ChargeByReceiveSlipDamage(BattleUnit receiveSlipDamageUnit) { } */
    static ChargeByReceiveSlipDamage(receiveSlipDamageUnit: BattleUnit): void {
        const ep = EpCharger.GetProcessedRecoveryEp(f32(EpCharger.ReceiveSlipDamageChargePoint), receiveSlipDamageUnit);
        receiveSlipDamageUnit.AddEP(ep);
    }
    /** @rva 0x1497420  public static void ChargeByEpAbilityEffect(float recoveryEp, BattleUnit targetUnit) { } */
    static ChargeByEpAbilityEffect(recoveryEp: float, targetUnit: BattleUnit): void {
        const ep = EpCharger.GetProcessedRecoveryEp(recoveryEp, targetUnit);
        targetUnit.AddEP(ep);
    }
    /** @rva 0x1497980  private static int GetProcessedRecoveryEp(float recoveryEp, BattleUnit unit) { } */
    static GetProcessedRecoveryEp(recoveryEp: float, unit: BattleUnit): int {
        const parameter = unit._BattleParameter;
        if (!(parameter instanceof CharacterParameter)) {
            return trunc(Math.ceil(recoveryEp)); // System.Math.Ceiling(double) 0x7029F0
        }
        let rate = f32(parameter._RecoveryEpRate + 100);
        for (const state of unit._Condition._StateList) {
            if (!isImpl(state, "IRecoveryEpRateRatioVariation")) continue;
            const v = state as unknown as IRecoveryEpRateRatioVariation;
            if (v.Addition !== 0) continue;
            if (!state.IsActive$BattleUnit(unit)) continue;
            rate = f32(rate + v.GetRecoveryEpRateRatioVariationValue(unit, rate));
        }
        for (const state of unit._Condition._StateList) {
            if (!isImpl(state, "IRecoveryEpRateRatioVariation")) continue;
            const v = state as unknown as IRecoveryEpRateRatioVariation;
            if (v.Addition !== 1) continue;
            if (!state.IsActive$BattleUnit(unit)) continue;
            rate = f32(rate + v.GetRecoveryEpRateRatioVariationValue(unit, rate));
        }
        const baseEp = Math.max(0, f32(f32(f32(f32(rate - 100) * recoveryEp) / 100) + recoveryEp)); // System.Math.Max(float, float)
        let ep = baseEp;
        for (const state of unit._Condition._StateList.filter(s => s instanceof GveUpFinalGainEpRatioUnitState) as GveUpFinalGainEpRatioUnitState[]) { // OfType
            ep = f32(ep + state.GetGainEpVariationValue(baseEp)); // passes the value before this loop
        }
        if (ep < 0) ep = 0;
        return trunc(Math.floor(ep)); // System.Math.Floor(double) 0x702D68, cvttsd2si
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1498020  private static void .cctor() { } */
    static cctor(): void {
        EpCharger.NormalAttackChargePoint = 15;
        EpCharger.ActiveSkillChargePoint = 30;
        EpCharger.SpecialAttackChargePoint = 5;
        EpCharger.DefeatUnitChargePoint = 10;
        const dic: Dictionary<int, int> = new Map();
        dic.set(10, 15);
        dic.set(40, 10);
        dic.set(101, 5);
        EpCharger.ReceiveDamageChargePointDic = dic;
        EpCharger.ReceiveSlipDamageChargePoint = 2;
    }
}

EpCharger.cctor(); // C# static constructor