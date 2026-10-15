import { IConsumeRemainCount$ConsumeRemainCount } from "../UnitState/IConsumeRemainCount";
import { IConsumeRemainCountOnAttack$ShouldConsume } from "../UnitState/IConsumeRemainCountOnAttack";
// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IConsumeRemainCount } from "../UnitState/IConsumeRemainCount";
import type { ILvUp } from "../UnitState/ILvUp";
import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { CorrelationEffect } from "../CorrelationEffect";
import { VortexUnitStateBase } from "../UnitState/VortexUnitStateBase";
import { ReflectionUnitStateBase } from "../UnitState/ReflectionUnitStateBase";
import { AdditionalSkillAct } from "../Act/AdditionalSkillAct";
import { AdditionalSkill } from "../AdditionalSkill";
import { BattleDamageCalculator } from "../BattleDamageCalculator";
import { BreakPoint } from "../BreakPoint";
import { CharacterParameter } from "../CharacterParameter";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";
import { bindDelegate, dictGet, f32, isImpl, notPorted } from "../../runtime";
import type { Decimal, Dictionary, IEnumerable, List, Nullable, float, int } from "../../runtime";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";

import type { BattleUnit } from "../BattleUnit";

import type { DamageCategory } from "../DamageCategory";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IActiveSkillInfo } from "../IActiveSkillInfo";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { IConsumeRemainCountOnAttack } from "../UnitState/IConsumeRemainCountOnAttack";

