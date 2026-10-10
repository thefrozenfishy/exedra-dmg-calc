// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { AbilitySourceType } from "../../Network/Definition/Battle/AbilitySourceType";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleConditionUtils_ConditionCheckDataBundle, BattleConditionUtils_ConditionSet } from "../BattleCondition/BattleConditionUtils";
import type { ProcessTiming } from "../BattleCondition/ProcessTiming";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.AbilityEffectBase  (TypeDefIndex 1130, public abstract class) ----
export abstract class AbilityEffectBase {
    /** 0x10 private AbilitySourceType <AbilitySource>k__BackingField */
    _AbilitySource: AbilitySourceType = 0 as AbilitySourceType;
    /** 0x18 private string <EffectType>k__BackingField */
    _EffectType: string = null!;
    /** 0x20 private RangeType <EffectRange>k__BackingField */
    _EffectRange: RangeType = 0 as RangeType;
    /** 0x24 private AbilityEffectBase.TargetSideType <TargetSide>k__BackingField */
    _TargetSide: AbilityEffectBase_TargetSideType = 0 as AbilityEffectBase_TargetSideType;
    /** 0x28 private bool <IsIncludeDeadUnitInTarget>k__BackingField */
    _IsIncludeDeadUnitInTarget: boolean = false;
    /** 0x30 private List<int> <TargetUnitIdList>k__BackingField */
    _TargetUnitIdList: List<int> = null!;
    /** 0x38 private List<ProcessTiming> <StartTimings>k__BackingField */
    _StartTimings: List<ProcessTiming> = null!;
    /** 0x40 private string <StartConditionSetIdCsv>k__BackingField */
    _StartConditionSetIdCsv: string = null!;
    /** 0x48 private string <ActiveConditionSetIdCsv>k__BackingField */
    _ActiveConditionSetIdCsv: string = null!;
    /** 0x50 private List<BattleConditionUtils.ConditionSet> startConditionSetList */
    startConditionSetList: List<BattleConditionUtils_ConditionSet> = null!;
    /** 0x58 private int <DetailMstId>k__BackingField */
    _DetailMstId: int = 0;
    get AbilitySource(): AbilitySourceType { return this.get_AbilitySource(); }
    set AbilitySource(v: AbilitySourceType) { this.set_AbilitySource(v); }
    get EffectType(): string { return this.get_EffectType(); }
    set EffectType(v: string) { this.set_EffectType(v); }
    get EffectRange(): RangeType { return this.get_EffectRange(); }
    set EffectRange(v: RangeType) { this.set_EffectRange(v); }
    get TargetSide(): AbilityEffectBase_TargetSideType { return this.get_TargetSide(); }
    set TargetSide(v: AbilityEffectBase_TargetSideType) { this.set_TargetSide(v); }
    get IsIncludeDeadUnitInTarget(): boolean { return this.get_IsIncludeDeadUnitInTarget(); }
    set IsIncludeDeadUnitInTarget(v: boolean) { this.set_IsIncludeDeadUnitInTarget(v); }
    get TargetUnitIdList(): List<int> { return this.get_TargetUnitIdList(); }
    set TargetUnitIdList(v: List<int>) { this.set_TargetUnitIdList(v); }
    get StartTimings(): List<ProcessTiming> { return this.get_StartTimings(); }
    set StartTimings(v: List<ProcessTiming>) { this.set_StartTimings(v); }
    get StartConditionSetIdCsv(): string { return this.get_StartConditionSetIdCsv(); }
    set StartConditionSetIdCsv(v: string) { this.set_StartConditionSetIdCsv(v); }
    get ActiveConditionSetIdCsv(): string { return this.get_ActiveConditionSetIdCsv(); }
    set ActiveConditionSetIdCsv(v: string) { this.set_ActiveConditionSetIdCsv(v); }
    get StartConditionSetList(): List<BattleConditionUtils_ConditionSet> { return this.get_StartConditionSetList(); }
    get DetailMstId(): int { return this.get_DetailMstId(); }
    set DetailMstId(v: int) { this.set_DetailMstId(v); }
    get IsConditionActivation(): boolean { return this.get_IsConditionActivation(); }
    /** @rva 0x7364F0  public AbilitySourceType get_AbilitySource() { } */
    get_AbilitySource(): AbilitySourceType { return this._AbilitySource; /* auto-property */ }
    /** @rva 0x739D00  public void set_AbilitySource(AbilitySourceType value) { } */
    set_AbilitySource(value: AbilitySourceType): void { this._AbilitySource = value; /* auto-property */ }
    /** @rva 0x733E90  public string get_EffectType() { } */
    get_EffectType(): string { return this._EffectType; /* auto-property */ }
    /** @rva 0x736AB0  public void set_EffectType(string value) { } */
    set_EffectType(value: string): void { this._EffectType = value; /* auto-property */ }
    /** @rva 0x75ED70  public RangeType get_EffectRange() { } */
    get_EffectRange(): RangeType { return this._EffectRange; /* auto-property */ }
    /** @rva 0x8A2230  public void set_EffectRange(RangeType value) { } */
    set_EffectRange(value: RangeType): void { this._EffectRange = value; /* auto-property */ }
    /** @rva 0x75A830  public AbilityEffectBase.TargetSideType get_TargetSide() { } */
    get_TargetSide(): AbilityEffectBase_TargetSideType { return this._TargetSide; /* auto-property */ }
    /** @rva 0x75A840  public void set_TargetSide(AbilityEffectBase.TargetSideType value) { } */
    set_TargetSide(value: AbilityEffectBase_TargetSideType): void { this._TargetSide = value; /* auto-property */ }
    /** @rva 0x73A4E0  public bool get_IsIncludeDeadUnitInTarget() { } */
    get_IsIncludeDeadUnitInTarget(): boolean { return this._IsIncludeDeadUnitInTarget; /* auto-property */ }
    /** @rva 0x73A4F0  public void set_IsIncludeDeadUnitInTarget(bool value) { } */
    set_IsIncludeDeadUnitInTarget(value: boolean): void { this._IsIncludeDeadUnitInTarget = value; /* auto-property */ }
    /** @rva 0x736F00  public List<int> get_TargetUnitIdList() { } */
    get_TargetUnitIdList(): List<int> { return this._TargetUnitIdList; /* auto-property */ }
    /** @rva 0x736F30  public void set_TargetUnitIdList(List<int> value) { } */
    set_TargetUnitIdList(value: List<int>): void { this._TargetUnitIdList = value; /* auto-property */ }
    /** @rva 0x736970  public List<ProcessTiming> get_StartTimings() { } */
    get_StartTimings(): List<ProcessTiming> { return this._StartTimings; /* auto-property */ }
    /** @rva 0x736A30  public void set_StartTimings(List<ProcessTiming> value) { } */
    set_StartTimings(value: List<ProcessTiming>): void { this._StartTimings = value; /* auto-property */ }
    /** @rva 0x7368E0  public string get_StartConditionSetIdCsv() { } */
    get_StartConditionSetIdCsv(): string { return this._StartConditionSetIdCsv; /* auto-property */ }
    /** @rva 0x736F20  public void set_StartConditionSetIdCsv(string value) { } */
    set_StartConditionSetIdCsv(value: string): void { this._StartConditionSetIdCsv = value; /* auto-property */ }
    /** @rva 0x7368F0  public string get_ActiveConditionSetIdCsv() { } */
    get_ActiveConditionSetIdCsv(): string { return this._ActiveConditionSetIdCsv; /* auto-property */ }
    /** @rva 0x736A00  public void set_ActiveConditionSetIdCsv(string value) { } */
    set_ActiveConditionSetIdCsv(value: string): void { this._ActiveConditionSetIdCsv = value; /* auto-property */ }
    /** @rva 0x18E8970  public List<BattleConditionUtils.ConditionSet> get_StartConditionSetList() { } */
    get_StartConditionSetList(): List<BattleConditionUtils_ConditionSet> { return notPorted("AbilityEffectBase.get_StartConditionSetList", 0x18E8970); }
    /** @rva 0x737C40  public int get_DetailMstId() { } */
    get_DetailMstId(): int { return this._DetailMstId; /* auto-property */ }
    /** @rva 0x737DF0  public void set_DetailMstId(int value) { } */
    set_DetailMstId(value: int): void { this._DetailMstId = value; /* auto-property */ }
    /** @rva 0x18E88E0  public bool get_IsConditionActivation() { } */
    get_IsConditionActivation(): boolean { return notPorted("AbilityEffectBase.get_IsConditionActivation", 0x18E88E0); }
    /** @rva 0x18E8810  protected void .ctor() { } */
    ctor(): this { return notPorted("AbilityEffectBase..ctor", 0x18E8810); }
    /** @rva 0x18E86B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("AbilityEffectBase..ctor", 0x18E86B0); }
    /** @rva 0x18E78C0  public bool CheckStartConditionSets(BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle) { } */
    CheckStartConditionSets(conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle): boolean { return notPorted("AbilityEffectBase.CheckStartConditionSets", 0x18E78C0); }
    /** @rva 0x18E7E60 slot 4  public virtual void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void { return notPorted("AbilityEffectBase.SelectTargets", 0x18E7E60); }
    /** @rva 0x18E7BB0  public void SelectTargetsConditionCheck(Dictionary<int, BattleUnit> targetUnitDic, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle) { } */
    SelectTargetsConditionCheck(targetUnitDic: Dictionary<int, BattleUnit>, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle): void { return notPorted("AbilityEffectBase.SelectTargetsConditionCheck", 0x18E7BB0); }
    /** @rva -1 slot 5  public abstract AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector); */
    abstract Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle;
    /** @rva 0x746DC0 slot 6  public virtual List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("AbilityEffectBase.GetAIFilteredTargets", 0x746DC0); }
    /** @rva 0x18E7990 slot 7  public virtual int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("AbilityEffectBase.SelectTargetInAIAction", 0x18E7990); }
}

// ---- ReDriveBattleCore.AbilityEffect.AbilityEffectBase.TargetSideType  (TypeDefIndex 1127, public enum) ----
export const AbilityEffectBase_TargetSideType = {
    Friend: 0,
    Opponent: 1,
} as const;
export type AbilityEffectBase_TargetSideType = (typeof AbilityEffectBase_TargetSideType)[keyof typeof AbilityEffectBase_TargetSideType];
