// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { HpRecoveryCalculator } from "../HpRecoveryCalculator";
import { Decimal, notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.ContinuousRecoveryUnitState  (TypeDefIndex 556, public class) ----
export class ContinuousRecoveryUnitState extends UnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** 0x0 private static readonly float MaxHpRateToUse */
    static MaxHpRateToUse: float = 0;
    /** 0x88 private float recoveryRatio */
    recoveryRatio: float = 0;
    /** 0x8C private float recoveryFixedValue */
    recoveryFixedValue: float = 0;
    get RecoveryRatio(): float { return this.get_RecoveryRatio(); }
    get RecoveryFixedValue(): float { return this.get_RecoveryFixedValue(); }
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xC84590  public float get_RecoveryRatio() { } */
    get_RecoveryRatio(): float { return this.recoveryRatio; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x892710  public float get_RecoveryFixedValue() { } */
    get_RecoveryFixedValue(): float { return this.recoveryFixedValue; /* asm: movss xmm0, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x15DCF20 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_continuous_recovery";
    }
    /** @rva 0x15DCEF0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x15D9DA0  public void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DCE90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.recoveryRatio = f32(f32(info._EffectValue1) / 10);
        this.recoveryFixedValue = f32(info._EffectValue2);
        return this;
    }
    /** @rva 0x15DCC80 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMinHpRate);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15DC8B0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__16_0
        if (list.length > 0) list = list.filter(unit => unit.CalculationHpRate() < ContinuousRecoveryUnitState.MaxHpRateToUse); // b__16_1
        return list;
    }
    /** @rva 0x15DCAE0  public Decimal GetRecoveryValue(BattleUnit userUnit) { } */
    GetRecoveryValue(userUnit: BattleUnit): Decimal {
        const value = Decimal.fromInt(userUnit._MaxHP).mul(Decimal.fromFloat(this.recoveryRatio).div(Decimal.fromInt(100))).add(Decimal.fromFloat(this.recoveryFixedValue));
        return HpRecoveryCalculator.GetProcessedRecoveryValue(userUnit, userUnit, value, false);
    }
    /** @rva 0x15DCE50  private static void .cctor() { } */
    static cctor(): void {
        ContinuousRecoveryUnitState.MaxHpRateToUse = 80; // 0x42a00000
    }
}

ContinuousRecoveryUnitState.cctor(); // C# static constructor