// ---- ReDriveBattleCore.AbilityEffect.DamageAbilityEffectBase  (TypeDefIndex 1174, public abstract class) ----
export abstract class DamageAbilityEffectBase extends AbilityEffectBase {  // implements IActiveSkillInfo
    static readonly __interfaces: readonly string[] = ['IActiveSkillInfo'];
    /** 0x60 protected ValueTuple<float, float> damagePower */
    damagePower: any /* ValueTuple<float, float> */ = null!;
    /** 0x68 protected TargetElementType attackElement */
    attackElement: TargetElementType = 0 as TargetElementType;
    /** 0x6C protected SkillType skillType */
    skillType: SkillType = 0 as SkillType;
    /** 0x70 protected int skillMstId */
    skillMstId: int = 0;
    /** 0x74 protected int attackTargetId */
    attackTargetId: int = 0;
    /** 0x78 private ValueTuple<int, int> <SpecifiedVariationBreakPoint>k__BackingField */
    _SpecifiedVariationBreakPoint: any /* ValueTuple<int, int> */ = null!;
    /** 0x80 protected float breakedDamageReceiveRatio */
    breakedDamageReceiveRatio: float = 0;
    /** 0x88 private readonly List<IConsumeRemainCountOnAttack> attackHitConsumableStateList */
    attackHitConsumableStateList: List<IConsumeRemainCountOnAttack> = null!;
    get SpecifiedVariationBreakPoint(): any /* ValueTuple<int, int> */ { return this.get_SpecifiedVariationBreakPoint(); }
    set SpecifiedVariationBreakPoint(v: any /* ValueTuple<int, int> */) { this.set_SpecifiedVariationBreakPoint(v); }
    get DamageBaseType(): DamageBaseType { return this.get_DamageBaseType(); }
    get IsIncreaseBreakedDamageReceiveRate(): boolean { return this.get_IsIncreaseBreakedDamageReceiveRate(); }
    get IsGiveBreakPointDamage(): boolean { return this.get_IsGiveBreakPointDamage(); }
    get IsConsumeRemainCountOnAttackHit(): boolean { return this.get_IsConsumeRemainCountOnAttackHit(); }
    get DamageCategory(): DamageCategory { return this.get_DamageCategory(); }
    /** @rva 0x736C60  protected ValueTuple<int, int> get_SpecifiedVariationBreakPoint() { } */
    get_SpecifiedVariationBreakPoint(): any /* ValueTuple<int, int> */ { return this._SpecifiedVariationBreakPoint; /* auto-property */ }
    /** @rva 0x901D00  protected void set_SpecifiedVariationBreakPoint(ValueTuple<int, int> value) { } */
    set_SpecifiedVariationBreakPoint(value: any /* ValueTuple<int, int> */): void { this._SpecifiedVariationBreakPoint = value; /* auto-property */ }
    /** @rva -1 slot 9  protected abstract DamageBaseType get_DamageBaseType(); */
    abstract get_DamageBaseType(): DamageBaseType;
    /** @rva 0x76E830 slot 10  protected virtual bool get_IsIncreaseBreakedDamageReceiveRate() { } */
    get_IsIncreaseBreakedDamageReceiveRate(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76E830 slot 11  protected virtual bool get_IsGiveBreakPointDamage() { } */
    get_IsGiveBreakPointDamage(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76E830 slot 12  protected virtual bool get_IsConsumeRemainCountOnAttackHit() { } */
    get_IsConsumeRemainCountOnAttackHit(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva -1 slot 13  public abstract DamageCategory get_DamageCategory(); */
    abstract get_DamageCategory(): DamageCategory;
    /** @rva 0x1925E20  protected void .ctor() { } */
    ctor(): this {
        this._SpecifiedVariationBreakPoint = [0, 0];
        this.attackHitConsumableStateList = [];
        super.ctor();
        return this;
    }
    /** @rva 0x1925EE0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._SpecifiedVariationBreakPoint = [0, 0];
        this.attackHitConsumableStateList = [];
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.damagePower = [f32(f32(info._EffectValue1) / 1000), f32(f32(info._EffectValue2) / 1000)];
        this.attackElement = info._TargetElement;
        this._SpecifiedVariationBreakPoint = [info._EffectValue3, info._EffectValue4];
        this.breakedDamageReceiveRatio = f32(f32(info._EffectValue5) / 10);
        return this;
    }
    /** @rva 0x1924EF0 slot 8  public void SetActiveSkillInfo(SkillType skillType, int skillMstId) { } */
    SetActiveSkillInfo(skillType: SkillType, skillMstId: int): void {
        this.skillType = skillType;
        this.skillMstId = skillMstId;
    }
    /** @rva 0x1924EB0 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void {
        attackTargetId = attackTargetId ?? 0;
        super.SelectTargets(userUnit, targetUnitDic, selectFriendUnitId, attackTargetId);
        this.attackTargetId = attackTargetId;
    }
    /** @rva 0x1924F00 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        let affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        const attackSkill = userUnit._SkillSet.GetSkill(this.skillMstId);
        if (attackSkill == null) return affectedUnitNoticeBundle;
        let roleType = 0 as RoleType;
        if (userUnit.isCharacter) {
            const parameter = userUnit._BattleParameter; // get_BattleParameter
            if (parameter instanceof CharacterParameter) roleType = parameter._Role;
        }
        const variationBreakPoint: [int, int] = this.GetVariationBreakPoint(roleType /* new Nullable<RoleType>(roleType) */);
        const turnOrderPriority = gameDirector.turnActSystem.turnReferee.get_NextTurnOrderPriority();
        this.CollectAttackHitConsumableStates(userUnit);
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            affectedUnitNoticeBundle = AffectedUnitNoticeBundle.op_Addition(affectedUnitNoticeBundle, this.ReflectionProcess(userUnit, targetUnit, attackSkill, gameDirector));
            let power: float = this.damagePower[0];
            let breakPointValue: int = variationBreakPoint[0];
            if (this._EffectRange === 2 && targetUnitId !== this.attackTargetId) {
                power = this.damagePower[1];
                breakPointValue = variationBreakPoint[1];
            }
            const damageBase = this.GetDamageBase(userUnit, power);
            let notice = BattleDamageCalculator.GetAttackDamageResult(userUnit, targetUnit, damageBase, this.attackElement, this.get_DamageBaseType(), attackSkill, gameDirector.get_BattleType(), this.get_DamageCategory());
            if (this.get_IsIncreaseBreakedDamageReceiveRate()) {
                this.IncreaseBreakedDamageReceiveRate(userUnit, targetUnit, notice);
            }
            if (this.get_IsGiveBreakPointDamage()) {
                notice = AffectedUnitNotice.op_Addition(notice, targetUnit._BreakPoint.Decrease(userUnit, targetUnit, this.attackElement, breakPointValue, turnOrderPriority));
            }
            const totalDamageValue = notice.GetTotalDamageValue(false);
            notice = AffectedUnitNotice.op_Addition(notice, this.VortexProcess(targetUnit, gameDirector));
            const attackDamage = userUnit.Attack(targetUnit, notice.GetTotalDamageValue(true), gameDirector);
            notice._IsDead = targetUnit.get_IsDead();
            this.UniqueStateLvUpProcess(targetUnit, userUnit);
            Math.min(attackDamage, totalDamageValue); // result unused in the game
            const currentAct = gameDirector.turnActSystem.actReferee.currentAct;
            if (currentAct instanceof AdditionalSkillAct) {
                notice._IsCounterAttack = currentAct.IsTargetingCurrentActUnit;
            }
            affectedUnitNoticeBundle.Add(notice);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        if (!this.ConsumeAttackHitConsumableStates(attackSkill, affectedUnitNoticeBundle.GetNoticeList())) {
            return affectedUnitNoticeBundle;
        }
        affectedUnitNoticeBundle.Add(new AffectedUnitNotice().ctor$int(userUnit._Id));
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1924580  protected void IncreaseBreakedDamageReceiveRate(BattleUnit userUnit, BattleUnit targetUnit, AffectedUnitNotice notice) { } */
    IncreaseBreakedDamageReceiveRate(userUnit: BattleUnit, targetUnit: BattleUnit, notice: AffectedUnitNotice): void {
        if (!targetUnit._BreakPoint.get_IsBreak()) return;
        if (!userUnit.isCharacter) return;
        const parameter = userUnit._BattleParameter; // get_BattleParameter
        if (!(parameter instanceof CharacterParameter)) return;
        let rate: float = this.breakedDamageReceiveRatio;
        if (rate === 0) {
            switch (parameter._Role) {
                case 1: rate = 5; break;
                case 2: rate = 20; break;
                case 3:
                case 6: rate = 10; break;
                case 4:
                case 5: rate = 12; break;
                default:
                    throw new Error(`キャラ ${parameter.get_StyleMstId()} の Role が不正です ${parameter._Role}`);
            }
        }
        const ratio = userUnit.GetProcessedBreakedDamageReceiveRatio();
        const targetParameter = targetUnit._BattleParameter; // get_BattleParameter
        const increaseRate = Math.trunc(Math.floor(f32(f32(f32(targetParameter._BreakedDamageReceiveRateIncreaseRate) / 1000) * f32(f32(f32(ratio / 100) + 1) * rate))));
        const result = targetUnit.AddBreakedDamageReceiveRate(increaseRate);
        notice._IsBreakedDamageReceiveRateBecomeMax = result[0];
        notice._BreakedDamageReceiveRateUpValue = result[1];
    }
    /** @rva 0x19244F0 slot 14  public virtual ValueTuple<int, int> GetVariationBreakPoint(Nullable<RoleType> attackerRoleType) { } */
    GetVariationBreakPoint(attackerRoleType: Nullable<RoleType>): any /* ValueTuple<int, int> */ {
        if (this._SpecifiedVariationBreakPoint[0] === 0 && this._SpecifiedVariationBreakPoint[1] === 0) {
            return BreakPoint.GetDecreaseValue(this.skillType, this._EffectRange, (attackerRoleType ?? 0) as RoleType /* GetValueOrDefault */, false);
        }
        return this._SpecifiedVariationBreakPoint;
    }
    /** @rva 0x1924430 slot 15  protected virtual Decimal GetDamageBase(BattleUnit unit, float power) { } */
    GetDamageBase(unit: BattleUnit, power: float): Decimal {
        return BattleDamageCalculator.GetDamageBase(unit.GetInitialDamageBaseParamValue(this.get_DamageBaseType()), power);
    }
    /** @rva 0x1924300 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        return targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__30_0
    }
    /** @rva 0x1924B40 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        if (this._EffectRange === 3) return 0;
        if (this._EffectRange !== 1 && this._EffectRange !== 2) {
            throw new Error(`DamageAbilityEffect.EffectRange【${this._EffectRange}】 パラメータが不正です`);
        }
        const candidateUnits = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__31_0
        const unitFilterFuncOrder = new AISkillTargetSelector_UnitFilterFuncOrder().ctor();
        if (!userUnit.isCharacter) {
            unitFilterFuncOrder.AddLast(DamageAbilityEffectBase.$SelectTargetInAIAction$g__UnitFilterByRoleAtWeightedRandomWithHate_31_2);
        } else {
            unitFilterFuncOrder.AddLast(AISkillTargetSelector.UnitFilterByBreak);
            unitFilterFuncOrder.AddLast(AISkillTargetSelector.UnitFilterByMainTarget);
            unitFilterFuncOrder.AddLast(bindDelegate(this, this.$SelectTargetInAIAction$g__UnitFilterMatchWeakElement_31_1));
            unitFilterFuncOrder.AddLast(DamageAbilityEffectBase.$SelectTargetInAIAction$g__UnitFilterByRoleAtWeightedRandomWithHate_31_2);
        }
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, unitFilterFuncOrder);
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x1924860  protected AffectedUnitNoticeBundle ReflectionProcess(BattleUnit userUnit, BattleUnit targetUnit, ActiveSkillBase attackSkill, GameDirectorBase gameDirector) { } */
    ReflectionProcess(userUnit: BattleUnit, targetUnit: BattleUnit, attackSkill: ActiveSkillBase, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        let affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        if (!(0 < targetUnit._Condition._BarrierEndurance)) return affectedUnitNoticeBundle;
        if (attackSkill != null && attackSkill instanceof AdditionalSkill && attackSkill.skillType === 5) {
            return affectedUnitNoticeBundle;
        }
        for (const state of targetUnit._Condition._StateList) {
            if (state instanceof ReflectionUnitStateBase && state.IsActive$BattleUnit(targetUnit)) {
                affectedUnitNoticeBundle = AffectedUnitNoticeBundle.op_Addition(affectedUnitNoticeBundle, state.Triggering(targetUnit, userUnit, [...gameDirector.get_battleUnitDic().values()], gameDirector.get_BattleType(), gameDirector));
            }
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1925820  protected void UniqueStateLvUpProcess(BattleUnit targetUnit, BattleUnit attackUnit) { } */
    UniqueStateLvUpProcess(targetUnit: BattleUnit, attackUnit: BattleUnit): void {
        // <>c__DisplayClass33_0: 0x10 targetUnit, 0x18 attackUnit
        if (this.get_DamageCategory() !== 1 && this.get_DamageCategory() !== 2) return;
        if (targetUnit.get_IsDead()) return;
        const list = (targetUnit._Condition._StateList
            .filter(s => s.IsActive$BattleUnit(targetUnit)) /* b__0 */
            .filter(s => isImpl(s, "ILvUp")) as unknown as ILvUp[]) /* OfType<ILvUp> */
            .filter(x => x.TargetLvUpType === 1); // <>c.b__33_1
        list.forEach(x => x.LvUpProcess(attackUnit, targetUnit)); // b__2
    }
    /** @rva 0x1925B10  protected AffectedUnitNotice VortexProcess(BattleUnit unit, GameDirectorBase gameDirector) { } */
    VortexProcess(unit: BattleUnit, gameDirector: GameDirectorBase): AffectedUnitNotice {
        for (const state of unit._Condition._StateList) {
            if (state instanceof VortexUnitStateBase && state.IsActive$BattleUnit(unit)) {
                state._RemainAttackCount = state._RemainAttackCount - 1;
            }
        }
        let notice = BattleDamageCalculator.GetSlipDamageResult(unit, gameDirector.get_battleUnitDic(), gameDirector.get_BattleType(),
            s => s instanceof VortexUnitStateBase && s._RemainAttackCount <= 0 /* <>c.b__34_0 */, false);
        if (notice == null) notice = new AffectedUnitNotice().ctor$int(unit._Id);
        return notice;
    }
    /** @rva 0x1923E40  protected void CollectAttackHitConsumableStates(BattleUnit attackUnit) { } */
    CollectAttackHitConsumableStates(attackUnit: BattleUnit): void {
        if (!this.get_IsConsumeRemainCountOnAttackHit()) return;
        this.attackHitConsumableStateList.length = 0; // List.Clear
        for (const state of attackUnit._Condition._StateList) {
            if (!isImpl(state, "IConsumeRemainCountOnAttack")) continue;
            const consumable = state as unknown as IConsumeRemainCountOnAttack;
            if (consumable.RemainCount < 1) continue;
            if (!state.IsActive$BattleUnit(attackUnit)) continue;
            this.attackHitConsumableStateList.push(consumable);
        }
    }
    /** @rva 0x1924060  protected bool ConsumeAttackHitConsumableStates(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ConsumeAttackHitConsumableStates(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean {
        if (!this.get_IsConsumeRemainCountOnAttackHit() || !(this.attackHitConsumableStateList.length > 0)) return false;
        let count = 0;
        for (const state of this.attackHitConsumableStateList) {
            if (IConsumeRemainCountOnAttack$ShouldConsume(state, attackSkill, noticeList)) {
                IConsumeRemainCount$ConsumeRemainCount(state as unknown as IConsumeRemainCount, 1); // default interface method
                count++;
            }
        }
        this.attackHitConsumableStateList.length = 0; // List.Clear
        return 0 < count;
    }
    /** @rva 0x1925790  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterMatchWeakElement|31_1(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterMatchWeakElement_31_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => this.$SelectTargetInAIAction$b__31_3(unit));
    }
    /** @rva 0x1925620  private bool <SelectTargetInAIAction>b__31_3(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__31_3(unit: BattleUnit): boolean {
        return CorrelationEffect.IsMatchWeakElement(this.attackElement, unit._WeakElements);
    }
    /** @rva 0x1925690  internal static IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByRoleAtWeightedRandomWithHate|31_2(IEnumerable<BattleUnit> candidateUnits) { } */
    static $SelectTargetInAIAction$g__UnitFilterByRoleAtWeightedRandomWithHate_31_2(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const unit = AISkillTargetSelector.SelectUnitAtWeightedRandom(AISkillTargetSelector.GetUnitWeightDic(candidateUnits, true));
        if (unit == null) return []; // Enumerable.Empty<BattleUnit>()
        return [unit];
    }
}

// ---- ReDriveBattleCore.AbilityEffect.DamageAbilityEffectBase.TargetInfo  (TypeDefIndex 1171, private class) ----
export class DamageAbilityEffectBase_TargetInfo {
    /** 0x10 private readonly int <UnitId>k__BackingField */
    _UnitId: int = 0;
    /** 0x14 private readonly float <TotalDamageRatio>k__BackingField */
    _TotalDamageRatio: float = 0;
    /** 0x18 private readonly int <Hp>k__BackingField */
    _Hp: int = 0;
    /** 0x1C private float <RangeDamageRatio>k__BackingField */
    _RangeDamageRatio: float = 0;
    get UnitId(): int { return this.get_UnitId(); }
    get TotalDamageRatio(): float { return this.get_TotalDamageRatio(); }
    get Hp(): int { return this.get_Hp(); }
    get RangeDamageRatio(): float { return this.get_RangeDamageRatio(); }
    set RangeDamageRatio(v: float) { this.set_RangeDamageRatio(v); }
    /** @rva 0x7354F0  public int get_UnitId() { } */
    get_UnitId(): int { return this._UnitId; /* auto-property */ }
    /** @rva 0x8869D0  public float get_TotalDamageRatio() { } */
    get_TotalDamageRatio(): float { return this._TotalDamageRatio; /* auto-property */ }
    /** @rva 0x762820  public int get_Hp() { } */
    get_Hp(): int { return this._Hp; /* auto-property */ }
    /** @rva 0x9D7680  public float get_RangeDamageRatio() { } */
    get_RangeDamageRatio(): float { return this._RangeDamageRatio; /* auto-property */ }
    /** @rva 0xF316C0  public void set_RangeDamageRatio(float value) { } */
    set_RangeDamageRatio(value: float): void { this._RangeDamageRatio = value; /* auto-property */ }
    /** @rva 0x1931BC0  public void .ctor(BattleUnit unit, CorrelationEffect correlationEffect) { } */
    ctor$BattleUnit_CorrelationEffect(unit: BattleUnit, correlationEffect: CorrelationEffect): this {
        this._UnitId = unit._Id;
        this._TotalDamageRatio = correlationEffect._TotalDamageRatio;
        this._Hp = unit._HP;
        this._RangeDamageRatio = correlationEffect._TotalDamageRatio;
        return this;
    }
}
