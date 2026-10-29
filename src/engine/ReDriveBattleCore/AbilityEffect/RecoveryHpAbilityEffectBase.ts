// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { HpRecoveryCalculator } from "../HpRecoveryCalculator";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { Decimal, dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, float, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.RecoveryHpAbilityEffectBase  (TypeDefIndex 1197, public abstract class) ----
export abstract class RecoveryHpAbilityEffectBase extends AbilityEffectBase {
    /** 0x0 private static readonly float MaxHpRateToUseSpecialAttackWithHpRecoveryEffect */
    static MaxHpRateToUseSpecialAttackWithHpRecoveryEffect: float = 0;
    /** 0x4 private static readonly float MaxHpRateToUseActiveSkillWithHpRecoveryEffect */
    static MaxHpRateToUseActiveSkillWithHpRecoveryEffect: float = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x191BDF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva 0x191C490 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            if (targetUnit == null || targetUnit.get_IsDead()) continue;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            let value = this.GetBaseRecoveryValue(userUnit); // vslot 8
            if (value.lt(Decimal.Zero)) value = Decimal.Zero;
            const battleType = gameDirector.get_BattleType();
            value = HpRecoveryCalculator.GetProcessedRecoveryValue(userUnit, targetUnit, value, battleType === 2 || battleType === 4);
            const hpBefore = targetUnit._HP;
            targetUnit.AddHP(value.ceiling().toInt()); // (int)decimal.Ceiling(value)
            bundle.Add(AffectedUnitNotice.CreateByRecovery(targetUnitId, targetUnit._HP - hpBefore, false));
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
    /** @rva -1 slot 8  public abstract Decimal GetBaseRecoveryValue(BattleUnit userUnit); */
    abstract GetBaseRecoveryValue(userUnit: BattleUnit): Decimal;
    /** @rva 0x191BE10 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        const list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__6_0
        if (!(list.length > 0)) return list;
        let source = list;
        if (this._EffectRange === -1) source = [userUnit];
        // game quirk: for a skill type other than 1/2 the filtered list is returned, not the self list
        if (skillType === 2) return source.filter(unit => unit.CalculationHpRate() < RecoveryHpAbilityEffectBase.MaxHpRateToUseSpecialAttackWithHpRecoveryEffect); // b__6_1
        if (skillType !== 1) return list;
        return source.filter(unit => unit.CalculationHpRate() < RecoveryHpAbilityEffectBase.MaxHpRateToUseActiveSkillWithHpRecoveryEffect); // b__6_2
    }
    /** @rva 0x191C180 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__7_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMinHpRate];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x191C8A0  private static void .cctor() { } */
    static cctor(): void {
        RecoveryHpAbilityEffectBase.MaxHpRateToUseSpecialAttackWithHpRecoveryEffect = 50; // 0x42480000
        RecoveryHpAbilityEffectBase.MaxHpRateToUseActiveSkillWithHpRecoveryEffect = 80; // 0x42a00000
    }
}

RecoveryHpAbilityEffectBase.cctor(); // C# static constructor