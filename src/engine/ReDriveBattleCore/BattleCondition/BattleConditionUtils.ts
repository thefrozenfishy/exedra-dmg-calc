// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, HashSet, List, float, int } from "../../runtime";
import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { ActBase } from "../Act/ActBase";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { CompareContent } from "./CompareContent";
import type { CompareOperator } from "./CompareOperator";
import type { CompareTarget } from "./CompareTarget";
import type { ConditionUseType } from "./ConditionUseType";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";

// ---- ReDriveBattleCore.BattleCondition.BattleConditionUtils  (TypeDefIndex 1041, public class) ----
export class BattleConditionUtils {
    /** 0x0 private static readonly string IdCsvDelimiter */
    static IdCsvDelimiter: string = null!;
    /** @rva 0x17E2C20  public static List<BattleConditionUtils.ConditionSet> GetConditionSetListByIdCsv(string conditionSetMstIdCsv) { } */
    static GetConditionSetListByIdCsv(conditionSetMstIdCsv: string): List<BattleConditionUtils_ConditionSet> { return notPorted("BattleConditionUtils.GetConditionSetListByIdCsv", 0x17E2C20); }
    /** @rva 0x17E30B0  public static bool IsMatchConditionSets(string conditionSetMstIdCsv, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, ConditionUseType conditionUseType) { } */
    static IsMatchConditionSets$string_ConditionCheckDataBundle_ConditionUseType(conditionSetMstIdCsv: string, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, conditionUseType: ConditionUseType): boolean { return notPorted("BattleConditionUtils.IsMatchConditionSets", 0x17E30B0); }
    /** @rva 0x17E33B0  public static bool IsMatchConditionSets(List<BattleConditionUtils.ConditionSet> conditionSetList, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, ConditionUseType conditionUseType) { } */
    static IsMatchConditionSets$ListBattleConditionUtilsConditionSet_ConditionCheckDataBundle_ConditionUseType(conditionSetList: List<BattleConditionUtils_ConditionSet>, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, conditionUseType: ConditionUseType): boolean { return notPorted("BattleConditionUtils.IsMatchConditionSets", 0x17E33B0); }
    /** @rva 0x17E3150  public static bool IsMatchConditionSets(List<BattleConditionUtils.ConditionSet> conditionSetList, BattleUnit selfUnit, BattleUnit actorUnit, BattleUnit mainTargetUnit, BattleUnit eachTargetUnit, List<BattleUnit> friendUnits, List<BattleUnit> opponentUnits, int friendSP, int opponentSP, ActBase act, ActiveSkillBase actorActiveSkill, AbilityEffectBase actorAbilityEffect, AffectedUnitNoticeBundle affectedUnitNoticeBundle, List<BattleUnit> affectedUnits, HashSet<string> friendAppliedSkillEffectTypes, HashSet<string> opponentAppliedSkillEffectTypes, ConditionUseType conditionUseType, GameDirectorBase gameDirector) { } */
    static IsMatchConditionSets$ListBattleConditionUtilsConditionSet_BattleUnit_BattleUnit_BattleUnit_BattleUnit_ListBattleUnit_ListBattleUnit_int_int_ActBase_ActiveSkillBase_AbilityEffectBase_AffectedUnitNoticeBundle_ListBattleUnit_HashSetstring_HashSetstring_ConditionUseType_GameDirectorBase(conditionSetList: List<BattleConditionUtils_ConditionSet>, selfUnit: BattleUnit, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, eachTargetUnit: BattleUnit, friendUnits: List<BattleUnit>, opponentUnits: List<BattleUnit>, friendSP: int, opponentSP: int, act: ActBase, actorActiveSkill: ActiveSkillBase, actorAbilityEffect: AbilityEffectBase, affectedUnitNoticeBundle: AffectedUnitNoticeBundle, affectedUnits: List<BattleUnit>, friendAppliedSkillEffectTypes: HashSet<string>, opponentAppliedSkillEffectTypes: HashSet<string>, conditionUseType: ConditionUseType, gameDirector: GameDirectorBase): boolean { return notPorted("BattleConditionUtils.IsMatchConditionSets", 0x17E3150); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17E37E0  private static void .cctor() { } */
    static cctor(): void { return notPorted("BattleConditionUtils..cctor", 0x17E37E0); }
}

// ---- ReDriveBattleCore.BattleCondition.BattleConditionUtils.ConditionCheckDataBundle  (TypeDefIndex 1031, public class) ----
export class BattleConditionUtils_ConditionCheckDataBundle {
    /** 0x10 private GameDirectorBase <GameDirector>k__BackingField */
    _GameDirector: GameDirectorBase = null!;
    /** 0x18 private BattleUnit <SelfUnit>k__BackingField */
    _SelfUnit: BattleUnit = null!;
    /** 0x20 private BattleUnit <ActorUnit>k__BackingField */
    _ActorUnit: BattleUnit = null!;
    /** 0x28 private BattleUnit <MainTargetUnit>k__BackingField */
    _MainTargetUnit: BattleUnit = null!;
    /** 0x30 private BattleUnit <EachTargetUnit>k__BackingField */
    _EachTargetUnit: BattleUnit = null!;
    /** 0x38 private ActiveSkillBase <ActorActiveSkill>k__BackingField */
    _ActorActiveSkill: ActiveSkillBase = null!;
    /** 0x40 private AbilityEffectBase <ActorAbilityEffect>k__BackingField */
    _ActorAbilityEffect: AbilityEffectBase = null!;
    /** 0x48 private AffectedUnitNoticeBundle <AffectedUnitNoticeBundle>k__BackingField */
    _AffectedUnitNoticeBundle: AffectedUnitNoticeBundle = null!;
    /** 0x50 private List<BattleUnit> <AffectedUnits>k__BackingField */
    _AffectedUnits: List<BattleUnit> = null!;
    get GameDirector(): GameDirectorBase { return this.get_GameDirector(); }
    set GameDirector(v: GameDirectorBase) { this.set_GameDirector(v); }
    get SelfUnit(): BattleUnit { return this.get_SelfUnit(); }
    set SelfUnit(v: BattleUnit) { this.set_SelfUnit(v); }
    get ActorUnit(): BattleUnit { return this.get_ActorUnit(); }
    set ActorUnit(v: BattleUnit) { this.set_ActorUnit(v); }
    get MainTargetUnit(): BattleUnit { return this.get_MainTargetUnit(); }
    set MainTargetUnit(v: BattleUnit) { this.set_MainTargetUnit(v); }
    get EachTargetUnit(): BattleUnit { return this.get_EachTargetUnit(); }
    set EachTargetUnit(v: BattleUnit) { this.set_EachTargetUnit(v); }
    get ActorActiveSkill(): ActiveSkillBase { return this.get_ActorActiveSkill(); }
    set ActorActiveSkill(v: ActiveSkillBase) { this.set_ActorActiveSkill(v); }
    get ActorAbilityEffect(): AbilityEffectBase { return this.get_ActorAbilityEffect(); }
    set ActorAbilityEffect(v: AbilityEffectBase) { this.set_ActorAbilityEffect(v); }
    get AffectedUnitNoticeBundle(): AffectedUnitNoticeBundle { return this.get_AffectedUnitNoticeBundle(); }
    set AffectedUnitNoticeBundle(v: AffectedUnitNoticeBundle) { this.set_AffectedUnitNoticeBundle(v); }
    get AffectedUnits(): List<BattleUnit> { return this.get_AffectedUnits(); }
    set AffectedUnits(v: List<BattleUnit>) { this.set_AffectedUnits(v); }
    /** @rva 0x730C50  public GameDirectorBase get_GameDirector() { } */
    get_GameDirector(): GameDirectorBase { return this._GameDirector; /* auto-property */ }
    /** @rva 0x730C60  public void set_GameDirector(GameDirectorBase value) { } */
    set_GameDirector(value: GameDirectorBase): void { this._GameDirector = value; /* auto-property */ }
    /** @rva 0x733E90  public BattleUnit get_SelfUnit() { } */
    get_SelfUnit(): BattleUnit { return this._SelfUnit; /* auto-property */ }
    /** @rva 0x736AB0  public void set_SelfUnit(BattleUnit value) { } */
    set_SelfUnit(value: BattleUnit): void { this._SelfUnit = value; /* auto-property */ }
    /** @rva 0x7369E0  public BattleUnit get_ActorUnit() { } */
    get_ActorUnit(): BattleUnit { return this._ActorUnit; /* auto-property */ }
    /** @rva 0x736A50  public void set_ActorUnit(BattleUnit value) { } */
    set_ActorUnit(value: BattleUnit): void { this._ActorUnit = value; /* auto-property */ }
    /** @rva 0x736EA0  public BattleUnit get_MainTargetUnit() { } */
    get_MainTargetUnit(): BattleUnit { return this._MainTargetUnit; /* auto-property */ }
    /** @rva 0x736F10  public void set_MainTargetUnit(BattleUnit value) { } */
    set_MainTargetUnit(value: BattleUnit): void { this._MainTargetUnit = value; /* auto-property */ }
    /** @rva 0x736F00  public BattleUnit get_EachTargetUnit() { } */
    get_EachTargetUnit(): BattleUnit { return this._EachTargetUnit; /* auto-property */ }
    /** @rva 0x736F30  public void set_EachTargetUnit(BattleUnit value) { } */
    set_EachTargetUnit(value: BattleUnit): void { this._EachTargetUnit = value; /* auto-property */ }
    /** @rva 0x736970  public ActiveSkillBase get_ActorActiveSkill() { } */
    get_ActorActiveSkill(): ActiveSkillBase { return this._ActorActiveSkill; /* auto-property */ }
    /** @rva 0x736A30  public void set_ActorActiveSkill(ActiveSkillBase value) { } */
    set_ActorActiveSkill(value: ActiveSkillBase): void { this._ActorActiveSkill = value; /* auto-property */ }
    /** @rva 0x7368E0  public AbilityEffectBase get_ActorAbilityEffect() { } */
    get_ActorAbilityEffect(): AbilityEffectBase { return this._ActorAbilityEffect; /* auto-property */ }
    /** @rva 0x736F20  public void set_ActorAbilityEffect(AbilityEffectBase value) { } */
    set_ActorAbilityEffect(value: AbilityEffectBase): void { this._ActorAbilityEffect = value; /* auto-property */ }
    /** @rva 0x7368F0  public AffectedUnitNoticeBundle get_AffectedUnitNoticeBundle() { } */
    get_AffectedUnitNoticeBundle(): AffectedUnitNoticeBundle { return this._AffectedUnitNoticeBundle; /* auto-property */ }
    /** @rva 0x736A00  public void set_AffectedUnitNoticeBundle(AffectedUnitNoticeBundle value) { } */
    set_AffectedUnitNoticeBundle(value: AffectedUnitNoticeBundle): void { this._AffectedUnitNoticeBundle = value; /* auto-property */ }
    /** @rva 0x736910  public List<BattleUnit> get_AffectedUnits() { } */
    get_AffectedUnits(): List<BattleUnit> { return this._AffectedUnits; /* auto-property */ }
    /** @rva 0x736A20  public void set_AffectedUnits(List<BattleUnit> value) { } */
    set_AffectedUnits(value: List<BattleUnit>): void { this._AffectedUnits = value; /* auto-property */ }
    /** @rva 0x17EC1F0  public void RemoveTransientData() { } */
    RemoveTransientData(): void { return notPorted("BattleConditionUtils_ConditionCheckDataBundle.RemoveTransientData", 0x17EC1F0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.BattleCondition.BattleConditionUtils.ConditionSet  (TypeDefIndex 1034, public class) ----
export class BattleConditionUtils_ConditionSet {
    /** 0x10 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x18 private string <Description>k__BackingField */
    _Description: string = null!;
    /** 0x20 private List<BattleConditionUtils.Condition> <ConditionList>k__BackingField */
    _ConditionList: List<BattleConditionUtils_Condition> = null!;
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get Description(): string { return this.get_Description(); }
    set Description(v: string) { this.set_Description(v); }
    get ConditionList(): List<BattleConditionUtils_Condition> { return this.get_ConditionList(); }
    set ConditionList(v: List<BattleConditionUtils_Condition>) { this.set_ConditionList(v); }
    /** @rva 0x7364F0  public int get_MstId() { } */
    get_MstId(): int { return this._MstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_MstId(int value) { } */
    set_MstId(value: int): void { this._MstId = value; /* auto-property */ }
    /** @rva 0x733E90  public string get_Description() { } */
    get_Description(): string { return this._Description; /* auto-property */ }
    /** @rva 0x736AB0  public void set_Description(string value) { } */
    set_Description(value: string): void { this._Description = value; /* auto-property */ }
    /** @rva 0x7369E0  public List<BattleConditionUtils.Condition> get_ConditionList() { } */
    get_ConditionList(): List<BattleConditionUtils_Condition> { return this._ConditionList; /* auto-property */ }
    /** @rva 0x736A50  public void set_ConditionList(List<BattleConditionUtils.Condition> value) { } */
    set_ConditionList(value: List<BattleConditionUtils_Condition>): void { this._ConditionList = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EC510  public void .ctor(int conditionSetMstId) { } */
    ctor$int(conditionSetMstId: int): this { return notPorted("BattleConditionUtils_ConditionSet..ctor", 0x17EC510); }
    /** @rva 0x17EC2D0  public bool IsMatchConditionSet(Dictionary<int, bool> checkedConditionResults, BattleUnit selfUnit, BattleUnit actorUnit, BattleUnit mainTargetUnit, BattleUnit eachTargetUnit, List<BattleUnit> friendUnits, List<BattleUnit> opponentUnits, int friendSP, int opponentSP, ActBase act, ActiveSkillBase actorActiveSkill, AbilityEffectBase actorAbilityEffect, AffectedUnitNoticeBundle affectedUnitNoticeBundle, List<BattleUnit> affectedUnits, HashSet<string> friendAppliedSkillEffectTypes, HashSet<string> opponentAppliedSkillEffectTypes, ConditionUseType conditionUseType, GameDirectorBase gameDirector) { } */
    IsMatchConditionSet(checkedConditionResults: Dictionary<int, boolean>, selfUnit: BattleUnit, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, eachTargetUnit: BattleUnit, friendUnits: List<BattleUnit>, opponentUnits: List<BattleUnit>, friendSP: int, opponentSP: int, act: ActBase, actorActiveSkill: ActiveSkillBase, actorAbilityEffect: AbilityEffectBase, affectedUnitNoticeBundle: AffectedUnitNoticeBundle, affectedUnits: List<BattleUnit>, friendAppliedSkillEffectTypes: HashSet<string>, opponentAppliedSkillEffectTypes: HashSet<string>, conditionUseType: ConditionUseType, gameDirector: GameDirectorBase): boolean { return notPorted("BattleConditionUtils_ConditionSet.IsMatchConditionSet", 0x17EC2D0); }
}

// ---- ReDriveBattleCore.BattleCondition.BattleConditionUtils.Condition  (TypeDefIndex 1038, public class) ----
export class BattleConditionUtils_Condition {
    /** 0x10 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x18 private string <Description>k__BackingField */
    _Description: string = null!;
    /** 0x20 private CompareTarget <CompareTarget>k__BackingField */
    _CompareTarget: CompareTarget = 0 as CompareTarget;
    /** 0x24 private CompareContent <CompareContent>k__BackingField */
    _CompareContent: CompareContent = 0 as CompareContent;
    /** 0x28 private CompareOperator <CompareOperator>k__BackingField */
    _CompareOperator: CompareOperator = 0 as CompareOperator;
    /** 0x30 private string <CompareValue>k__BackingField */
    _CompareValue: string = null!;
    /** 0x38 private int compareValueInt */
    compareValueInt: int = 0;
    /** 0x3C private float compareValueFloat */
    compareValueFloat: float = 0;
    /** 0x40 private bool compareValueBool */
    compareValueBool: boolean = false;
    /** 0x41 private bool isValueParsed */
    isValueParsed: boolean = false;
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get Description(): string { return this.get_Description(); }
    set Description(v: string) { this.set_Description(v); }
    get CompareTarget(): CompareTarget { return this.get_CompareTarget(); }
    set CompareTarget(v: CompareTarget) { this.set_CompareTarget(v); }
    get CompareContent(): CompareContent { return this.get_CompareContent(); }
    set CompareContent(v: CompareContent) { this.set_CompareContent(v); }
    get CompareOperator(): CompareOperator { return this.get_CompareOperator(); }
    set CompareOperator(v: CompareOperator) { this.set_CompareOperator(v); }
    get CompareValue(): string { return this.get_CompareValue(); }
    set CompareValue(v: string) { this.set_CompareValue(v); }
    get CompareValueInt(): int { return this.get_CompareValueInt(); }
    get CompareValueFloat(): float { return this.get_CompareValueFloat(); }
    get CompareValueBool(): boolean { return this.get_CompareValueBool(); }
    /** @rva 0x7364F0  public int get_MstId() { } */
    get_MstId(): int { return this._MstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_MstId(int value) { } */
    set_MstId(value: int): void { this._MstId = value; /* auto-property */ }
    /** @rva 0x733E90  public string get_Description() { } */
    get_Description(): string { return this._Description; /* auto-property */ }
    /** @rva 0x736AB0  public void set_Description(string value) { } */
    set_Description(value: string): void { this._Description = value; /* auto-property */ }
    /** @rva 0x75ED70  public CompareTarget get_CompareTarget() { } */
    get_CompareTarget(): CompareTarget { return this._CompareTarget; /* auto-property */ }
    /** @rva 0x8A2230  public void set_CompareTarget(CompareTarget value) { } */
    set_CompareTarget(value: CompareTarget): void { this._CompareTarget = value; /* auto-property */ }
    /** @rva 0x75A830  public CompareContent get_CompareContent() { } */
    get_CompareContent(): CompareContent { return this._CompareContent; /* auto-property */ }
    /** @rva 0x75A840  public void set_CompareContent(CompareContent value) { } */
    set_CompareContent(value: CompareContent): void { this._CompareContent = value; /* auto-property */ }
    /** @rva 0x7637A0  public CompareOperator get_CompareOperator() { } */
    get_CompareOperator(): CompareOperator { return this._CompareOperator; /* auto-property */ }
    /** @rva 0x8A2250  public void set_CompareOperator(CompareOperator value) { } */
    set_CompareOperator(value: CompareOperator): void { this._CompareOperator = value; /* auto-property */ }
    /** @rva 0x736F00  public string get_CompareValue() { } */
    get_CompareValue(): string { return this._CompareValue; /* auto-property */ }
    /** @rva 0x736F30  public void set_CompareValue(string value) { } */
    set_CompareValue(value: string): void { this._CompareValue = value; /* auto-property */ }
    /** @rva 0x17EDB60  public int get_CompareValueInt() { } */
    get_CompareValueInt(): int { return notPorted("BattleConditionUtils_Condition.get_CompareValueInt", 0x17EDB60); }
    /** @rva 0x17EDB20  public float get_CompareValueFloat() { } */
    get_CompareValueFloat(): float { return notPorted("BattleConditionUtils_Condition.get_CompareValueFloat", 0x17EDB20); }
    /** @rva 0x17EDAB0  public bool get_CompareValueBool() { } */
    get_CompareValueBool(): boolean { return notPorted("BattleConditionUtils_Condition.get_CompareValueBool", 0x17EDAB0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17ED950  public void .ctor(int conditionMstId) { } */
    ctor$int(conditionMstId: int): this { return notPorted("BattleConditionUtils_Condition..ctor", 0x17ED950); }
    /** @rva 0x17ECA80  public bool IsMatchCondition(Dictionary<int, bool> checkedConditionResults, BattleUnit selfUnit, BattleUnit actorUnit, BattleUnit mainTargetUnit, BattleUnit eachTargetUnit, List<BattleUnit> friendUnits, List<BattleUnit> opponentUnits, int friendSP, int opponentSP, ActBase act, ActiveSkillBase actorActiveSkill, AbilityEffectBase actorAbilityEffect, AffectedUnitNoticeBundle affectedUnitNoticeBundle, List<BattleUnit> affectedUnits, HashSet<string> friendAppliedSkillEffectTypes, HashSet<string> opponentAppliedSkillEffectTypes, ConditionUseType conditionUseType, GameDirectorBase gameDirector) { } */
    IsMatchCondition(checkedConditionResults: Dictionary<int, boolean>, selfUnit: BattleUnit, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, eachTargetUnit: BattleUnit, friendUnits: List<BattleUnit>, opponentUnits: List<BattleUnit>, friendSP: int, opponentSP: int, act: ActBase, actorActiveSkill: ActiveSkillBase, actorAbilityEffect: AbilityEffectBase, affectedUnitNoticeBundle: AffectedUnitNoticeBundle, affectedUnits: List<BattleUnit>, friendAppliedSkillEffectTypes: HashSet<string>, opponentAppliedSkillEffectTypes: HashSet<string>, conditionUseType: ConditionUseType, gameDirector: GameDirectorBase): boolean { return notPorted("BattleConditionUtils_Condition.IsMatchCondition", 0x17ECA80); }
}
