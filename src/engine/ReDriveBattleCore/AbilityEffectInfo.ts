// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { RangeType } from "../Network/Definition/Battle/RangeType";
import { TargetRoleType } from "../Network/Definition/Battle/TargetRoleType";
import { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import { EnumUtil } from "./EnumUtil";
import { notPorted, orderBy } from "../runtime";
import type { List, int } from "../runtime";
import type { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";

import type { ProcessTiming } from "./BattleCondition/ProcessTiming";
import type { PassiveSkillDetailMstModel } from "./Model/PassiveSkillDetailMstModel";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";

// ---- ReDriveBattleCore.AbilityEffectInfo  (TypeDefIndex 276, public class) ----
export class AbilityEffectInfo {
    /** 0x10 private AbilitySourceType <AbilitySource>k__BackingField */
    _AbilitySource: AbilitySourceType = 0 as AbilitySourceType;
    /** 0x14 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x18 private int <SkillUniqueId>k__BackingField */
    _SkillUniqueId: int = 0;
    /** 0x20 private string <EffectType>k__BackingField */
    _EffectType: string = null!;
    /** 0x28 private RangeType <EffectRange>k__BackingField */
    _EffectRange: RangeType = 0 as RangeType;
    /** 0x2C private TargetElementType <TargetElement>k__BackingField */
    _TargetElement: TargetElementType = 0 as TargetElementType;
    /** 0x30 private TargetRoleType <TargetRole>k__BackingField */
    _TargetRole: TargetRoleType = 0 as TargetRoleType;
    /** 0x34 private int <EffectValue1>k__BackingField */
    _EffectValue1: int = 0;
    /** 0x38 private int <EffectValue2>k__BackingField */
    _EffectValue2: int = 0;
    /** 0x3C private int <EffectValue3>k__BackingField */
    _EffectValue3: int = 0;
    /** 0x40 private int <EffectValue4>k__BackingField */
    _EffectValue4: int = 0;
    /** 0x44 private int <EffectValue5>k__BackingField */
    _EffectValue5: int = 0;
    /** 0x48 private int <EffectTurn>k__BackingField */
    _EffectTurn: int = 0;
    /** 0x4C private int <RemainCount>k__BackingField */
    _RemainCount: int = 0;
    /** 0x50 private int <Probability>k__BackingField */
    _Probability: int = 0;
    /** 0x54 private bool <IsFixedProbability>k__BackingField */
    _IsFixedProbability: boolean = false;
    /** 0x58 private List<ProcessTiming> <StartTimings>k__BackingField */
    _StartTimings: List<ProcessTiming> = null!;
    /** 0x60 private string <StartConditionSetIdCsv>k__BackingField */
    _StartConditionSetIdCsv: string = null!;
    /** 0x68 private string <ActiveConditionSetIdCsv>k__BackingField */
    _ActiveConditionSetIdCsv: string = null!;
    /** 0x70 private string <SkillButtonIcon>k__BackingField */
    _SkillButtonIcon: string = null!;
    get AbilitySource(): AbilitySourceType { return this.get_AbilitySource(); }
    set AbilitySource(v: AbilitySourceType) { this.set_AbilitySource(v); }
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get SkillUniqueId(): int { return this.get_SkillUniqueId(); }
    set SkillUniqueId(v: int) { this.set_SkillUniqueId(v); }
    get EffectType(): string { return this.get_EffectType(); }
    set EffectType(v: string) { this.set_EffectType(v); }
    get EffectRange(): RangeType { return this.get_EffectRange(); }
    set EffectRange(v: RangeType) { this.set_EffectRange(v); }
    get TargetElement(): TargetElementType { return this.get_TargetElement(); }
    set TargetElement(v: TargetElementType) { this.set_TargetElement(v); }
    get TargetRole(): TargetRoleType { return this.get_TargetRole(); }
    set TargetRole(v: TargetRoleType) { this.set_TargetRole(v); }
    get EffectValue1(): int { return this.get_EffectValue1(); }
    set EffectValue1(v: int) { this.set_EffectValue1(v); }
    get EffectValue2(): int { return this.get_EffectValue2(); }
    set EffectValue2(v: int) { this.set_EffectValue2(v); }
    get EffectValue3(): int { return this.get_EffectValue3(); }
    set EffectValue3(v: int) { this.set_EffectValue3(v); }
    get EffectValue4(): int { return this.get_EffectValue4(); }
    set EffectValue4(v: int) { this.set_EffectValue4(v); }
    get EffectValue5(): int { return this.get_EffectValue5(); }
    set EffectValue5(v: int) { this.set_EffectValue5(v); }
    get EffectTurn(): int { return this.get_EffectTurn(); }
    set EffectTurn(v: int) { this.set_EffectTurn(v); }
    get RemainCount(): int { return this.get_RemainCount(); }
    set RemainCount(v: int) { this.set_RemainCount(v); }
    get Probability(): int { return this.get_Probability(); }
    set Probability(v: int) { this.set_Probability(v); }
    get IsFixedProbability(): boolean { return this.get_IsFixedProbability(); }
    set IsFixedProbability(v: boolean) { this.set_IsFixedProbability(v); }
    get StartTimings(): List<ProcessTiming> { return this.get_StartTimings(); }
    set StartTimings(v: List<ProcessTiming>) { this.set_StartTimings(v); }
    get StartConditionSetIdCsv(): string { return this.get_StartConditionSetIdCsv(); }
    set StartConditionSetIdCsv(v: string) { this.set_StartConditionSetIdCsv(v); }
    get ActiveConditionSetIdCsv(): string { return this.get_ActiveConditionSetIdCsv(); }
    set ActiveConditionSetIdCsv(v: string) { this.set_ActiveConditionSetIdCsv(v); }
    get SkillButtonIcon(): string { return this.get_SkillButtonIcon(); }
    set SkillButtonIcon(v: string) { this.set_SkillButtonIcon(v); }
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
    /** @rva 0x7627A0  public RangeType get_EffectRange() { } */
    get_EffectRange(): RangeType { return this._EffectRange; /* auto-property */ }
    /** @rva 0x8A1250  public void set_EffectRange(RangeType value) { } */
    set_EffectRange(value: RangeType): void { this._EffectRange = value; /* auto-property */ }
    /** @rva 0x85D530  public TargetElementType get_TargetElement() { } */
    get_TargetElement(): TargetElementType { return this._TargetElement; /* auto-property */ }
    /** @rva 0x8A1260  public void set_TargetElement(TargetElementType value) { } */
    set_TargetElement(value: TargetElementType): void { this._TargetElement = value; /* auto-property */ }
    /** @rva 0x75DD60  public TargetRoleType get_TargetRole() { } */
    get_TargetRole(): TargetRoleType { return this._TargetRole; /* auto-property */ }
    /** @rva 0x8735A0  public void set_TargetRole(TargetRoleType value) { } */
    set_TargetRole(value: TargetRoleType): void { this._TargetRole = value; /* auto-property */ }
    /** @rva 0x75DD50  public int get_EffectValue1() { } */
    get_EffectValue1(): int { return this._EffectValue1; /* auto-property */ }
    /** @rva 0x8A12A0  public void set_EffectValue1(int value) { } */
    set_EffectValue1(value: int): void { this._EffectValue1 = value; /* auto-property */ }
    /** @rva 0x75DDA0  public int get_EffectValue2() { } */
    get_EffectValue2(): int { return this._EffectValue2; /* auto-property */ }
    /** @rva 0x8A12B0  public void set_EffectValue2(int value) { } */
    set_EffectValue2(value: int): void { this._EffectValue2 = value; /* auto-property */ }
    /** @rva 0x8F2F40  public int get_EffectValue3() { } */
    get_EffectValue3(): int { return this._EffectValue3; /* auto-property */ }
    /** @rva 0x900870  public void set_EffectValue3(int value) { } */
    set_EffectValue3(value: int): void { this._EffectValue3 = value; /* auto-property */ }
    /** @rva 0x7660B0  public int get_EffectValue4() { } */
    get_EffectValue4(): int { return this._EffectValue4; /* auto-property */ }
    /** @rva 0x766A90  public void set_EffectValue4(int value) { } */
    set_EffectValue4(value: int): void { this._EffectValue4 = value; /* auto-property */ }
    /** @rva 0x900840  public int get_EffectValue5() { } */
    get_EffectValue5(): int { return this._EffectValue5; /* auto-property */ }
    /** @rva 0x900880  public void set_EffectValue5(int value) { } */
    set_EffectValue5(value: int): void { this._EffectValue5 = value; /* auto-property */ }
    /** @rva 0x853810  public int get_EffectTurn() { } */
    get_EffectTurn(): int { return this._EffectTurn; /* auto-property */ }
    /** @rva 0x9007A0  public void set_EffectTurn(int value) { } */
    set_EffectTurn(value: int): void { this._EffectTurn = value; /* auto-property */ }
    /** @rva 0x87ACD0  public int get_RemainCount() { } */
    get_RemainCount(): int { return this._RemainCount; /* auto-property */ }
    /** @rva 0x900790  public void set_RemainCount(int value) { } */
    set_RemainCount(value: int): void { this._RemainCount = value; /* auto-property */ }
    /** @rva 0x7535F0  public int get_Probability() { } */
    get_Probability(): int { return this._Probability; /* auto-property */ }
    /** @rva 0x7538B0  public void set_Probability(int value) { } */
    set_Probability(value: int): void { this._Probability = value; /* auto-property */ }
    /** @rva 0x87AB30  public bool get_IsFixedProbability() { } */
    get_IsFixedProbability(): boolean { return this._IsFixedProbability; /* auto-property */ }
    /** @rva 0xA31610  public void set_IsFixedProbability(bool value) { } */
    set_IsFixedProbability(value: boolean): void { this._IsFixedProbability = value; /* auto-property */ }
    /** @rva 0x735900  public List<ProcessTiming> get_StartTimings() { } */
    get_StartTimings(): List<ProcessTiming> { return this._StartTimings; /* auto-property */ }
    /** @rva 0x735A10  public void set_StartTimings(List<ProcessTiming> value) { } */
    set_StartTimings(value: List<ProcessTiming>): void { this._StartTimings = value; /* auto-property */ }
    /** @rva 0x736A10  public string get_StartConditionSetIdCsv() { } */
    get_StartConditionSetIdCsv(): string { return this._StartConditionSetIdCsv; /* auto-property */ }
    /** @rva 0x736A50  public void set_StartConditionSetIdCsv(string value) { } */
    set_StartConditionSetIdCsv(value: string): void { this._StartConditionSetIdCsv = value; /* auto-property */ }
    /** @rva 0x736A30  public string get_ActiveConditionSetIdCsv() { } */
    get_ActiveConditionSetIdCsv(): string { return this._ActiveConditionSetIdCsv; /* auto-property */ }
    /** @rva 0x736A70  public void set_ActiveConditionSetIdCsv(string value) { } */
    set_ActiveConditionSetIdCsv(value: string): void { this._ActiveConditionSetIdCsv = value; /* auto-property */ }
    /** @rva 0x736A20  public string get_SkillButtonIcon() { } */
    get_SkillButtonIcon(): string { return this._SkillButtonIcon; /* auto-property */ }
    /** @rva 0x736A60  public void set_SkillButtonIcon(string value) { } */
    set_SkillButtonIcon(value: string): void { this._SkillButtonIcon = value; /* auto-property */ }
    /** @rva 0xB61F10  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; mov dword ptr [rcx + 0x10], 1; jmp 0x730170 */ }
    /** @rva 0x1399C70  public void .ctor(int mstId, string effectType, TargetElementType targetElement, TargetRoleType targetRole, int effectTurn, RangeType effectRange, int probability, int effectValue1, int effectValue2 = 0, int effectValue3 = 0, int effectValue4 = 0, int effectValue5 = 0, int remainCount = 0, bool isFixedProbability = False, List<ProcessTiming> startTimings, string startConditionSetIdCsv, string activeConditionSetIdCsv, AbilitySourceType abilitySource = 1, int skillUniqueId = 0) { } */
    ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(mstId: int, effectType: string, targetElement: TargetElementType, targetRole: TargetRoleType, effectTurn: int, effectRange: RangeType, probability: int, effectValue1: int, effectValue2: int = 0, effectValue3: int = 0, effectValue4: int = 0, effectValue5: int = 0, remainCount: int = 0, isFixedProbability: boolean = false, startTimings: List<ProcessTiming> = null!, startConditionSetIdCsv: string = null!, activeConditionSetIdCsv: string = null!, abilitySource: AbilitySourceType = 1 as AbilitySourceType, skillUniqueId: int = 0): this {
        this._AbilitySource = 1 as AbilitySourceType; // field initializer
        this._AbilitySource = abilitySource;
        this._SkillUniqueId = skillUniqueId;
        this._MstId = mstId;
        this._EffectType = effectType;
        this._TargetRole = targetRole;
        this._EffectValue1 = effectValue1;
        this._EffectValue2 = effectValue2;
        this._EffectValue3 = effectValue3;
        this._EffectValue4 = effectValue4;
        this._EffectValue5 = effectValue5;
        this._EffectTurn = effectTurn;
        this._RemainCount = remainCount;
        this._EffectRange = effectRange;
        this._Probability = probability;
        this._IsFixedProbability = isFixedProbability;
        this._TargetElement = targetElement;
        this._StartTimings = startTimings;
        this._StartConditionSetIdCsv = startConditionSetIdCsv;
        this._ActiveConditionSetIdCsv = activeConditionSetIdCsv;
        return this;
    }
    /** @rva 0x1399970  public static AbilityEffectInfo CreateFromMst(SkillDetailMstModel skillDetailMst, int skillUniqueId = 0) { } */
    static CreateFromMst$SkillDetailMstModel_int(skillDetailMst: SkillDetailMstModel, skillUniqueId: int = 0): AbilityEffectInfo {
        const r = skillDetailMst.record;
        return new AbilityEffectInfo().ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(
            r.skillDetailMstId, r.abilityEffectType,
            EnumUtil.Cast<TargetElementType>(TargetElementType, r.element), EnumUtil.Cast<TargetRoleType>(TargetRoleType, r.role),
            r.turn, EnumUtil.Cast<RangeType>(RangeType, r.range), r.probability,
            r.value1, r.value2, r.value3, r.value4, r.value5, r.remainCount, r.isFixedProbability,
            [], r.startConditionSetIdCsv, r.activeConditionSetIdCsv, 1 as AbilitySourceType, skillUniqueId);
    }
    /** @rva -1  public static List<AbilityEffectInfo> CreateFromMst<TEnumerable>(TEnumerable skillDetailMstList, int skillUniqueId = 0) { } */
    static CreateFromMst$TEnumerable_int<TEnumerable>(skillDetailMstList: TEnumerable, skillUniqueId: int = 0): List<AbilityEffectInfo> {
        // shared instance 0x2745490: OrderBy(<CreateFromMst>b__83_0: SkillDetailMstId).Select(DisplayClass83_0 b__1).ToList()
        return orderBy(skillDetailMstList as unknown as SkillDetailMstModel[], mst => mst.SkillDetailMstId)
            .map(mst => AbilityEffectInfo.CreateFromMst$SkillDetailMstModel_int(mst, skillUniqueId));
    }
    /** @rva 0x13996D0  public static AbilityEffectInfo CreateFromMst(PassiveSkillDetailMstModel mst, AbilitySourceType abilitySource = 1, string skillButtonIcon) { } */
    static CreateFromMst$PassiveSkillDetailMstModel_AbilitySourceType_string(mst: PassiveSkillDetailMstModel, abilitySource: AbilitySourceType = 1 as AbilitySourceType, skillButtonIcon: string = null!): AbilityEffectInfo {
        // .ctor inlined (effectValue4/5 and skillUniqueId left 0)
        const r = mst.record;
        const info = new AbilityEffectInfo().ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(
            r.passiveSkillDetailMstId, r.abilityEffectType,
            EnumUtil.Cast<TargetElementType>(TargetElementType, r.element), EnumUtil.Cast<TargetRoleType>(TargetRoleType, r.role),
            r.turn, EnumUtil.Cast<RangeType>(RangeType, r.range), r.probability,
            r.value1, r.value2, r.value3, 0, 0, r.remainCount, r.isFixedProbability,
            mst.StartTimings, r.startConditionSetIdCsv, r.activeConditionSetIdCsv, abilitySource, 0);
        info._SkillButtonIcon = skillButtonIcon;
        return info;
    }
    /** @rva 0x13994F0  public static List<AbilityEffectInfo> CreateFromMst(List<PassiveSkillDetailMstModel> mstList, AbilitySourceType abilitySource = 1, string skillButtonIcon) { } */
    static CreateFromMst$ListPassiveSkillDetailMstModel_AbilitySourceType_string(mstList: List<PassiveSkillDetailMstModel>, abilitySource: AbilitySourceType = 1 as AbilitySourceType, skillButtonIcon: string = null!): List<AbilityEffectInfo> {
        return orderBy(mstList, mst => mst.PassiveSkillDetailMstId) // <CreateFromMst>b__85_0
            .map(mst => AbilityEffectInfo.CreateFromMst$PassiveSkillDetailMstModel_AbilitySourceType_string(mst, abilitySource, skillButtonIcon)); // DisplayClass85_0 b__1
    }
}
