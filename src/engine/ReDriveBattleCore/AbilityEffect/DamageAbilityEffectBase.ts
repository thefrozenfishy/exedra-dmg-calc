// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, Dictionary, IEnumerable, List, Nullable, float, int } from "../../runtime";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { CorrelationEffect } from "../CorrelationEffect";
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
    /** @rva 0x737C60  protected ValueTuple<int, int> get_SpecifiedVariationBreakPoint() { } */
    get_SpecifiedVariationBreakPoint(): any /* ValueTuple<int, int> */ { return this._SpecifiedVariationBreakPoint; /* auto-property */ }
    /** @rva 0x9032E0  protected void set_SpecifiedVariationBreakPoint(ValueTuple<int, int> value) { } */
    set_SpecifiedVariationBreakPoint(value: any /* ValueTuple<int, int> */): void { this._SpecifiedVariationBreakPoint = value; /* auto-property */ }
    /** @rva -1 slot 9  protected abstract DamageBaseType get_DamageBaseType(); */
    abstract get_DamageBaseType(): DamageBaseType;
    /** @rva 0x76F830 slot 10  protected virtual bool get_IsIncreaseBreakedDamageReceiveRate() { } */
    get_IsIncreaseBreakedDamageReceiveRate(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 11  protected virtual bool get_IsGiveBreakPointDamage() { } */
    get_IsGiveBreakPointDamage(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 12  protected virtual bool get_IsConsumeRemainCountOnAttackHit() { } */
    get_IsConsumeRemainCountOnAttackHit(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva -1 slot 13  public abstract DamageCategory get_DamageCategory(); */
    abstract get_DamageCategory(): DamageCategory;
    /** @rva 0x18F0570  protected void .ctor() { } */
    ctor(): this { return notPorted("DamageAbilityEffectBase..ctor", 0x18F0570); }
    /** @rva 0x18F0630  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DamageAbilityEffectBase..ctor", 0x18F0630); }
    /** @rva 0x18EF640 slot 8  public void SetActiveSkillInfo(SkillType skillType, int skillMstId) { } */
    SetActiveSkillInfo(skillType: SkillType, skillMstId: int): void {
        this.skillType = skillType;
        this.skillMstId = skillMstId;
    }
    /** @rva 0x18EF600 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void { return notPorted("DamageAbilityEffectBase.SelectTargets", 0x18EF600); }
    /** @rva 0x18EF650 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("DamageAbilityEffectBase.Triggering", 0x18EF650); }
    /** @rva 0x18EECD0  protected void IncreaseBreakedDamageReceiveRate(BattleUnit userUnit, BattleUnit targetUnit, AffectedUnitNotice notice) { } */
    IncreaseBreakedDamageReceiveRate(userUnit: BattleUnit, targetUnit: BattleUnit, notice: AffectedUnitNotice): void { return notPorted("DamageAbilityEffectBase.IncreaseBreakedDamageReceiveRate", 0x18EECD0); }
    /** @rva 0x18EEC40 slot 14  public virtual ValueTuple<int, int> GetVariationBreakPoint(Nullable<RoleType> attackerRoleType) { } */
    GetVariationBreakPoint(attackerRoleType: Nullable<RoleType>): any /* ValueTuple<int, int> */ { return notPorted("DamageAbilityEffectBase.GetVariationBreakPoint", 0x18EEC40); }
    /** @rva 0x18EEB80 slot 15  protected virtual Decimal GetDamageBase(BattleUnit unit, float power) { } */
    GetDamageBase(unit: BattleUnit, power: float): Decimal { return notPorted("DamageAbilityEffectBase.GetDamageBase", 0x18EEB80); }
    /** @rva 0x18EEA50 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("DamageAbilityEffectBase.GetAIFilteredTargets", 0x18EEA50); }
    /** @rva 0x18EF290 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("DamageAbilityEffectBase.SelectTargetInAIAction", 0x18EF290); }
    /** @rva 0x18EEFB0  protected AffectedUnitNoticeBundle ReflectionProcess(BattleUnit userUnit, BattleUnit targetUnit, ActiveSkillBase attackSkill, GameDirectorBase gameDirector) { } */
    ReflectionProcess(userUnit: BattleUnit, targetUnit: BattleUnit, attackSkill: ActiveSkillBase, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("DamageAbilityEffectBase.ReflectionProcess", 0x18EEFB0); }
    /** @rva 0x18EFF70  protected void UniqueStateLvUpProcess(BattleUnit targetUnit, BattleUnit attackUnit) { } */
    UniqueStateLvUpProcess(targetUnit: BattleUnit, attackUnit: BattleUnit): void { return notPorted("DamageAbilityEffectBase.UniqueStateLvUpProcess", 0x18EFF70); }
    /** @rva 0x18F0260  protected AffectedUnitNotice VortexProcess(BattleUnit unit, GameDirectorBase gameDirector) { } */
    VortexProcess(unit: BattleUnit, gameDirector: GameDirectorBase): AffectedUnitNotice { return notPorted("DamageAbilityEffectBase.VortexProcess", 0x18F0260); }
    /** @rva 0x18EE590  protected void CollectAttackHitConsumableStates(BattleUnit attackUnit) { } */
    CollectAttackHitConsumableStates(attackUnit: BattleUnit): void { return notPorted("DamageAbilityEffectBase.CollectAttackHitConsumableStates", 0x18EE590); }
    /** @rva 0x18EE7B0  protected bool ConsumeAttackHitConsumableStates(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ConsumeAttackHitConsumableStates(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean { return notPorted("DamageAbilityEffectBase.ConsumeAttackHitConsumableStates", 0x18EE7B0); }
    /** @rva 0x18EFEE0  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterMatchWeakElement|31_1(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterMatchWeakElement_31_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("DamageAbilityEffectBase.<SelectTargetInAIAction>g__UnitFilterMatchWeakElement|31_1", 0x18EFEE0); }
    /** @rva 0x18EFD70  private bool <SelectTargetInAIAction>b__31_3(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__31_3(unit: BattleUnit): boolean { return notPorted("DamageAbilityEffectBase.<SelectTargetInAIAction>b__31_3", 0x18EFD70); }
    /** @rva 0x18EFDE0  internal static IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByRoleAtWeightedRandomWithHate|31_2(IEnumerable<BattleUnit> candidateUnits) { } */
    static $SelectTargetInAIAction$g__UnitFilterByRoleAtWeightedRandomWithHate_31_2(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("DamageAbilityEffectBase.<SelectTargetInAIAction>g__UnitFilterByRoleAtWeightedRandomWithHate|31_2", 0x18EFDE0); }
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
    /** @rva 0x7364F0  public int get_UnitId() { } */
    get_UnitId(): int { return this._UnitId; /* auto-property */ }
    /** @rva 0x8879D0  public float get_TotalDamageRatio() { } */
    get_TotalDamageRatio(): float { return this._TotalDamageRatio; /* auto-property */ }
    /** @rva 0x763820  public int get_Hp() { } */
    get_Hp(): int { return this._Hp; /* auto-property */ }
    /** @rva 0x9BE500  public float get_RangeDamageRatio() { } */
    get_RangeDamageRatio(): float { return this._RangeDamageRatio; /* auto-property */ }
    /** @rva 0xF0D4D0  public void set_RangeDamageRatio(float value) { } */
    set_RangeDamageRatio(value: float): void { this._RangeDamageRatio = value; /* auto-property */ }
    /** @rva 0x19030F0  public void .ctor(BattleUnit unit, CorrelationEffect correlationEffect) { } */
    ctor$BattleUnit_CorrelationEffect(unit: BattleUnit, correlationEffect: CorrelationEffect): this {
        this._UnitId = unit._Id;
        this._TotalDamageRatio = correlationEffect._TotalDamageRatio;
        this._Hp = unit._HP;
        this._RangeDamageRatio = correlationEffect._TotalDamageRatio;
        return this;
    }
}
