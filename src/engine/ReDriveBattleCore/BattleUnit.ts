// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Decimal, List, Ref, Type, float, int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { TargetRoleType } from "../Network/Definition/Battle/TargetRoleType";
import type { DamageBaseType } from "./AbilityEffect/DamageBaseType";
import type { ActiveSkill } from "./ActiveSkill";
import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AdditionalSkill } from "./AdditionalSkill";
import type { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import type { BattleParameter } from "./BattleParameter";
import type { BattleUnitSkillSet } from "./BattleUnitSkillSet";
import type { BreakPoint } from "./BreakPoint";
import type { CharacterParameter } from "./CharacterParameter";
import type { EnemyConditionAndActionController } from "./EnemyConditionAndActionController";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { NormalAttack } from "./NormalAttack";
import type { PassiveSkill } from "./PassiveSkill";
import type { SpecialAttack } from "./SpecialAttack";
import type { UnitCondition } from "./UnitCondition";
import type { IRequiredStateForDecide } from "./UnitState/IRequiredStateForDecide";
import type { SwitchSkillUnitState } from "./UnitState/SwitchSkillUnitState";
import type { UnitStateBase } from "./UnitState/UnitStateBase";
import type { UnitTurnGauge } from "./UnitTurnGauge";

// ---- ReDriveBattleCore.BattleUnit  (TypeDefIndex 358, public class) ----
export class BattleUnit {
    /** 0x10 private int <Id>k__BackingField */
    _Id: int = 0;
    /** 0x14 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x18 private BattleUnit.TeamType <Team>k__BackingField */
    _Team: BattleUnit_TeamType = 0 as BattleUnit_TeamType;
    /** 0x20 private BattleParameter <BattleParameter>k__BackingField */
    _BattleParameter: BattleParameter = null!;
    /** 0x28 private int <MaxHP>k__BackingField */
    _MaxHP: int = 0;
    /** 0x2C private int <HP>k__BackingField */
    _HP: int = 0;
    /** 0x30 private int <EP>k__BackingField */
    _EP: int = 0;
    /** 0x34 private int <BP>k__BackingField */
    _BP: int = 0;
    /** 0x38 private int <MaxEP>k__BackingField */
    _MaxEP: int = 0;
    /** 0x3C private int <MaxBP>k__BackingField */
    _MaxBP: int = 0;
    /** 0x40 private Action<BattleUnit> onAliveStateChanged */
    onAliveStateChanged: ((a0: BattleUnit) => void) = null!;
    /** 0x48 private BattleUnitSkillSet <SkillSet>k__BackingField */
    _SkillSet: BattleUnitSkillSet = null!;
    /** 0x50 private PassiveSkill[] <PassiveSkills>k__BackingField */
    _PassiveSkills: PassiveSkill[] = null!;
    /** 0x58 private UnitCondition <Condition>k__BackingField */
    _Condition: UnitCondition = null!;
    /** 0x60 private UnitTurnGauge <TurnGauge>k__BackingField */
    _TurnGauge: UnitTurnGauge = null!;
    /** 0x68 private int <PositionId>k__BackingField */
    _PositionId: int = 0;
    /** 0x70 private ElementType[] <WeakElements>k__BackingField */
    _WeakElements: ElementType[] = null!;
    /** 0x78 private BreakPoint <BreakPoint>k__BackingField */
    _BreakPoint: BreakPoint = null!;
    /** 0x80 private int <BreakedDamageReceiveRate>k__BackingField */
    _BreakedDamageReceiveRate: int = 0;
    /** 0x84 private bool isCharacter */
    isCharacter: boolean = false;
    /** 0x85 private bool isCharacterFigure */
    isCharacterFigure: boolean = false;
    /** 0x86 private bool isNoVisualDeath */
    isNoVisualDeath: boolean = false;
    /** 0x88 private int <TurnNum>k__BackingField */
    _TurnNum: int = 0;
    /** 0x90 private BattleConditionUtils.ConditionCheckDataBundle activeConditionCheckDataBundle */
    activeConditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle = null!;
    /** 0x98 private EnemyConditionAndActionController <EnemyConditionAndActionController>k__BackingField */
    _EnemyConditionAndActionController: EnemyConditionAndActionController = null!;
    /** 0xA0 private int <InitialHpGaugeCount>k__BackingField */
    _InitialHpGaugeCount: int = 0;
    /** 0xA4 private int <CurrentHpGaugeCount>k__BackingField */
    _CurrentHpGaugeCount: int = 0;
    /** 0xA8 private PassiveSkillInfo[] serializedPassiveSkillInfos */
    serializedPassiveSkillInfos: any /* PassiveSkillInfo */[] = null!;
    /** 0xB0 private int serializedEnemyParameterMstId */
    serializedEnemyParameterMstId: int = 0;
    /** 0xB8 private BattleParameter serializeBattleParameter */
    serializeBattleParameter: BattleParameter = null!;
    get Id(): int { return this.get_Id(); }
    set Id(v: int) { this.set_Id(v); }
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get Team(): BattleUnit_TeamType { return this.get_Team(); }
    set Team(v: BattleUnit_TeamType) { this.set_Team(v); }
    get BattleParameter(): BattleParameter { return this.get_BattleParameter(); }
    set BattleParameter(v: BattleParameter) { this.set_BattleParameter(v); }
    get Param(): BattleParameter { return this.get_Param(); }
    get MaxHP(): int { return this.get_MaxHP(); }
    set MaxHP(v: int) { this.set_MaxHP(v); }
    get HP(): int { return this.get_HP(); }
    set HP(v: int) { this.set_HP(v); }
    get EP(): int { return this.get_EP(); }
    set EP(v: int) { this.set_EP(v); }
    get BP(): int { return this.get_BP(); }
    set BP(v: int) { this.set_BP(v); }
    get InitialHP(): int { return this.get_InitialHP(); }
    get MaxEP(): int { return this.get_MaxEP(); }
    set MaxEP(v: int) { this.set_MaxEP(v); }
    get MaxBP(): int { return this.get_MaxBP(); }
    set MaxBP(v: int) { this.set_MaxBP(v); }
    get ATK(): int { return this.get_ATK(); }
    get DEF(): int { return this.get_DEF(); }
    get CTR(): int { return this.get_CTR(); }
    get CTD(): int { return this.get_CTD(); }
    get Speed(): int { return this.get_Speed(); }
    get IsDead(): boolean { return this.get_IsDead(); }
    get IsDying(): boolean { return this.get_IsDying(); }
    get SkillSet(): BattleUnitSkillSet { return this.get_SkillSet(); }
    set SkillSet(v: BattleUnitSkillSet) { this.set_SkillSet(v); }
    get ActiveSkills(): ActiveSkill[] { return this.get_ActiveSkills(); }
    get SpecialAttack(): SpecialAttack { return this.get_SpecialAttack(); }
    get NormalAttack(): NormalAttack { return this.get_NormalAttack(); }
    get AdditionalSkills(): AdditionalSkill[] { return this.get_AdditionalSkills(); }
    get PassiveSkills(): PassiveSkill[] { return this.get_PassiveSkills(); }
    set PassiveSkills(v: PassiveSkill[]) { this.set_PassiveSkills(v); }
    get Condition(): UnitCondition { return this.get_Condition(); }
    set Condition(v: UnitCondition) { this.set_Condition(v); }
    get TurnGauge(): UnitTurnGauge { return this.get_TurnGauge(); }
    set TurnGauge(v: UnitTurnGauge) { this.set_TurnGauge(v); }
    get PositionId(): int { return this.get_PositionId(); }
    set PositionId(v: int) { this.set_PositionId(v); }
    get WeakElements(): ElementType[] { return this.get_WeakElements(); }
    set WeakElements(v: ElementType[]) { this.set_WeakElements(v); }
    get BreakPoint(): BreakPoint { return this.get_BreakPoint(); }
    set BreakPoint(v: BreakPoint) { this.set_BreakPoint(v); }
    get BreakedDamageReceiveRate(): int { return this.get_BreakedDamageReceiveRate(); }
    set BreakedDamageReceiveRate(v: int) { this.set_BreakedDamageReceiveRate(v); }
    get IsCharacter(): boolean { return this.get_IsCharacter(); }
    get IsCharacterFigure(): boolean { return this.get_IsCharacterFigure(); }
    get IsNoVisualDeath(): boolean { return this.get_IsNoVisualDeath(); }
    get IsEnemy(): boolean { return this.get_IsEnemy(); }
    get TurnNum(): int { return this.get_TurnNum(); }
    set TurnNum(v: int) { this.set_TurnNum(v); }
    get ActiveConditionCheckDataBundle(): BattleConditionUtils_ConditionCheckDataBundle { return this.get_ActiveConditionCheckDataBundle(); }
    get EnemyConditionAndActionController(): EnemyConditionAndActionController { return this.get_EnemyConditionAndActionController(); }
    set EnemyConditionAndActionController(v: EnemyConditionAndActionController) { this.set_EnemyConditionAndActionController(v); }
    get InitialHpGaugeCount(): int { return this.get_InitialHpGaugeCount(); }
    set InitialHpGaugeCount(v: int) { this.set_InitialHpGaugeCount(v); }
    get CurrentHpGaugeCount(): int { return this.get_CurrentHpGaugeCount(); }
    set CurrentHpGaugeCount(v: int) { this.set_CurrentHpGaugeCount(v); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    /** @rva 0x7364F0  public int get_Id() { } */
    get_Id(): int { return this._Id; /* auto-property */ }
    /** @rva 0x739D00  public void set_Id(int value) { } */
    set_Id(value: int): void { this._Id = value; /* auto-property */ }
    /** @rva 0x803350  public int get_MstId() { } */
    get_MstId(): int { return this._MstId; /* auto-property */ }
    /** @rva 0x803540  public void set_MstId(int value) { } */
    set_MstId(value: int): void { this._MstId = value; /* auto-property */ }
    /** @rva 0x763820  public BattleUnit.TeamType get_Team() { } */
    get_Team(): BattleUnit_TeamType { return this._Team; /* auto-property */ }
    /** @rva 0x8A2240  public void set_Team(BattleUnit.TeamType value) { } */
    set_Team(value: BattleUnit_TeamType): void { this._Team = value; /* auto-property */ }
    /** @rva 0x7369E0  public BattleParameter get_BattleParameter() { } */
    get_BattleParameter(): BattleParameter { return this._BattleParameter; /* auto-property */ }
    /** @rva 0x736A50  public void set_BattleParameter(BattleParameter value) { } */
    set_BattleParameter(value: BattleParameter): void { this._BattleParameter = value; /* auto-property */ }
    /** @rva 0x7369E0  public BattleParameter get_Param() { } */
    get_Param(): BattleParameter { return this._BattleParameter; /* asm: mov rax, qword ptr [rcx + 0x20]; ret */ }
    /** @rva 0x7637A0  public int get_MaxHP() { } */
    get_MaxHP(): int { return this._MaxHP; /* auto-property */ }
    /** @rva 0x8A2250  public void set_MaxHP(int value) { } */
    set_MaxHP(value: int): void { this._MaxHP = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_HP() { } */
    get_HP(): int { return this._HP; /* auto-property */ }
    /** @rva 0x8A2260  public void set_HP(int value) { } */
    set_HP(value: int): void { this._HP = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_EP() { } */
    get_EP(): int { return this._EP; /* auto-property */ }
    /** @rva 0x8745A0  public void set_EP(int value) { } */
    set_EP(value: int): void { this._EP = value; /* auto-property */ }
    /** @rva 0x75ED50  public int get_BP() { } */
    get_BP(): int { return this._BP; /* auto-property */ }
    /** @rva 0x8A22A0  public void set_BP(int value) { } */
    set_BP(value: int): void { this._BP = value; /* auto-property */ }
    /** @rva 0x138AA30  public int get_InitialHP() { } */
    get_InitialHP(): int { return notPorted("BattleUnit.get_InitialHP", 0x138AA30); }
    /** @rva 0x75EDA0  public int get_MaxEP() { } */
    get_MaxEP(): int { return this._MaxEP; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_MaxEP(int value) { } */
    set_MaxEP(value: int): void { this._MaxEP = value; /* auto-property */ }
    /** @rva 0x8F3F40  public int get_MaxBP() { } */
    get_MaxBP(): int { return this._MaxBP; /* auto-property */ }
    /** @rva 0x901F80  public void set_MaxBP(int value) { } */
    set_MaxBP(value: int): void { this._MaxBP = value; /* auto-property */ }
    /** @rva 0x138A930  public int get_ATK() { } */
    get_ATK(): int { return notPorted("BattleUnit.get_ATK", 0x138A930); }
    /** @rva 0x138AA10  public int get_DEF() { } */
    get_DEF(): int { return notPorted("BattleUnit.get_DEF", 0x138AA10); }
    /** @rva 0x9D3ED0  public int get_CTR() { } */
    get_CTR(): int { return notPorted("BattleUnit.get_CTR", 0x9D3ED0); }
    /** @rva 0x138A9F0  public int get_CTD() { } */
    get_CTD(): int { return notPorted("BattleUnit.get_CTD", 0x138A9F0); }
    /** @rva 0x138AAD0  public int get_Speed() { } */
    get_Speed(): int { return notPorted("BattleUnit.get_Speed", 0x138AAD0); }
    /** @rva 0x138AA50  public bool get_IsDead() { } */
    get_IsDead(): boolean { return notPorted("BattleUnit.get_IsDead", 0x138AA50); }
    /** @rva 0x138AA70  public bool get_IsDying() { } */
    get_IsDying(): boolean { return notPorted("BattleUnit.get_IsDying", 0x138AA70); }
    /** @rva 0x138A880  public void add_onAliveStateChanged(Action<BattleUnit> value) { } */
    add_onAliveStateChanged(value: ((a0: BattleUnit) => void)): void { return notPorted("BattleUnit.add_onAliveStateChanged", 0x138A880); }
    /** @rva 0x138AAF0  public void remove_onAliveStateChanged(Action<BattleUnit> value) { } */
    remove_onAliveStateChanged(value: ((a0: BattleUnit) => void)): void { return notPorted("BattleUnit.remove_onAliveStateChanged", 0x138AAF0); }
    /** @rva 0x7368F0  public BattleUnitSkillSet get_SkillSet() { } */
    get_SkillSet(): BattleUnitSkillSet { return this._SkillSet; /* auto-property */ }
    /** @rva 0x736A00  public void set_SkillSet(BattleUnitSkillSet value) { } */
    set_SkillSet(value: BattleUnitSkillSet): void { this._SkillSet = value; /* auto-property */ }
    /** @rva 0x138A950  public ActiveSkill[] get_ActiveSkills() { } */
    get_ActiveSkills(): ActiveSkill[] { return notPorted("BattleUnit.get_ActiveSkills", 0x138A950); }
    /** @rva 0x138AAC0  public SpecialAttack get_SpecialAttack() { } */
    get_SpecialAttack(): SpecialAttack { return notPorted("BattleUnit.get_SpecialAttack", 0x138AAC0); }
    /** @rva 0x138AAB0  public NormalAttack get_NormalAttack() { } */
    get_NormalAttack(): NormalAttack { return notPorted("BattleUnit.get_NormalAttack", 0x138AAB0); }
    /** @rva 0x138A9A0  public AdditionalSkill[] get_AdditionalSkills() { } */
    get_AdditionalSkills(): AdditionalSkill[] { return notPorted("BattleUnit.get_AdditionalSkills", 0x138A9A0); }
    /** @rva 0x736910  public PassiveSkill[] get_PassiveSkills() { } */
    get_PassiveSkills(): PassiveSkill[] { return this._PassiveSkills; /* auto-property */ }
    /** @rva 0x736A20  public void set_PassiveSkills(PassiveSkill[] value) { } */
    set_PassiveSkills(value: PassiveSkill[]): void { this._PassiveSkills = value; /* auto-property */ }
    /** @rva 0x736900  public UnitCondition get_Condition() { } */
    get_Condition(): UnitCondition { return this._Condition; /* auto-property */ }
    /** @rva 0x736A10  public void set_Condition(UnitCondition value) { } */
    set_Condition(value: UnitCondition): void { this._Condition = value; /* auto-property */ }
    /** @rva 0x737A10  public UnitTurnGauge get_TurnGauge() { } */
    get_TurnGauge(): UnitTurnGauge { return this._TurnGauge; /* auto-property */ }
    /** @rva 0x737A50  public void set_TurnGauge(UnitTurnGauge value) { } */
    set_TurnGauge(value: UnitTurnGauge): void { this._TurnGauge = value; /* auto-property */ }
    /** @rva 0x901BF0  public int get_PositionId() { } */
    get_PositionId(): int { return this._PositionId; /* auto-property */ }
    /** @rva 0x901C00  public void set_PositionId(int value) { } */
    set_PositionId(value: int): void { this._PositionId = value; /* auto-property */ }
    /** @rva 0x737A20  public ElementType[] get_WeakElements() { } */
    get_WeakElements(): ElementType[] { return this._WeakElements; /* auto-property */ }
    /** @rva 0x737A60  public void set_WeakElements(ElementType[] value) { } */
    set_WeakElements(value: ElementType[]): void { this._WeakElements = value; /* auto-property */ }
    /** @rva 0x737C60  public BreakPoint get_BreakPoint() { } */
    get_BreakPoint(): BreakPoint { return this._BreakPoint; /* auto-property */ }
    /** @rva 0x737E10  public void set_BreakPoint(BreakPoint value) { } */
    set_BreakPoint(value: BreakPoint): void { this._BreakPoint = value; /* auto-property */ }
    /** @rva 0x9028D0  public int get_BreakedDamageReceiveRate() { } */
    get_BreakedDamageReceiveRate(): int { return this._BreakedDamageReceiveRate; /* auto-property */ }
    /** @rva 0x9028E0  public void set_BreakedDamageReceiveRate(int value) { } */
    set_BreakedDamageReceiveRate(value: int): void { this._BreakedDamageReceiveRate = value; /* auto-property */ }
    /** @rva 0x9FD370  public bool get_IsCharacter() { } */
    get_IsCharacter(): boolean { return this.isCharacter; /* asm: movzx eax, byte ptr [rcx + 0x84]; ret */ }
    /** @rva 0x9FD250  public bool get_IsCharacterFigure() { } */
    get_IsCharacterFigure(): boolean { return this.isCharacterFigure; /* asm: movzx eax, byte ptr [rcx + 0x85]; ret */ }
    /** @rva 0x138AAA0  public bool get_IsNoVisualDeath() { } */
    get_IsNoVisualDeath(): boolean { return this.isNoVisualDeath; /* asm: movzx eax, byte ptr [rcx + 0x86]; ret */ }
    /** @rva 0x138AA90  public bool get_IsEnemy() { } */
    get_IsEnemy(): boolean { return notPorted("BattleUnit.get_IsEnemy", 0x138AA90); }
    /** @rva 0x902530  public int get_TurnNum() { } */
    get_TurnNum(): int { return this._TurnNum; /* auto-property */ }
    /** @rva 0x902570  public void set_TurnNum(int value) { } */
    set_TurnNum(value: int): void { this._TurnNum = value; /* auto-property */ }
    /** @rva 0x737C30  public BattleConditionUtils.ConditionCheckDataBundle get_ActiveConditionCheckDataBundle() { } */
    get_ActiveConditionCheckDataBundle(): BattleConditionUtils_ConditionCheckDataBundle { return this.activeConditionCheckDataBundle; /* asm: mov rax, qword ptr [rcx + 0x90]; ret */ }
    /** @rva 0x737DA0  public EnemyConditionAndActionController get_EnemyConditionAndActionController() { } */
    get_EnemyConditionAndActionController(): EnemyConditionAndActionController { return this._EnemyConditionAndActionController; /* auto-property */ }
    /** @rva 0x737F90  public void set_EnemyConditionAndActionController(EnemyConditionAndActionController value) { } */
    set_EnemyConditionAndActionController(value: EnemyConditionAndActionController): void { this._EnemyConditionAndActionController = value; /* auto-property */ }
    /** @rva 0x754630  public int get_InitialHpGaugeCount() { } */
    get_InitialHpGaugeCount(): int { return this._InitialHpGaugeCount; /* auto-property */ }
    /** @rva 0x754900  public void set_InitialHpGaugeCount(int value) { } */
    set_InitialHpGaugeCount(value: int): void { this._InitialHpGaugeCount = value; /* auto-property */ }
    /** @rva 0x864740  public int get_CurrentHpGaugeCount() { } */
    get_CurrentHpGaugeCount(): int { return this._CurrentHpGaugeCount; /* auto-property */ }
    /** @rva 0xA10710  public void set_CurrentHpGaugeCount(int value) { } */
    set_CurrentHpGaugeCount(value: int): void { this._CurrentHpGaugeCount = value; /* auto-property */ }
    /** @rva 0x1389650  public void .ctor() { } */
    ctor(): this { return notPorted("BattleUnit..ctor", 0x1389650); }
    /** @rva 0x138A1D0  public void .ctor(int id, int mstId, BattleUnit.TeamType team, CharacterParameter parameter, int positionId, int[] activeSkillMstIds, int specialAttackMstId, int normalAttackMstId, PassiveSkillInfo[] passiveSkillInfos) { } */
    ctor$int_int_TeamType_CharacterParameter_int_int_int_int_PassiveSkillInfo(id: int, mstId: int, team: BattleUnit_TeamType, parameter: CharacterParameter, positionId: int, activeSkillMstIds: int[], specialAttackMstId: int, normalAttackMstId: int, passiveSkillInfos: any /* PassiveSkillInfo */[]): this { return notPorted("BattleUnit..ctor", 0x138A1D0); }
    /** @rva 0x1389240  public void .ctor(int id, int mstId, BattleUnit.TeamType team, BattleParameter parameter, BattleUnitSkillSet skillSet, PassiveSkill[] passiveSkills, int positionId) { } */
    ctor$int_int_TeamType_BattleParameter_BattleUnitSkillSet_PassiveSkill_int(id: int, mstId: int, team: BattleUnit_TeamType, parameter: BattleParameter, skillSet: BattleUnitSkillSet, passiveSkills: PassiveSkill[], positionId: int): this { return notPorted("BattleUnit..ctor", 0x1389240); }
    /** @rva 0x1389760  public void .ctor(int id, int questEnemyAppearanceMstId, int position) { } */
    ctor$int_int_int(id: int, questEnemyAppearanceMstId: int, position: int): this { return notPorted("BattleUnit..ctor", 0x1389760); }
    /** @rva 0x1384410  public static PassiveSkill[] GetPassiveSkills(BattleUnit unit, PassiveSkillInfo[] passiveSkillInfos) { } */
    static GetPassiveSkills(unit: BattleUnit, passiveSkillInfos: any /* PassiveSkillInfo */[]): PassiveSkill[] { return notPorted("BattleUnit.GetPassiveSkills", 0x1384410); }
    /** @rva 0x1383770  private static AdditionalSkill[] GetAdditionalSkills(PassiveSkill[] passiveSkills, ActiveSkillBase[] activeSkills, SpecialAttack specialAttack, NormalAttack normalAttack) { } */
    static GetAdditionalSkills(passiveSkills: PassiveSkill[], activeSkills: ActiveSkillBase[], specialAttack: SpecialAttack, normalAttack: NormalAttack): AdditionalSkill[] { return notPorted("BattleUnit.GetAdditionalSkills", 0x1383770); }
    /** @rva 0x1387760  private static ActiveSkillBase[] GetSwitchableSkills(PassiveSkill[] passiveSkills, int activeSkillLevel, int normalAttackLevel) { } */
    static GetSwitchableSkills(passiveSkills: PassiveSkill[], activeSkillLevel: int, normalAttackLevel: int): ActiveSkillBase[] { return notPorted("BattleUnit.GetSwitchableSkills", 0x1387760); }
    /** @rva 0x1388820  public void SetActiveConditionCheckDataBundle(GameDirectorBase gameDirector) { } */
    SetActiveConditionCheckDataBundle(gameDirector: GameDirectorBase): void { return notPorted("BattleUnit.SetActiveConditionCheckDataBundle", 0x1388820); }
    /** @rva 0x13885D0  public bool IsSpecialAttackPointMax() { } */
    IsSpecialAttackPointMax(): boolean { return notPorted("BattleUnit.IsSpecialAttackPointMax", 0x13885D0); }
    /** @rva 0x1388540  public bool IsMatch(TargetElementType targetElement) { } */
    IsMatch$TargetElementType(targetElement: TargetElementType): boolean { return notPorted("BattleUnit.IsMatch", 0x1388540); }
    /** @rva 0x13884B0  public bool IsMatch(TargetRoleType targetRole) { } */
    IsMatch$TargetRoleType(targetRole: TargetRoleType): boolean { return notPorted("BattleUnit.IsMatch", 0x13884B0); }
    /** @rva 0x1382DE0  public void AddHP(int hp) { } */
    AddHP(hp: int): void { return notPorted("BattleUnit.AddHP", 0x1382DE0); }
    /** @rva 0x13889A0  public void SetHP(int hp) { } */
    SetHP(hp: int): void { return notPorted("BattleUnit.SetHP", 0x13889A0); }
    /** @rva 0x1382D60  public void AddEP(int ep) { } */
    AddEP(ep: int): void { return notPorted("BattleUnit.AddEP", 0x1382D60); }
    /** @rva 0x1388930  public void SetEP(int ep) { } */
    SetEP(ep: int): void { return notPorted("BattleUnit.SetEP", 0x1388930); }
    /** @rva 0x1382C30  public void AddBP(int bp) { } */
    AddBP(bp: int): void { return notPorted("BattleUnit.AddBP", 0x1382C30); }
    /** @rva 0x13888C0  public void SetBP(int bp) { } */
    SetBP(bp: int): void { return notPorted("BattleUnit.SetBP", 0x13888C0); }
    /** @rva 0x1383170  public float CalculationHpRate() { } */
    CalculationHpRate(): float { return notPorted("BattleUnit.CalculationHpRate", 0x1383170); }
    /** @rva 0x1382EB0  public int Attack(BattleUnit target, int damage, GameDirectorBase gameDirector) { } */
    Attack(target: BattleUnit, damage: int, gameDirector: GameDirectorBase): int { return notPorted("BattleUnit.Attack", 0x1382EB0); }
    /** @rva 0x1388AD0  private void UpdateCountdownCancelTotalDamage(BattleUnit target, int damage, GameDirectorBase gameDirector) { } */
    UpdateCountdownCancelTotalDamage(target: BattleUnit, damage: int, gameDirector: GameDirectorBase): void { return notPorted("BattleUnit.UpdateCountdownCancelTotalDamage", 0x1388AD0); }
    /** @rva 0x1383140  public int AttacksToNearDeath(BattleUnit target, int damage, GameDirectorBase gameDirector) { } */
    AttacksToNearDeath(target: BattleUnit, damage: int, gameDirector: GameDirectorBase): int { return notPorted("BattleUnit.AttacksToNearDeath", 0x1383140); }
    /** @rva 0x1388CD0  private void UpdateParameter() { } */
    UpdateParameter(): void { return notPorted("BattleUnit.UpdateParameter", 0x1388CD0); }
    /** @rva 0x13887E0  public void Refresh() { } */
    Refresh(): void { return notPorted("BattleUnit.Refresh", 0x13887E0); }
    /** @rva 0x1388440  public bool IsMainTargetEnemy() { } */
    IsMainTargetEnemy(): boolean { return notPorted("BattleUnit.IsMainTargetEnemy", 0x1388440); }
    /** @rva 0x1388790  public void PassingTurn(int turnNum) { } */
    PassingTurn(turnNum: int): void { return notPorted("BattleUnit.PassingTurn", 0x1388790); }
    /** @rva 0x1389210  public float UpdateTurnGaugeBySpeed() { } */
    UpdateTurnGaugeBySpeed(): float { return notPorted("BattleUnit.UpdateTurnGaugeBySpeed", 0x1389210); }
    /** @rva 0x1383190  public float GetAbnormalParryRate(UnitStateBase state) { } */
    GetAbnormalParryRate$UnitStateBase(state: UnitStateBase): float { return notPorted("BattleUnit.GetAbnormalParryRate", 0x1383190); }
    /** @rva 0x1383330  public float GetAbnormalParryRate(Type stateType) { } */
    GetAbnormalParryRate$Type(stateType: Type): float { return notPorted("BattleUnit.GetAbnormalParryRate", 0x1383330); }
    /** @rva 0x13834D0  private float GetAbnormalParryRatio(UnitStateBase state) { } */
    GetAbnormalParryRatio$UnitStateBase(state: UnitStateBase): float { return notPorted("BattleUnit.GetAbnormalParryRatio", 0x13834D0); }
    /** @rva 0x1383620  private float GetAbnormalParryRatio(Type stateType) { } */
    GetAbnormalParryRatio$Type(stateType: Type): float { return notPorted("BattleUnit.GetAbnormalParryRatio", 0x1383620); }
    /** @rva 0x9028E0  public void SetBreakedDamageReceiveRate(int rate) { } */
    SetBreakedDamageReceiveRate(rate: int): void { this._BreakedDamageReceiveRate = rate; /* asm: mov dword ptr [rcx + 0x80], edx; ret */ }
    /** @rva 0x1382CB0  public ValueTuple<bool, int> AddBreakedDamageReceiveRate(int rate) { } */
    AddBreakedDamageReceiveRate(rate: int): any /* ValueTuple<bool, int> */ { return notPorted("BattleUnit.AddBreakedDamageReceiveRate", 0x1382CB0); }
    /** @rva 0x1387680  public List<IRequiredStateForDecide> GetStateListForDecide() { } */
    GetStateListForDecide(): List<IRequiredStateForDecide> { return notPorted("BattleUnit.GetStateListForDecide", 0x1387680); }
    /** @rva 0x1384310  public float GetInitialDamageBaseParamValue(DamageBaseType damageBaseType) { } */
    GetInitialDamageBaseParamValue(damageBaseType: DamageBaseType): float { return notPorted("BattleUnit.GetInitialDamageBaseParamValue", 0x1384310); }
    /** @rva -1  public bool IsSwitchingActiveSkill<T>(out T activeSkill, out SwitchSkillUnitState unitState) { } */
    IsSwitchingActiveSkill<T>(T$: abstract new (...args: any[]) => T, activeSkill: Ref<T>, unitState: Ref<SwitchSkillUnitState>): boolean { return notPorted("BattleUnit.IsSwitchingActiveSkill", 0); }
    /** @rva 0x13883C0  public int GetUniqueZoneUnitStatePatternId() { } */
    GetUniqueZoneUnitStatePatternId(): int { return notPorted("BattleUnit.GetUniqueZoneUnitStatePatternId", 0x13883C0); }
    /** @rva 0x902520  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this.serializedEnemyParameterMstId; /* asm: mov eax, dword ptr [rcx + 0xb0]; ret */ }
    /** @rva 0x1388760  public void OnSerializing(StreamingContext _) { } */
    OnSerializing(_: any /* StreamingContext */): void { return notPorted("BattleUnit.OnSerializing", 0x1388760); }
    /** @rva 0x1388600  public void OnDeserialized(StreamingContext _) { } */
    OnDeserialized(_: any /* StreamingContext */): void { return notPorted("BattleUnit.OnDeserialized", 0x1388600); }
    /** @rva 0x1387B90  public float GetTotalEffectHitRate(UnitStateBase targetState) { } */
    GetTotalEffectHitRate(targetState: UnitStateBase): float { return notPorted("BattleUnit.GetTotalEffectHitRate", 0x1387B90); }
    /** @rva 0x1383D10  public float GetAllAbnormalHitRate() { } */
    GetAllAbnormalHitRate(): float { return notPorted("BattleUnit.GetAllAbnormalHitRate", 0x1383D10); }
    /** @rva 0x1387CD0  public float GetTotalEffectParryRate(UnitStateBase targetState) { } */
    GetTotalEffectParryRate(targetState: UnitStateBase): float { return notPorted("BattleUnit.GetTotalEffectParryRate", 0x1387CD0); }
    /** @rva 0x1387D90  public float GetTotalSecondaryEffectParryRate(UnitStateBase targetState) { } */
    GetTotalSecondaryEffectParryRate$UnitStateBase(targetState: UnitStateBase): float { return notPorted("BattleUnit.GetTotalSecondaryEffectParryRate", 0x1387D90); }
    /** @rva 0x1388070  public float GetTotalSecondaryEffectParryRate(Type targetStateType) { } */
    GetTotalSecondaryEffectParryRate$Type(targetStateType: Type): float { return notPorted("BattleUnit.GetTotalSecondaryEffectParryRate", 0x1388070); }
    /** @rva 0x1384010  public float GetAllAbnormalParryRate() { } */
    GetAllAbnormalParryRate(): float { return notPorted("BattleUnit.GetAllAbnormalParryRate", 0x1384010); }
    /** @rva 0x1384AA0  public float GetProcessedAtk() { } */
    GetProcessedAtk(): float { return notPorted("BattleUnit.GetProcessedAtk", 0x1384AA0); }
    /** @rva 0x1384620  public Decimal GetProcessedAtkDecimal() { } */
    GetProcessedAtkDecimal(): Decimal { return notPorted("BattleUnit.GetProcessedAtkDecimal", 0x1384620); }
    /** @rva 0x1385A30  public float GetProcessedDef() { } */
    GetProcessedDef(): float { return notPorted("BattleUnit.GetProcessedDef", 0x1385A30); }
    /** @rva 0x13855B0  public Decimal GetProcessedDefDecimal() { } */
    GetProcessedDefDecimal(): Decimal { return notPorted("BattleUnit.GetProcessedDefDecimal", 0x13855B0); }
    /** @rva 0x13871F0  public float GetProcessedSpeed() { } */
    GetProcessedSpeed(): float { return notPorted("BattleUnit.GetProcessedSpeed", 0x13871F0); }
    /** @rva 0x1385160  public float GetProcessedCtr() { } */
    GetProcessedCtr(): float { return notPorted("BattleUnit.GetProcessedCtr", 0x1385160); }
    /** @rva 0x1386ED0  public float GetProcessedRcvCtr(BattleUnit attackUnit) { } */
    GetProcessedRcvCtr(attackUnit: BattleUnit): float { return notPorted("BattleUnit.GetProcessedRcvCtr", 0x1386ED0); }
    /** @rva 0x1386CF0  public float GetProcessedRcvCtd(BattleUnit attackUnit) { } */
    GetProcessedRcvCtd(attackUnit: BattleUnit): float { return notPorted("BattleUnit.GetProcessedRcvCtd", 0x1386CF0); }
    /** @rva 0x1384E40  public float GetProcessedCtd() { } */
    GetProcessedCtd(): float { return notPorted("BattleUnit.GetProcessedCtd", 0x1384E40); }
    /** @rva 0x1385AA0  public float GetProcessedEffectHitRate() { } */
    GetProcessedEffectHitRate(): float { return notPorted("BattleUnit.GetProcessedEffectHitRate", 0x1385AA0); }
    /** @rva 0x1385DF0  public float GetProcessedEffectParryRate() { } */
    GetProcessedEffectParryRate(): float { return notPorted("BattleUnit.GetProcessedEffectParryRate", 0x1385DF0); }
    /** @rva 0x13869F0  public float GetProcessedHealRatio() { } */
    GetProcessedHealRatio(): float { return notPorted("BattleUnit.GetProcessedHealRatio", 0x13869F0); }
    /** @rva 0x1386140  public Decimal GetProcessedElementDamageRate(TargetElementType attackElement) { } */
    GetProcessedElementDamageRate(attackElement: TargetElementType): Decimal { return notPorted("BattleUnit.GetProcessedElementDamageRate", 0x1386140); }
    /** @rva 0x13864C0  public Decimal GetProcessedElementResistRate(TargetElementType attackElement) { } */
    GetProcessedElementResistRate(attackElement: TargetElementType): Decimal { return notPorted("BattleUnit.GetProcessedElementResistRate", 0x13864C0); }
    /** @rva 0x1384B10  public float GetProcessedBreakedDamageReceiveRatio() { } */
    GetProcessedBreakedDamageReceiveRatio(): float { return notPorted("BattleUnit.GetProcessedBreakedDamageReceiveRatio", 0x1384B10); }
    /** @rva 0x1385480  public Decimal GetProcessedDamageBaseParamValueDecimal(DamageBaseType damageBaseType) { } */
    GetProcessedDamageBaseParamValueDecimal(damageBaseType: DamageBaseType): Decimal { return notPorted("BattleUnit.GetProcessedDamageBaseParamValueDecimal", 0x1385480); }
    /** @rva 0x1388A60  private bool <GetStateListForDecide>b__164_0(UnitStateBase state) { } */
    $GetStateListForDecide$b__164_0(state: UnitStateBase): boolean { return notPorted("BattleUnit.<GetStateListForDecide>b__164_0", 0x1388A60); }
}

// ---- ReDriveBattleCore.BattleUnit.TeamType  (TypeDefIndex 347, public enum) ----
export const BattleUnit_TeamType = {
    Ally: 0,
    Enemy: 1,
} as const;
export type BattleUnit_TeamType = (typeof BattleUnit_TeamType)[keyof typeof BattleUnit_TeamType];
