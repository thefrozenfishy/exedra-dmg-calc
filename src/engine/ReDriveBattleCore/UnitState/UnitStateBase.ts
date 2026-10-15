// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { MathExtension } from "../MathExtension";
import { ConditionUseType } from "../BattleCondition/ConditionUseType";
import { BattleConditionUtils } from "../BattleCondition/BattleConditionUtils";
import { f32, notPorted } from "../../runtime";
import type { IEnumerable, List, float, int } from "../../runtime";
import type { AbilitySourceType } from "../../Network/Definition/Battle/AbilitySourceType";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleConditionUtils_ConditionCheckDataBundle, BattleConditionUtils_ConditionSet } from "../BattleCondition/BattleConditionUtils";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "./EffectOriginType";

// ---- ReDriveBattleCore.UnitState.UnitStateBase  (TypeDefIndex 688, public abstract class) ----
export abstract class UnitStateBase {
    /** 0x10 private AbilitySourceType <AbilitySource>k__BackingField */
    _AbilitySource: AbilitySourceType = 0 as AbilitySourceType;
    /** 0x14 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x18 private int <SkillUniqueId>k__BackingField */
    _SkillUniqueId: int = 0;
    /** 0x0 public static readonly int EffectTurnOfPermanent */
    static EffectTurnOfPermanent: int = 0;
    /** 0x20 private string <EffectType>k__BackingField */
    _EffectType: string = null!;
    /** 0x28 private TargetRoleType <TargetRole>k__BackingField */
    _TargetRole: TargetRoleType = 0 as TargetRoleType;
    /** 0x2C private TargetElementType <TargetElement>k__BackingField */
    _TargetElement: TargetElementType = 0 as TargetElementType;
    /** 0x30 private int <EffectTurn>k__BackingField */
    _EffectTurn: int = 0;
    /** 0x34 private int <Probability>k__BackingField */
    _Probability: int = 0;
    /** 0x38 private bool <IsFixedProbability>k__BackingField */
    _IsFixedProbability: boolean = false;
    /** 0x3C private int <RemainingTurn>k__BackingField */
    _RemainingTurn: int = 0;
    /** 0x40 private int <RemainCount>k__BackingField */
    _RemainCount: int = 0;
    /** 0x48 private readonly string <IconName>k__BackingField */
    _IconName: string = null!;
    /** 0x50 private readonly int <IconPriority>k__BackingField */
    _IconPriority: int = 0;
    /** 0x54 private EffectOriginType <EffectOrigin>k__BackingField */
    _EffectOrigin: EffectOriginType = 0 as EffectOriginType;
    /** 0x58 private int <UserUnitId>k__BackingField */
    _UserUnitId: int = 0;
    /** 0x60 private string <ActiveConditionSetIdCsv>k__BackingField */
    _ActiveConditionSetIdCsv: string = null!;
    /** 0x68 private List<BattleConditionUtils.ConditionSet> activeConditionSetList */
    activeConditionSetList: List<BattleConditionUtils_ConditionSet> = null!;
    /** 0x70 private bool <ShouldBeRemovedNow>k__BackingField */
    _ShouldBeRemovedNow: boolean = false;
    /** 0x71 public bool IsExemptPassingTurnOnce */
    IsExemptPassingTurnOnce: boolean = false;
    /** 0x72 public bool IsConditionActivation */
    IsConditionActivation: boolean = false;
    /** 0x78 private Action<BattleUnit, UnitStateBase> remainCountFinishCallback */
    remainCountFinishCallback: ((a0: BattleUnit, a1: UnitStateBase) => void) = null!;
    /** 0x80 private readonly bool <AllowDuplicate>k__BackingField */
    _AllowDuplicate: boolean = false;
    get AbilitySource(): AbilitySourceType { return this.get_AbilitySource(); }
    set AbilitySource(v: AbilitySourceType) { this.set_AbilitySource(v); }
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get SkillUniqueId(): int { return this.get_SkillUniqueId(); }
    set SkillUniqueId(v: int) { this.set_SkillUniqueId(v); }
    get EffectType(): string { return this.get_EffectType(); }
    set EffectType(v: string) { this.set_EffectType(v); }
    get TargetRole(): TargetRoleType { return this.get_TargetRole(); }
    set TargetRole(v: TargetRoleType) { this.set_TargetRole(v); }
    get TargetElement(): TargetElementType { return this.get_TargetElement(); }
    set TargetElement(v: TargetElementType) { this.set_TargetElement(v); }
    get EffectTurn(): int { return this.get_EffectTurn(); }
    set EffectTurn(v: int) { this.set_EffectTurn(v); }
    get Probability(): int { return this.get_Probability(); }
    set Probability(v: int) { this.set_Probability(v); }
    get IsFixedProbability(): boolean { return this.get_IsFixedProbability(); }
    set IsFixedProbability(v: boolean) { this.set_IsFixedProbability(v); }
    get IsPermanent(): boolean { return this.get_IsPermanent(); }
    get RemainingTurn(): int { return this.get_RemainingTurn(); }
    set RemainingTurn(v: int) { this.set_RemainingTurn(v); }
    get RemainCount(): int { return this.get_RemainCount(); }
    set RemainCount(v: int) { this.set_RemainCount(v); }
    get Direction(): UnitStateBase_DirectionType { return this.get_Direction(); }
    get IconName(): string { return this.get_IconName(); }
    get IconPriority(): int { return this.get_IconPriority(); }
    get ShowStateIconAttachedByPassiveSkill(): boolean { return this.get_ShowStateIconAttachedByPassiveSkill(); }
    get DetailDisplayPriority(): int { return this.get_DetailDisplayPriority(); }
    get ShowStateDetailAttachedByPassiveSkill(): boolean { return this.get_ShowStateDetailAttachedByPassiveSkill(); }
    get IsDontShowAddStateFlip(): boolean { return this.get_IsDontShowAddStateFlip(); }
    get GiveVisualEffectName(): string { return this.get_GiveVisualEffectName(); }
    get AlwaysVisualEffectName(): string { return this.get_AlwaysVisualEffectName(); }
    get VisualShaderName(): string { return this.get_VisualShaderName(); }
    get EffectOrigin(): EffectOriginType { return this.get_EffectOrigin(); }
    set EffectOrigin(v: EffectOriginType) { this.set_EffectOrigin(v); }
    get UserUnitId(): int { return this.get_UserUnitId(); }
    set UserUnitId(v: int) { this.set_UserUnitId(v); }
    get ActiveConditionSetIdCsv(): string { return this.get_ActiveConditionSetIdCsv(); }
    set ActiveConditionSetIdCsv(v: string) { this.set_ActiveConditionSetIdCsv(v); }
    get ActiveConditionSetList(): List<BattleConditionUtils_ConditionSet> { return this.get_ActiveConditionSetList(); }
    get ShouldBeRemovedNow(): boolean { return this.get_ShouldBeRemovedNow(); }
    set ShouldBeRemovedNow(v: boolean) { this.set_ShouldBeRemovedNow(v); }
    get AllowDuplicate(): boolean { return this.get_AllowDuplicate(); }
    get ShouldRemoveStateByHolderDeath(): boolean { return this.get_ShouldRemoveStateByHolderDeath(); }
    /** @rva 0x7354F0  public AbilitySourceType get_AbilitySource() { } */
    get_AbilitySource(): AbilitySourceType { return this._AbilitySource; /* auto-property */ }
    /** @rva 0x738D00  public void set_AbilitySource(AbilitySourceType value) { } */
    set_AbilitySource(value: AbilitySourceType): void { this._AbilitySource = value; /* auto-property */ }
    /** @rva 0x802350  public int get_MstId() { } */
    get_MstId(): int { return this._MstId; /* auto-property */ }
    /** @rva 0x802540  public void set_MstId(int value) { } */
    set_MstId(value: int): void { this._MstId = value; /* auto-property */ }
    /** @rva 0x762820  public int get_SkillUniqueId() { } */
    get_SkillUniqueId(): int { return this._SkillUniqueId; /* auto-property */ }
    /** @rva 0x8A1240  public void set_SkillUniqueId(int value) { } */
    set_SkillUniqueId(value: int): void { this._SkillUniqueId = value; /* auto-property */ }
    /** @rva 0x7359E0  public string get_EffectType() { } */
    get_EffectType(): string { return this._EffectType; /* auto-property */ }
    /** @rva 0x735A50  public void set_EffectType(string value) { } */
    set_EffectType(value: string): void { this._EffectType = value; /* auto-property */ }
    /** @rva 0x7627A0  public TargetRoleType get_TargetRole() { } */
    get_TargetRole(): TargetRoleType { return this._TargetRole; /* auto-property */ }
    /** @rva 0x8A1250  public void set_TargetRole(TargetRoleType value) { } */
    set_TargetRole(value: TargetRoleType): void { this._TargetRole = value; /* auto-property */ }
    /** @rva 0x85D530  public TargetElementType get_TargetElement() { } */
    get_TargetElement(): TargetElementType { return this._TargetElement; /* auto-property */ }
    /** @rva 0x8A1260  public void set_TargetElement(TargetElementType value) { } */
    set_TargetElement(value: TargetElementType): void { this._TargetElement = value; /* auto-property */ }
    /** @rva 0x75DD60  public int get_EffectTurn() { } */
    get_EffectTurn(): int { return this._EffectTurn; /* auto-property */ }
    /** @rva 0x8735A0  public void set_EffectTurn(int value) { } */
    set_EffectTurn(value: int): void { this._EffectTurn = value; /* auto-property */ }
    /** @rva 0x75DD50  public int get_Probability() { } */
    get_Probability(): int { return this._Probability; /* auto-property */ }
    /** @rva 0x8A12A0  public void set_Probability(int value) { } */
    set_Probability(value: int): void { this._Probability = value; /* auto-property */ }
    /** @rva 0x7378E0  public bool get_IsFixedProbability() { } */
    get_IsFixedProbability(): boolean { return this._IsFixedProbability; /* auto-property */ }
    /** @rva 0x7378F0  public void set_IsFixedProbability(bool value) { } */
    set_IsFixedProbability(value: boolean): void { this._IsFixedProbability = value; /* auto-property */ }
    /** @rva 0x170A480  public bool get_IsPermanent() { } */
    get_IsPermanent(): boolean {
        return this._EffectTurn === UnitStateBase.EffectTurnOfPermanent; // no .cctor in 3.19.0: the static stays 0
    }
    /** @rva 0x8F2F40  public int get_RemainingTurn() { } */
    get_RemainingTurn(): int { return this._RemainingTurn; /* auto-property */ }
    /** @rva 0x900870  public void set_RemainingTurn(int value) { } */
    set_RemainingTurn(value: int): void { this._RemainingTurn = value; /* auto-property */ }
    /** @rva 0x7660B0 slot 4  public int get_RemainCount() { } */
    get_RemainCount(): int { return this._RemainCount; /* auto-property */ }
    /** @rva 0x766A90 slot 5  public void set_RemainCount(int value) { } */
    set_RemainCount(value: int): void { this._RemainCount = value; /* auto-property */ }
    /** @rva -1 slot 6  public abstract UnitStateBase.DirectionType get_Direction(); */
    abstract get_Direction(): UnitStateBase_DirectionType;
    /** @rva 0x7358F0 slot 7  public virtual string get_IconName() { } */
    get_IconName(): string { return this._IconName; /* auto-property */ }
    /** @rva 0x7535F0 slot 8  public virtual int get_IconPriority() { } */
    get_IconPriority(): int { return this._IconPriority; /* auto-property */ }
    /** @rva 0x7350C0 slot 9  public virtual bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7421D0 slot 10  public virtual int get_DetailDisplayPriority() { } */
    get_DetailDisplayPriority(): int { return 0; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7350C0 slot 11  public virtual bool get_ShowStateDetailAttachedByPassiveSkill() { } */
    get_ShowStateDetailAttachedByPassiveSkill(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7350C0 slot 12  public virtual bool get_IsDontShowAddStateFlip() { } */
    get_IsDontShowAddStateFlip(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x170A450 slot 13  public virtual string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return ""; }
    /** @rva 0x170A420 slot 14  public virtual string get_AlwaysVisualEffectName() { } */
    get_AlwaysVisualEffectName(): string { return ""; }
    /** @rva 0x170A4D0 slot 15  public virtual string get_VisualShaderName() { } */
    get_VisualShaderName(): string { return ""; }
    /** @rva 0x8A1210  public EffectOriginType get_EffectOrigin() { } */
    get_EffectOrigin(): EffectOriginType { return this._EffectOrigin; /* auto-property */ }
    /** @rva 0x8A12E0  public void set_EffectOrigin(EffectOriginType value) { } */
    set_EffectOrigin(value: EffectOriginType): void { this._EffectOrigin = value; /* auto-property */ }
    /** @rva 0x736C40  public int get_UserUnitId() { } */
    get_UserUnitId(): int { return this._UserUnitId; /* auto-property */ }
    /** @rva 0x736DF0  public void set_UserUnitId(int value) { } */
    set_UserUnitId(value: int): void { this._UserUnitId = value; /* auto-property */ }
    /** @rva 0x736A10  public string get_ActiveConditionSetIdCsv() { } */
    get_ActiveConditionSetIdCsv(): string { return this._ActiveConditionSetIdCsv; /* auto-property */ }
    /** @rva 0x736A50  public void set_ActiveConditionSetIdCsv(string value) { } */
    set_ActiveConditionSetIdCsv(value: string): void { this._ActiveConditionSetIdCsv = value; /* auto-property */ }
    /** @rva 0x170A3A0  public List<BattleConditionUtils.ConditionSet> get_ActiveConditionSetList() { } */
    get_ActiveConditionSetList(): List<BattleConditionUtils_ConditionSet> {
        if (this.activeConditionSetList == null) {
            this.activeConditionSetList = BattleConditionUtils.GetConditionSetListByIdCsv(this._ActiveConditionSetIdCsv);
        }
        return this.activeConditionSetList;
    }
    /** @rva 0x8E0700  public bool get_ShouldBeRemovedNow() { } */
    get_ShouldBeRemovedNow(): boolean { return this._ShouldBeRemovedNow; /* auto-property */ }
    /** @rva 0x8E1A40  public void set_ShouldBeRemovedNow(bool value) { } */
    set_ShouldBeRemovedNow(value: boolean): void { this._ShouldBeRemovedNow = value; /* auto-property */ }
    /** @rva 0x80C7D0 slot 16  public virtual bool get_AllowDuplicate() { } */
    get_AllowDuplicate(): boolean { return this._AllowDuplicate; /* auto-property */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x170A2A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._IconName = "";
        if (info == null) return this;
        this._AbilitySource = info.AbilitySource;
        this._MstId = info.MstId;
        this._SkillUniqueId = info.SkillUniqueId;
        this._EffectType = info.EffectType;
        this._TargetRole = info.TargetRole;
        this._TargetElement = info.TargetElement;
        this._EffectTurn = info.EffectTurn;
        this._RemainCount = info.RemainCount;
        this._Probability = info.Probability;
        this._IsFixedProbability = info.IsFixedProbability;
        this._ActiveConditionSetIdCsv = info.ActiveConditionSetIdCsv;
        if (this._EffectTurn !== UnitStateBase.EffectTurnOfPermanent) this._RemainingTurn = this._EffectTurn;
        return this;
    }
    /** @rva 0x1709CB0  public UnitStateBase Clone() { } */
    Clone(): UnitStateBase {
        // Object.MemberwiseClone: shallow copy keeping the runtime class
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this) as UnitStateBase;
    }
    /** @rva 0x170A220 slot 17  public virtual void SetTriggeringInfo(EffectOriginType effectOrigin, BattleUnit userUnit, bool isOwnSkill = False, bool isConditionActivation = False, BattleType battleType = 1) { } */
    SetTriggeringInfo(effectOrigin: EffectOriginType, userUnit: BattleUnit, isOwnSkill: boolean = false, isConditionActivation: boolean = false, _battleType: BattleType = 1 as BattleType): void {
        this._EffectOrigin = effectOrigin;
        this._UserUnitId = userUnit == null ? 0 : userUnit.Id;
        this.IsConditionActivation = isConditionActivation;
        // a timed state the holder gave itself skips the countdown of the turn it was applied in
        if (isOwnSkill && this._EffectTurn !== UnitStateBase.EffectTurnOfPermanent) this.IsExemptPassingTurnOnce = true;
    }
    /** @rva 0x170A200  public void PassingTurn(int turnNum) { } */
    PassingTurn(turnNum: int): void {
        if (this.IsExemptPassingTurnOnce) {
            this.IsExemptPassingTurnOnce = false;
            turnNum = turnNum - 1;
        }
        if (this._RemainingTurn < turnNum) this._RemainingTurn = 0;
        else this._RemainingTurn = this._RemainingTurn - turnNum;
    }
    /** @rva 0x1709BF0  public void AddEffectTurn(int turnNum) { } */
    AddEffectTurn(turnNum: int): void {
        if (this._EffectTurn === UnitStateBase.EffectTurnOfPermanent) return;
        this._EffectTurn = this._EffectTurn + turnNum;
        this._RemainingTurn = this._EffectTurn;
    }
    /** @rva 0x1709C50  public void AddRemainingTurn(int turnNum) { } */
    AddRemainingTurn(turnNum: int): void {
        if (this._EffectTurn === UnitStateBase.EffectTurnOfPermanent) return;
        this._RemainingTurn = this._RemainingTurn + turnNum;
        if (this._EffectTurn < this._RemainingTurn) this._EffectTurn = this._RemainingTurn;
    }
    /** @rva 0x1709D30  public void DecreaseRemainingTurn(int turnNum) { } */
    DecreaseRemainingTurn(turnNum: int): void {
        if (this._EffectTurn === UnitStateBase.EffectTurnOfPermanent) return;
        this._RemainingTurn = Math.max(0, this._RemainingTurn - turnNum);
    }
    /** @rva 0x72F170 slot 18  public virtual void OnAddedToCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnAddedToCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void { /* asm: ret 0 */ }
    /** @rva 0x72F170 slot 19  public virtual void OnRemovingFromCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnRemovingFromCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void { /* asm: ret 0 */ }
    /** @rva 0x7350C0 slot 20  public virtual bool get_ShouldRemoveStateByHolderDeath() { } */
    get_ShouldRemoveStateByHolderDeath(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x76E830 slot 21  public virtual bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76E830 slot 22  public virtual bool IsPriorityOver(UnitStateBase compareState) { } */
    IsPriorityOver(compareState: UnitStateBase): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x170A130  public bool IsActive(BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle) { } */
    IsActive$ConditionCheckDataBundle(conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle): boolean {
        // BattleConditionUtils.IsMatchConditionSets(list, bundle, SkillActive) 0x17e33b0, inlined in the game
        return BattleConditionUtils.IsMatchConditionSets$ListBattleConditionUtilsConditionSet_ConditionCheckDataBundle_ConditionUseType(
            this.ActiveConditionSetList, conditionCheckDataBundle, ConditionUseType.SkillActive);
    }
    /** @rva 0x170A050  public bool IsActive(BattleUnit unit) { } */
    IsActive$BattleUnit(unit: BattleUnit): boolean {
        // the holder's activeConditionCheckDataBundle (+0x90); the rest is IsActive(bundle) inlined
        return this.IsActive$ConditionCheckDataBundle(unit.activeConditionCheckDataBundle);
    }
    /** @rva 0x1709F00  public float GetProcessedProbability(BattleUnit targetUnit, BattleUnit userUnit) { } */
    GetProcessedProbability(targetUnit: BattleUnit, userUnit: BattleUnit): float {
        if (this._IsFixedProbability) return this._Probability;
        const hitRate = userUnit != null ? userUnit.GetTotalEffectHitRate(this) : 1;
        const parryRate = targetUnit.GetTotalEffectParryRate(this);
        const secondaryParryRate = targetUnit.GetTotalSecondaryEffectParryRate$UnitStateBase(this);
        // float multiplications in this order (asm 0x16dfae0): Probability * hit * parry * secondary
        const raw = f32(f32(f32(this._Probability * hitRate) * parryRate) * secondaryParryRate);
        const v = MathExtension.Floor(raw, 2);
        if (0 > v) return 0;
        return v > 100 ? 100 : v;
    }
    /** @rva 0x1709DD0 slot 23  public virtual List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(_userUnit: BattleUnit, targetUnitList: List<BattleUnit>, _skillType: SkillType, _effectRange: RangeType, _gameDirector: GameDirectorBase): List<BattleUnit> {
        return targetUnitList.filter(x => !x.IsDead); // <GetAIFilteredTargets>b__112_0 0x14a9560
    }
    /** @rva -1 slot 24  public abstract AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits); */
    abstract GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder;
}

// ---- ReDriveBattleCore.UnitState.UnitStateBase.DirectionType  (TypeDefIndex 686, public enum) ----
export const UnitStateBase_DirectionType = {
    Positive: 0,
    Negative: 1,
    Neutral: 2,
} as const;
export type UnitStateBase_DirectionType = (typeof UnitStateBase_DirectionType)[keyof typeof UnitStateBase_DirectionType];
