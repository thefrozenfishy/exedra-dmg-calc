// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { DamageBaseType as DamageBaseType$ } from "./AbilityEffect/DamageBaseType";
import { UniqueZoneUnitState } from "./UnitState/UniqueZoneUnitState";
import { StunUnitState } from "./UnitState/StunUnitState";
import { AbnormalUnitStateBase } from "./UnitState/AbnormalUnitStateBase";
import type { IBreakedDamageReceiveRatioVariation } from "./UnitState/IBreakedDamageReceiveRatioVariation";
import type { IElementResistVariation } from "./UnitState/IElementResistVariation";
import type { IElementDamageRateVariation } from "./UnitState/IElementDamageRateVariation";
import type { IHealRateVariation } from "./UnitState/IHealRateVariation";
import type { IEffectParryRateVariation } from "./UnitState/IEffectParryRateVariation";
import type { IEffectHitRateVariation } from "./UnitState/IEffectHitRateVariation";
import type { IRcvCtdVariation } from "./UnitState/IRcvCtdVariation";
import type { IRcvCtrVariation } from "./UnitState/IRcvCtrVariation";
import type { ICtdVariation } from "./UnitState/ICtdVariation";
import type { ICtrVariation } from "./UnitState/ICtrVariation";
import type { ISpeedVariation } from "./UnitState/ISpeedVariation";
import type { IDefVariation } from "./UnitState/IDefVariation";
import type { IAtkVariation } from "./UnitState/IAtkVariation";
import type { IAbnormalParryRateVariation } from "./UnitState/IAbnormalParryRateVariation";
import type { IAbnormalHitRateVariation } from "./UnitState/IAbnormalHitRateVariation";
import type { IMaxHpVariation } from "./UnitState/IMaxHpVariation";
import { AdditionType } from "./UnitState/AdditionType";
import { CountdownStartUnitState } from "./UnitState/CountdownStartUnitState";
import { SoloGameDirectorBase } from "./SoloGameDirectorBase";
import { SoloRaidGameDirector } from "./SoloRaidGameDirector";
import { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import { SwitchSkillUnitState } from "./UnitState/SwitchSkillUnitState";
import { ActiveSkillBaseUtility } from "./ActiveSkillBaseUtility";
import { StateAbilityEffect } from "./AbilityEffect/StateAbilityEffect";
import { AdditionalSkillActAbilityEffectBase } from "./AbilityEffect/AdditionalSkillActAbilityEffectBase";
import { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";
import { EnumUtil } from "./EnumUtil";
import { PassiveSkill } from "./PassiveSkill";
import { EnemyConditionAndActionController } from "./EnemyConditionAndActionController";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { CharacterParameter } from "./CharacterParameter";
import { BattleUnitSkillSet } from "./BattleUnitSkillSet";
import { NormalAttack } from "./NormalAttack";
import { SpecialAttack } from "./SpecialAttack";
import { ActiveSkill } from "./ActiveSkill";
import type { EnemyMstRecord } from "../Network/Definition/QuestOutGame/EnemyMstRecord";
import type { BreakMstRecord } from "../Network/Definition/QuestOutGame/BreakMstRecord";
import type { QuestEnemySkillSetMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemySkillSetMstRecord";
import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import type { PassiveSkillMstRecord } from "../Network/Definition/Skill/PassiveSkillMstRecord";
import type { SkillMstRecord } from "../Network/Definition/Skill/SkillMstRecord";
import { EnemyMstModel } from "./Model/EnemyMstModel";
import { BreakMstModel } from "./Model/BreakMstModel";
import { QuestEnemySkillSetMstModel } from "./Model/QuestEnemySkillSetMstModel";
import { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import { PassiveSkillMstModel } from "./Model/PassiveSkillMstModel";
import { SkillMstModel } from "./Model/SkillMstModel";
import { PassiveSkillDetailMstReader } from "./Reader/PassiveSkillDetailMstReader";
import { SkillDetailMstReader } from "./Reader/SkillDetailMstReader";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { BreakPoint } from "./BreakPoint";
import { UnitTurnGauge } from "./UnitTurnGauge";
import { UnitCondition } from "./UnitCondition";
import { PassiveSkillInfo } from "../Network/Definition/QuestBattle/PassiveSkillInfo";
import { Decimal, Delegate, clamp, enumToString, f32, isAssignableFrom, isImpl, notPorted, trunc } from "../runtime";
import type { List, Ref, Type, float, int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { TargetRoleType } from "../Network/Definition/Battle/TargetRoleType";
import type { DamageBaseType } from "./AbilityEffect/DamageBaseType";

import { ActiveSkillBase } from "./ActiveSkillBase";
import type { AdditionalSkill } from "./AdditionalSkill";

import type { BattleParameter } from "./BattleParameter";

import type { GameDirectorBase } from "./GameDirectorBase";

import type { IRequiredStateForDecide } from "./UnitState/IRequiredStateForDecide";

import type { UnitStateBase } from "./UnitState/UnitStateBase";
import { orderBy } from "../runtime";

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
    get_InitialHP(): int { return this.BattleParameter.HP; }
    /** @rva 0x75EDA0  public int get_MaxEP() { } */
    get_MaxEP(): int { return this._MaxEP; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_MaxEP(int value) { } */
    set_MaxEP(value: int): void { this._MaxEP = value; /* auto-property */ }
    /** @rva 0x8F3F40  public int get_MaxBP() { } */
    get_MaxBP(): int { return this._MaxBP; /* auto-property */ }
    /** @rva 0x901F80  public void set_MaxBP(int value) { } */
    set_MaxBP(value: int): void { this._MaxBP = value; /* auto-property */ }
    /** @rva 0x138A930  public int get_ATK() { } */
    get_ATK(): int { return this.BattleParameter.ATK; }
    /** @rva 0x138AA10  public int get_DEF() { } */
    get_DEF(): int { return this.BattleParameter.DEF; }
    /** @rva 0x9D3ED0  public int get_CTR() { } */
    get_CTR(): int { return this.BattleParameter.CTR; }
    /** @rva 0x138A9F0  public int get_CTD() { } */
    get_CTD(): int { return this.BattleParameter.CTD; }
    /** @rva 0x138AAD0  public int get_Speed() { } */
    get_Speed(): int { return this.BattleParameter.Speed; }
    /** @rva 0x138AA50  public bool get_IsDead() { } */
    get_IsDead(): boolean {
        if (0 < this.HP) return false;
        return this.CurrentHpGaugeCount < 2;
    }
    /** @rva 0x138AA70  public bool get_IsDying() { } */
    get_IsDying(): boolean {
        if (this.HP !== 1) return false;
        return this.CurrentHpGaugeCount < 2;
    }
    /** @rva 0x138A880  public void add_onAliveStateChanged(Action<BattleUnit> value) { } */
    add_onAliveStateChanged(value: (a0: BattleUnit) => void): void {
        this.onAliveStateChanged = Delegate.Combine(this.onAliveStateChanged, value)!;
    }
    /** @rva 0x138AAF0  public void remove_onAliveStateChanged(Action<BattleUnit> value) { } */
    remove_onAliveStateChanged(value: (a0: BattleUnit) => void): void {
        this.onAliveStateChanged = Delegate.Remove(this.onAliveStateChanged, value)!;
    }
    /** @rva 0x7368F0  public BattleUnitSkillSet get_SkillSet() { } */
    get_SkillSet(): BattleUnitSkillSet { return this._SkillSet; /* auto-property */ }
    /** @rva 0x736A00  public void set_SkillSet(BattleUnitSkillSet value) { } */
    set_SkillSet(value: BattleUnitSkillSet): void { this._SkillSet = value; /* auto-property */ }
    /** @rva 0x138A950  public ActiveSkill[] get_ActiveSkills() { } */
    get_ActiveSkills(): ActiveSkill[] {
        return this.SkillSet?.ActiveSkills ?? []; // `?? new ActiveSkill[0]`
    }
    /** @rva 0x138AAC0  public SpecialAttack get_SpecialAttack() { } */
    get_SpecialAttack(): SpecialAttack { return this.SkillSet?.SpecialAttack ?? null!; }
    /** @rva 0x138AAB0  public NormalAttack get_NormalAttack() { } */
    get_NormalAttack(): NormalAttack { return this.SkillSet?.NormalAttack ?? null!; }
    /** @rva 0x138A9A0  public AdditionalSkill[] get_AdditionalSkills() { } */
    get_AdditionalSkills(): AdditionalSkill[] { return this.SkillSet?.AdditionalSkills ?? []; /* ?? Array.Empty<AdditionalSkill>() */ }
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
    get_IsEnemy(): boolean { return !this.isCharacter; }
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
    ctor(): this {
        // field initializers
        this._Condition = new UnitCondition().ctor();
        this._TurnGauge = new UnitTurnGauge().ctor();
        this._WeakElements = [];
        this._BreakPoint = new BreakPoint().ctor();
        this._TurnNum = 1;
        return this;
    }
    /** @rva 0x138A1D0  public void .ctor(int id, int mstId, BattleUnit.TeamType team, CharacterParameter parameter, int positionId, int[] activeSkillMstIds, int specialAttackMstId, int normalAttackMstId, PassiveSkillInfo[] passiveSkillInfos) { } */
    ctor$int_int_TeamType_CharacterParameter_int_int_int_int_PassiveSkillInfo(id: int, mstId: int, team: BattleUnit_TeamType, parameter: CharacterParameter, positionId: int, activeSkillMstIds: int[], specialAttackMstId: int, normalAttackMstId: int, passiveSkillInfos: PassiveSkillInfo[]): this {
        this.ctor(); // field initializers
        this._Id = id;
        this._MstId = mstId;
        this._Team = team;
        this._BattleParameter = parameter;
        this._PositionId = positionId;
        this._PassiveSkills = BattleUnit.GetPassiveSkills(this, passiveSkillInfos);
        this.serializedPassiveSkillInfos = passiveSkillInfos;
        const activeSkills = activeSkillMstIds.map(aId => { // <.ctor>b__133_0
            const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(aId);
            return new ActiveSkill().ctor$SkillMstModel_ListSkillDetailMstModel_int_int(skillMst, SkillDetailMstReader.GetDetailModelsByMstId(aId), 0, 0);
        });
        let specialAttack: SpecialAttack = null!;
        if (specialAttackMstId !== 0) {
            const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(specialAttackMstId);
            if (skillMst != null) specialAttack = new SpecialAttack().ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, SkillDetailMstReader.GetDetailModelsByMstId(specialAttackMstId));
        }
        let normalAttack: NormalAttack = null!;
        if (normalAttackMstId !== 0) {
            const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(normalAttackMstId);
            if (skillMst != null) normalAttack = new NormalAttack().ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, SkillDetailMstReader.GetDetailModelsByMstId(normalAttackMstId));
        }
        const additionalSkills = BattleUnit.GetAdditionalSkills(this.PassiveSkills, activeSkills, specialAttack, normalAttack);
        const activeSkillLevel = activeSkills.length === 0 ? 0 : activeSkills[0].Level;
        const normalAttackLevel = normalAttack == null ? 0 : normalAttack.Level;
        const switchableSkills = BattleUnit.GetSwitchableSkills(this.PassiveSkills, activeSkillLevel, normalAttackLevel);
        this._SkillSet = new BattleUnitSkillSet().ctor$ActiveSkill_SpecialAttack_NormalAttack_AdditionalSkill_ActiveSkillBase(activeSkills, specialAttack, normalAttack, additionalSkills, switchableSkills);
        this._MaxHP = this.BattleParameter.HP;
        this._HP = this.BattleParameter.HP;
        this._EP = 0;
        this._MaxEP = parameter.EP;
        this._MaxBP = parameter.BP;
        if (0 < parameter.BreakPoint) this.BreakPoint.Initialize(parameter.BreakPoint);
        if (this.BattleParameter.HP < 1)
            throw new Error(`BattleUnit(mstId:${this.MstId})のInitialHPが${this.InitialHP}になっています。0より大きい値にしてください。`);
        if (specialAttackMstId === 0 && (this.MaxEP !== 0 || this.MaxBP !== 0))
            throw new Error(`BattleUnit(mstId:${this.MstId})のMaxEPが${this.MaxEP}、MaxBPが${this.MaxBP}になっています。このユニットは必殺技を持たないため0にしてください。`);
        this.isCharacter = true;
        this.isCharacterFigure = true; // asm writes the word 0x101 over isCharacter + isCharacterFigure
        return this;
    }
    /** @rva 0x1389240  public void .ctor(int id, int mstId, BattleUnit.TeamType team, BattleParameter parameter, BattleUnitSkillSet skillSet, PassiveSkill[] passiveSkills, int positionId) { } */
    ctor$int_int_TeamType_BattleParameter_BattleUnitSkillSet_PassiveSkill_int(id: int, mstId: int, team: BattleUnit_TeamType, parameter: BattleParameter, skillSet: BattleUnitSkillSet, passiveSkills: PassiveSkill[], positionId: int): this {
        this.ctor(); // field initializers
        this._BattleParameter = parameter;
        this._Id = id;
        this._MstId = mstId;
        this._Team = team;
        this._SkillSet = skillSet;
        this._PositionId = positionId;
        this._PassiveSkills = passiveSkills;
        this._MaxHP = this.BattleParameter.HP;
        this._HP = this.BattleParameter.HP;
        const p = this.BattleParameter;
        if (p instanceof CharacterParameter) {
            this._MaxEP = p.EP;
            this._MaxBP = p.BP;
        } else if (p instanceof QuestEnemyAppearanceParameter) {
            this.BreakPoint.Initialize(p.BreakPoint);
        }
        if (this.BattleParameter.HP < 1)
            throw new Error(`BattleUnit(mstId:${this.MstId})のInitialHPが${this.InitialHP}になっています。0より大きい値にしてください。`);
        if (this.SkillSet.SpecialAttack == null && (this.MaxEP !== 0 || this.MaxBP !== 0))
            throw new Error(`BattleUnit(mstId:${this.MstId})のMaxEPが${this.MaxEP}、MaxBPが${this.MaxBP}になっています。このユニットは必殺技を持たないため0にしてください。`);
        this.isCharacter = true;
        this.isCharacterFigure = true; // word 0x101
        return this;
    }
    /** @rva 0x1389760  public void .ctor(int id, int questEnemyAppearanceMstId, int position) { } */
    ctor$int_int_int(id: int, questEnemyAppearanceMstId: int, position: int): this {
        this.ctor(); // field initializers
        const mst = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel).GetModelByKey(questEnemyAppearanceMstId); // DisplayClass135_0.mst
        const breakMst = BattleMstReaderBase.get_Instance<BreakMstModel, BreakMstRecord, int>(BreakMstModel).GetModelByKey(mst.BreakMstId);
        const parameter = new QuestEnemyAppearanceParameter().ctor$QuestEnemyAppearanceMstModel_BreakMstModel(mst, breakMst);
        this._Id = id;
        this._MstId = mst.EnemyMstId;
        this._Team = BattleUnit_TeamType.Enemy;
        this._BattleParameter = parameter;
        this._PositionId = position;
        this.serializedEnemyParameterMstId = questEnemyAppearanceMstId;
        const info = new PassiveSkillInfo();
        info.passiveSkillMstId = mst.PassiveSkillMstId;
        info.abilitySourceType = 1;
        this.serializedPassiveSkillInfos = [info];
        this._PassiveSkills = BattleUnit.GetPassiveSkills(this, this.serializedPassiveSkillInfos);
        const skillSetMsts = [...BattleMstReaderBase.get_Instance<QuestEnemySkillSetMstModel, QuestEnemySkillSetMstRecord, int>(QuestEnemySkillSetMstModel)
            .GetModelList(m => m.enemySkillSetId === mst.EnemySkillSetId)]; // <.ctor>b__0
        const activeSkillList: ActiveSkill[] = [];
        let specialAttack: SpecialAttack = null!;
        for (let i = 0; i < skillSetMsts.length; i++) {
            const skillSet = skillSetMsts[i];
            const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(skillSet.SkillMstId);
            const details = SkillDetailMstReader.GetDetailModelsByMstId(skillSet.SkillMstId);
            const type = skillMst.Type;
            if (type === 1) {
                activeSkillList.push(new ActiveSkill().ctor$SkillMstModel_ListSkillDetailMstModel_int_int(skillMst, details, skillSet.WeightValue, skillSet.HpGaugeValue));
            } else if (type === 2) {
                specialAttack = new SpecialAttack().ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, details);
            }
        }
        const activeSkills = [...activeSkillList];
        const additionalSkills = BattleUnit.GetAdditionalSkills(this.PassiveSkills, [...activeSkillList], specialAttack, null!);
        this._SkillSet = new BattleUnitSkillSet().ctor$ActiveSkill_SpecialAttack_NormalAttack_AdditionalSkill_ActiveSkillBase(activeSkills, specialAttack, null!, additionalSkills, []);
        this._EnemyConditionAndActionController = new EnemyConditionAndActionController().ctor$int(mst.EnemyConditionSkillSetId);
        this._MaxHP = this.BattleParameter.HP;
        this._HP = this.BattleParameter.HP;
        this._CurrentHpGaugeCount = parameter.HPGaugeCount;
        this._InitialHpGaugeCount = parameter.HPGaugeCount;
        if (0 < parameter.StartHPGaugeCount) this._CurrentHpGaugeCount = parameter.StartHPGaugeCount;
        this._WeakElements = parameter.WeakElements;
        this.BreakPoint.Initialize(parameter.BreakPoint);
        if (this.BattleParameter.HP < 1)
            throw new Error(`BattleUnit(mstId:${this.MstId})のInitialHPが${this.InitialHP}になっています。0より大きい値にしてください。`);
        this.isCharacter = false;
        const enemyMst = BattleMstReaderBase.get_Instance<EnemyMstModel, EnemyMstRecord, int>(EnemyMstModel).GetModelByKey(mst.EnemyMstId);
        if (enemyMst == null) {
            this.isCharacterFigure = false;
            this.isNoVisualDeath = false;
        } else {
            this.isCharacterFigure = enemyMst.EnemyType === 4;
            this.isNoVisualDeath = enemyMst.IsNoVisualDeath;
        }
        return this;
    }
    /** @rva 0x1384410  public static PassiveSkill[] GetPassiveSkills(BattleUnit unit, PassiveSkillInfo[] passiveSkillInfos) { } */
    static GetPassiveSkills(unit: BattleUnit, passiveSkillInfos: PassiveSkillInfo[]): PassiveSkill[] {
        if (passiveSkillInfos == null) return []; // Array.Empty<PassiveSkill>()
        return passiveSkillInfos.map(info => { // DisplayClass136_0.<GetPassiveSkills>b__0
            const mst = BattleMstReaderBase.get_Instance<PassiveSkillMstModel, PassiveSkillMstRecord, int>(PassiveSkillMstModel).GetModelByKey(info.passiveSkillMstId);
            if (mst == null) return null;
            if (!unit.IsMatch$TargetElementType(mst.ConditionElement)) return null;
            if (!unit.IsMatch$TargetRoleType(mst.ConditionRole)) return null;
            const details = PassiveSkillDetailMstReader.GetDetailModelsByMstId(info.passiveSkillMstId);
            if (details.length === 0) return null; // !Any()
            const source = EnumUtil.Cast<AbilitySourceType>(AbilitySourceType, info.abilitySourceType);
            return new PassiveSkill().ctor$PassiveSkillMstModel_ListPassiveSkillDetailMstModel_AbilitySourceType(mst, details, source); // inlined
        }).filter((ps): ps is PassiveSkill => ps != null); // <GetPassiveSkills>b__136_1
    }
    /** @rva 0x1383770  private static AdditionalSkill[] GetAdditionalSkills(PassiveSkill[] passiveSkills, ActiveSkillBase[] activeSkills, SpecialAttack specialAttack, NormalAttack normalAttack) { } */
    static GetAdditionalSkills(passiveSkills: PassiveSkill[], activeSkills: ActiveSkillBase[], specialAttack: SpecialAttack, normalAttack: NormalAttack): AdditionalSkill[] {
        const list: AdditionalSkill[] = [];
        for (const effect of passiveSkills.flatMap(ps => ps.launcher.AbilityEffectList)) { // SelectMany(<GetAdditionalSkills>b__137_1)
            if (effect instanceof AdditionalSkillActAbilityEffectBase) {
                const skill = ActiveSkillBaseUtility.GetAdditionalSkill(effect.skillMstId);
                if (skill != null) list.push(skill);
            }
        }
        const all: ActiveSkillBase[] = [...activeSkills];
        all.push(specialAttack);
        all.push(normalAttack);
        // all.Where(<GetAdditionalSkills>b__137_0: skill != null) is built and never enumerated in 3.19.0 (no effect).
        return [...list];
    }
    /** @rva 0x1387760  private static ActiveSkillBase[] GetSwitchableSkills(PassiveSkill[] passiveSkills, int activeSkillLevel, int normalAttackLevel) { } */
    static GetSwitchableSkills(passiveSkills: PassiveSkill[], activeSkillLevel: int, normalAttackLevel: int): ActiveSkillBase[] {
        const list: ActiveSkillBase[] = [];
        for (const effect of passiveSkills.flatMap(ps => ps.launcher.AbilityEffectList)) { // SelectMany(<GetSwitchableSkills>b__138_0)
            if (!(effect instanceof StateAbilityEffect)) continue;
            const state = effect.GiveUnitState;
            if (state == null || !(state instanceof SwitchSkillUnitState)) continue;
            const skillType = state.SkillType;
            let skill: ActiveSkillBase;
            if (skillType === 1) skill = ActiveSkillBaseUtility.GetSwitchableSkill<ActiveSkill>(ActiveSkill, state.switchSkillUniqueId, activeSkillLevel);
            else if (skillType === 3) skill = ActiveSkillBaseUtility.GetSwitchableSkill<NormalAttack>(NormalAttack, state.switchSkillUniqueId, normalAttackLevel);
            else continue;
            if (skill != null) list.push(skill);
        }
        return [...list];
    }
    /** @rva 0x1388820  public void SetActiveConditionCheckDataBundle(GameDirectorBase gameDirector) { } */
    SetActiveConditionCheckDataBundle(gameDirector: GameDirectorBase): void {
        const bundle = new BattleConditionUtils_ConditionCheckDataBundle().ctor();
        bundle._GameDirector = gameDirector;
        bundle._SelfUnit = this;
        this.activeConditionCheckDataBundle = bundle;
    }
    /** @rva 0x13885D0  public bool IsSpecialAttackPointMax() { } */
    IsSpecialAttackPointMax(): boolean {
        if (0 < this.MaxBP) return this.MaxBP <= this.BP;
        if (this.MaxEP < 1) return false;
        return this.MaxEP <= this.EP;
    }
    /** @rva 0x1388540  public bool IsMatch(TargetElementType targetElement) { } */
    IsMatch$TargetElementType(targetElement: TargetElementType): boolean {
        if (targetElement === 0) return true;
        const p = this.BattleParameter;
        if (p instanceof CharacterParameter) return p.Element === targetElement;
        return false;
    }
    /** @rva 0x13884B0  public bool IsMatch(TargetRoleType targetRole) { } */
    IsMatch$TargetRoleType(targetRole: TargetRoleType): boolean {
        if (targetRole === 0) return true;
        const p = this.BattleParameter;
        if (p instanceof CharacterParameter) return p.Role === targetRole;
        return false;
    }
    /** @rva 0x1382DE0  public void AddHP(int hp) { } */
    AddHP(hp: int): void {
        const wasDead = this.HP < 1 ? this.CurrentHpGaugeCount < 2 : false; // IsDead (inlined)
        this._HP = clamp(hp + this.HP, 0, this.MaxHP);
        const isDead = this.HP < 1 ? this.CurrentHpGaugeCount < 2 : false;
        if (wasDead !== isDead) this.onAliveStateChanged?.(this);
    }
    /** @rva 0x13889A0  public void SetHP(int hp) { } */
    SetHP(hp: int): void {
        const wasDead = this.HP < 1 ? this.CurrentHpGaugeCount < 2 : false;
        this._HP = clamp(hp, 0, this.MaxHP);
        const isDead = this.HP < 1 ? this.CurrentHpGaugeCount < 2 : false;
        if (wasDead !== isDead) this.onAliveStateChanged?.(this);
    }
    /** @rva 0x1382D60  public void AddEP(int ep) { } */
    AddEP(ep: int): void { this._EP = clamp(this.EP + ep, 0, this.MaxEP); }
    /** @rva 0x1388930  public void SetEP(int ep) { } */
    SetEP(ep: int): void { this._EP = clamp(ep, 0, this.MaxEP); }
    /** @rva 0x1382C30  public void AddBP(int bp) { } */
    AddBP(bp: int): void { this._BP = clamp(this.BP + bp, 0, this.MaxBP); }
    /** @rva 0x13888C0  public void SetBP(int bp) { } */
    SetBP(bp: int): void { this._BP = clamp(bp, 0, this.MaxBP); }
    /** @rva 0x1383170  public float CalculationHpRate() { } */
    CalculationHpRate(): float { return f32(f32(this.HP * 100) / this.MaxHP); /* asm: (float)HP * 100f / (float)MaxHP */ }
    /** @rva 0x1382EB0  public int Attack(BattleUnit target, int damage, GameDirectorBase gameDirector) { } */
    Attack(target: BattleUnit, damage: int, gameDirector: GameDirectorBase): int {
        if (!target.isCharacter) {
            if (gameDirector instanceof SoloRaidGameDirector) {
                let cancel: boolean;
                if (gameDirector.linkHpReferee.linkHpType === 2) cancel = gameDirector.countdownReferee.IsCountdownActive;
                else cancel = target.Condition.StateList.some(state => state instanceof CountdownStartUnitState); // <UpdateCountdownCancelTotalDamage>b__151_0
                if (cancel) gameDirector.AddCancelTotalDamage(damage); // UpdateCountdownCancelTotalDamage (inlined)
            }
        }
        if (gameDirector instanceof SoloGameDirectorBase && !target.isCharacter) {
            if (gameDirector.linkHpReferee.linkHpType === 2) return 0;
            damage = gameDirector.modeChangeReferee.GetNextModeChangeDamageCutDamage(target, damage);
        }
        const hp = target.HP;
        target.AddHP(-damage);
        return hp - target.HP;
    }
    /** @rva 0x1388AD0  private void UpdateCountdownCancelTotalDamage(BattleUnit target, int damage, GameDirectorBase gameDirector) { } */
    UpdateCountdownCancelTotalDamage(target: BattleUnit, damage: int, gameDirector: GameDirectorBase): void {
        if (target.isCharacter || gameDirector == null) return;
        if (!(gameDirector instanceof SoloRaidGameDirector)) return;
        let cancel: boolean;
        if (gameDirector.linkHpReferee.linkHpType === 2) cancel = gameDirector.countdownReferee.IsCountdownActive;
        else cancel = target.Condition.StateList.some(state => state instanceof CountdownStartUnitState); // <UpdateCountdownCancelTotalDamage>b__151_0
        if (cancel) gameDirector.AddCancelTotalDamage(damage); // tail call 0x14a6ce0 (Ghidra inlined it)
    }
    /** @rva 0x1383140  public int AttacksToNearDeath(BattleUnit target, int damage, GameDirectorBase gameDirector) { } */
    AttacksToNearDeath(target: BattleUnit, damage: int, gameDirector: GameDirectorBase): int {
        if (target.HP <= damage) damage = target.HP - 1;
        return this.Attack(target, damage, gameDirector);
    }
    /** @rva 0x1388CD0  private void UpdateParameter() { } */
    UpdateParameter(): void {
        let maxHp: Decimal = Decimal.fromInt(this.BattleParameter.HP);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IMaxHpVariation")) continue;
            const v = state as unknown as IMaxHpVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) maxHp = maxHp.add(v.GetMaxHpVariationValue(this, maxHp));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IMaxHpVariation")) continue;
            const v = state as unknown as IMaxHpVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) maxHp = maxHp.add(v.GetMaxHpVariationValue(this, maxHp));
        }
        const addition = maxHp.sub(Decimal.fromInt(this.BattleParameter.HP)).ceiling().toInt();
        const currentAddition = this.MaxHP - this.BattleParameter.HP;
        if (addition !== 0 || currentAddition !== 0) {
            let recover = 0;
            if (currentAddition < addition) recover = addition - currentAddition;
            this._MaxHP = this.BattleParameter.HP + addition;
            this.AddHP(recover);
        }
    }
    /** @rva 0x13887E0  public void Refresh() { } */
    Refresh(): void {
        this.Condition.Refresh(this);
        this.UpdateParameter(); // inlined
    }
    /** @rva 0x1388440  public bool IsMainTargetEnemy() { } */
    IsMainTargetEnemy(): boolean {
        const p = this.BattleParameter;
        if (p instanceof QuestEnemyAppearanceParameter) return p.IsMainTargetEnemy;
        return false;
    }
    /** @rva 0x1388790  public void PassingTurn(int turnNum) { } */
    PassingTurn(turnNum: int): void {
        this.Condition.PassingTurn(turnNum, this);
        this.Condition.Refresh(this);
        this.UpdateParameter();
        this._TurnNum = this.TurnNum + 1;
    }
    /** @rva 0x1389210  public float UpdateTurnGaugeBySpeed() { } */
    UpdateTurnGaugeBySpeed(): float {
        return this.TurnGauge.SetSpeedAndUpdateGaugeValue(this.GetProcessedSpeed()); // tail call 0x15cf110 (Ghidra inlined it)
    }
    /** @rva 0x1383190  public float GetAbnormalParryRate(UnitStateBase state) { } */
    GetAbnormalParryRate$UnitStateBase(state: UnitStateBase): float {
        return clamp(f32(this.GetAbnormalParryRatio$UnitStateBase(state) / 100), 0, 1); // Ratio inlined
    }
    /** @rva 0x1383330  public float GetAbnormalParryRate(Type stateType) { } */
    GetAbnormalParryRate$Type(stateType: Type): float {
        return clamp(f32(this.GetAbnormalParryRatio$Type(stateType) / 100), 0, 1);
    }
    /** @rva 0x13834D0  private float GetAbnormalParryRatio(UnitStateBase state) { } */
    GetAbnormalParryRatio$UnitStateBase(state: UnitStateBase): float {
        let ratio = 0;
        const p = this.BattleParameter;
        if (p instanceof QuestEnemyAppearanceParameter) {
            const parry = p.AbnormalEffectParryRates.find(x => x.IsTargetType$UnitStateBase(state)) ?? null; // DisplayClass160_0 b__0 (slot 6)
            ratio = f32((parry != null ? f32(parry.ParryRate / 10) : 0) + 0);
        }
        return ratio;
    }
    /** @rva 0x1383620  private float GetAbnormalParryRatio(Type stateType) { } */
    GetAbnormalParryRatio$Type(stateType: Type): float {
        let ratio = 0;
        const p = this.BattleParameter;
        if (p instanceof QuestEnemyAppearanceParameter) {
            const parry = p.AbnormalEffectParryRates.find(x => x.IsTargetType$Type(stateType)) ?? null; // DisplayClass161_0 b__0 (slot 7)
            ratio = f32((parry != null ? f32(parry.ParryRate / 10) : 0) + 0);
        }
        return ratio;
    }
    /** @rva 0x9028E0  public void SetBreakedDamageReceiveRate(int rate) { } */
    SetBreakedDamageReceiveRate(rate: int): void { this._BreakedDamageReceiveRate = rate; /* asm: mov dword ptr [rcx + 0x80], edx; ret */ }
    /** @rva 0x1382CB0  public ValueTuple<bool, int> AddBreakedDamageReceiveRate(int rate) { } */
    AddBreakedDamageReceiveRate(rate: int): [boolean, int] {
        const before = this.BreakedDamageReceiveRate;
        rate = rate + before;
        const max = trunc(this.BattleParameter.MaxBreakedDamageReceiveRate / 10);
        this._BreakedDamageReceiveRate = rate;
        if (max <= rate) this._BreakedDamageReceiveRate = max;
        return [max <= rate && before < max, this.BreakedDamageReceiveRate - before];
    }
    /** @rva 0x1387680  public List<IRequiredStateForDecide> GetStateListForDecide() { } */
    GetStateListForDecide(): List<IRequiredStateForDecide> {
        return this.Condition.StateList.filter(state => this.$GetStateListForDecide$b__164_0(state))
            .filter(s => isImpl(s, "IRequiredStateForDecide")) as unknown as IRequiredStateForDecide[]; // OfType
    }
    /** @rva 0x1384310  public float GetInitialDamageBaseParamValue(DamageBaseType damageBaseType) { } */
    GetInitialDamageBaseParamValue(damageBaseType: DamageBaseType): float {
        switch (damageBaseType) {
            case 1: return this.BattleParameter.ATK;
            case 2: return this.BattleParameter.DEF;
            case 3: return this.BattleParameter.HP;
            default: throw new Error(`不正な DamageBaseType です: ${damageBaseType}`);
        }
    }
    /** @rva -1  public bool IsSwitchingActiveSkill<T>(out T activeSkill, out SwitchSkillUnitState unitState) { } */
    IsSwitchingActiveSkill<T>(T$: abstract new (...args: any[]) => T, activeSkill: Ref<T>, unitState: Ref<SwitchSkillUnitState>): boolean {
        // instance IsSwitchingActiveSkill<object> at 0x24EEB30
        activeSkill.v = null!;
        unitState.v = null!;
        const skillType = ActiveSkillBaseUtility.GetSkillTypeForSwitchSkill(T$); // <>c__DisplayClass166_0<T>.<0x10>
        const states = this.Condition.StateList.filter((s): s is SwitchSkillUnitState => s instanceof SwitchSkillUnitState)
            .filter(state => T$ === (ActiveSkillBase as unknown) || (skillType != null && state.SkillType === skillType)) // b__0
            .filter(state => state.IsActive$BattleUnit(this)); // b__1
        for (const state of orderBy(states, s => s.MstId)) { // <>c__166<T>.b__166_2
            const skill = this.SkillSet.SwitchableSkills.find(s => s.UniqueId === state.switchSkillUniqueId) ?? null; // <>c__DisplayClass166_1<T>.b__3
            if (skill == null) continue;
            if (!(skill instanceof (T$ as any))) throw new TypeError("InvalidCastException");
            activeSkill.v = skill as unknown as T;
            unitState.v = state;
            return true;
        }
        return false;
    }
    /** @rva 0x13883C0  public int GetUniqueZoneUnitStatePatternId() { } */
    GetUniqueZoneUnitStatePatternId(): int {
        const s = this.Condition.StateList.find(x => x instanceof UniqueZoneUnitState) as UniqueZoneUnitState | undefined;
        return s != null ? s.UniqueStatePatternMstId : 0; // field 0x90
    }
    /** @rva 0x902520  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this.serializedEnemyParameterMstId; /* asm: mov eax, dword ptr [rcx + 0xb0]; ret */ }
    /** @rva 0x1388760  public void OnSerializing(StreamingContext _) { } */
    OnSerializing(_: any): void {
        if (this.serializedEnemyParameterMstId !== 0) return;
        this.serializeBattleParameter = this.BattleParameter;
    }
    /** @rva 0x1388600  public void OnDeserialized(StreamingContext _) { } */
    OnDeserialized(_: any): void {
        if (this.serializedEnemyParameterMstId === 0) {
            this._BattleParameter = this.serializeBattleParameter;
            return;
        }
        const mst = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel).GetModelByKey(this.serializedEnemyParameterMstId);
        const breakMst = BattleMstReaderBase.get_Instance<BreakMstModel, BreakMstRecord, int>(BreakMstModel).GetModelByKey(mst.BreakMstId);
        this._BattleParameter = new QuestEnemyAppearanceParameter().ctor$QuestEnemyAppearanceMstModel_BreakMstModel(mst, breakMst);
        // (the call list also has GetPassiveSkills; Ghidra's body ends before it: re-check when deserialization is used)
    }
    /** @rva 0x1387B90  public float GetTotalEffectHitRate(UnitStateBase targetState) { } */
    GetTotalEffectHitRate(targetState: UnitStateBase): float {
        let rate = 0;
        if (targetState.Direction === 1) rate = f32(this.GetProcessedEffectHitRate() + 0);
        if (targetState instanceof AbnormalUnitStateBase) rate = f32(rate + f32(this.GetAllAbnormalHitRate() / 100));
        return Math.max(f32(rate + 1), 0); // Math.Max(rate + 1f, 0f)
    }
    /** @rva 0x1383D10  public float GetAllAbnormalHitRate() { } */
    GetAllAbnormalHitRate(): float {
        let rate = 0;
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IAbnormalHitRateVariation")) continue;
            const v = state as unknown as IAbnormalHitRateVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetAbnormalHitRateVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IAbnormalHitRateVariation")) continue;
            const v = state as unknown as IAbnormalHitRateVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetAbnormalHitRateVariationValue(this, rate));
        }
        return rate;
    }
    /** @rva 0x1387CD0  public float GetTotalEffectParryRate(UnitStateBase targetState) { } */
    GetTotalEffectParryRate(targetState: UnitStateBase): float {
        let rate = 0;
        if (targetState.Direction === 1) rate = f32(this.GetProcessedEffectParryRate() + 0);
        rate = f32(1 - rate);
        return rate < 0 ? 0 : 1 < rate ? 1 : rate;
    }
    /** @rva 0x1387D90  public float GetTotalSecondaryEffectParryRate(UnitStateBase targetState) { } */
    GetTotalSecondaryEffectParryRate$UnitStateBase(targetState: UnitStateBase): float {
        let rate = 0;
        if (targetState instanceof StunUnitState) rate = f32(f32(this.Condition.RepeatStunParryRate / 100) + 0);
        if (targetState instanceof AbnormalUnitStateBase) {
            const abnormal = clamp(f32(this.GetAbnormalParryRatio$UnitStateBase(targetState) / 100), 0, 1); // GetAbnormalParryRate (inlined)
            rate = f32(f32(f32(this.GetAllAbnormalParryRate() / 100) + abnormal) + rate);
        }
        rate = f32(1 - rate);
        return 0 <= rate ? (rate <= 1 ? rate : 1) : 0;
    }
    /** @rva 0x1388070  public float GetTotalSecondaryEffectParryRate(Type targetStateType) { } */
    GetTotalSecondaryEffectParryRate$Type(targetStateType: Type): float {
        let rate = 0;
        // typeof(IDebuff).IsAssignableFrom(targetStateType) is evaluated and discarded in 3.19.0 (no effect)
        if (isAssignableFrom(StunUnitState, targetStateType)) rate = f32(f32(this.Condition.RepeatStunParryRate / 100) + 0);
        if (isAssignableFrom(AbnormalUnitStateBase, targetStateType)) {
            const abnormal = clamp(f32(this.GetAbnormalParryRatio$Type(targetStateType) / 100), 0, 1);
            rate = f32(f32(f32(this.GetAllAbnormalParryRate() / 100) + abnormal) + rate);
        }
        rate = f32(1 - rate);
        return 0 <= rate ? (rate <= 1 ? rate : 1) : 0;
    }
    /** @rva 0x1384010  public float GetAllAbnormalParryRate() { } */
    GetAllAbnormalParryRate(): float {
        let rate = 0;
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IAbnormalParryRateVariation")) continue;
            const v = state as unknown as IAbnormalParryRateVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetAbnormalParryRateVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IAbnormalParryRateVariation")) continue;
            const v = state as unknown as IAbnormalParryRateVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetAbnormalParryRateVariationValue(this, rate));
        }
        return rate;
    }
    /** @rva 0x1384AA0  public float GetProcessedAtk() { } */
    GetProcessedAtk(): float { return this.GetProcessedAtkDecimal().toFloat(); }
    /** @rva 0x1384620  public Decimal GetProcessedAtkDecimal() { } */
    GetProcessedAtkDecimal(): Decimal {
        let value: Decimal = Decimal.fromInt(this.BattleParameter.ATK);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IAtkVariation")) continue;
            const v = state as unknown as IAtkVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add(v.GetAtkVariationValue(this, value));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IAtkVariation")) continue;
            const v = state as unknown as IAtkVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add(v.GetAtkVariationValue(this, value));
        }
        return value.lt(Decimal.Zero) ? Decimal.Zero : value;
    }
    /** @rva 0x1385A30  public float GetProcessedDef() { } */
    GetProcessedDef(): float { return this.GetProcessedDefDecimal().toFloat(); }
    /** @rva 0x13855B0  public Decimal GetProcessedDefDecimal() { } */
    GetProcessedDefDecimal(): Decimal {
        let value: Decimal = Decimal.fromInt(this.BattleParameter.DEF);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IDefVariation")) continue;
            const v = state as unknown as IDefVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add(v.GetDefVariationValue(this, value));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IDefVariation")) continue;
            const v = state as unknown as IDefVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add(v.GetDefVariationValue(this, value));
        }
        return value.lt(Decimal.Zero) ? Decimal.Zero : value;
    }
    /** @rva 0x13871F0  public float GetProcessedSpeed() { } */
    GetProcessedSpeed(): float {
        let value: Decimal = Decimal.fromInt(this.BattleParameter.Speed);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "ISpeedVariation")) continue;
            const v = state as unknown as ISpeedVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add(v.GetSpeedVariationValue(this, value));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "ISpeedVariation")) continue;
            const v = state as unknown as ISpeedVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add(v.GetSpeedVariationValue(this, value));
        }
        if (value.lt(Decimal.Zero)) value = Decimal.Zero;
        return value.toFloat();
    }
    /** @rva 0x1385160  public float GetProcessedCtr() { } */
    GetProcessedCtr(): float {
        let rate = f32(this.BattleParameter.CTR / 10);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "ICtrVariation")) continue;
            const v = state as unknown as ICtrVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetCtrVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "ICtrVariation")) continue;
            const v = state as unknown as ICtrVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetCtrVariationValue(this, rate));
        }
        return 0 > rate ? 0 : rate;
    }
    /** @rva 0x1386ED0  public float GetProcessedRcvCtr(BattleUnit attackUnit) { } */
    GetProcessedRcvCtr(attackUnit: BattleUnit): float {
        let rate = 0;
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IRcvCtrVariation")) continue;
            const v = state as unknown as IRcvCtrVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetRcvCtrVariationValue(attackUnit, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IRcvCtrVariation")) continue;
            const v = state as unknown as IRcvCtrVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetRcvCtrVariationValue(attackUnit, rate));
        }
        return 0 > rate ? 0 : rate;
    }
    /** @rva 0x1386CF0  public float GetProcessedRcvCtd(BattleUnit attackUnit) { } */
    GetProcessedRcvCtd(attackUnit: BattleUnit): float {
        let rate = 0;
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IRcvCtdVariation")) continue;
            const v = state as unknown as IRcvCtdVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetRcvCtdVariationValue(attackUnit, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IRcvCtdVariation")) continue;
            const v = state as unknown as IRcvCtdVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetRcvCtdVariationValue(attackUnit, rate));
        }
        return 0 > rate ? 0 : rate;
    }
    /** @rva 0x1384E40  public float GetProcessedCtd() { } */
    GetProcessedCtd(): float {
        let rate = f32(this.BattleParameter.CTD / 10);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "ICtdVariation")) continue;
            const v = state as unknown as ICtdVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetCtdVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "ICtdVariation")) continue;
            const v = state as unknown as ICtdVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetCtdVariationValue(this, rate));
        }
        return 0 > rate ? 0 : rate;
    }
    /** @rva 0x1385AA0  public float GetProcessedEffectHitRate() { } */
    GetProcessedEffectHitRate(): float {
        let rate = f32(this.BattleParameter.EffectHitRate / 10);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IEffectHitRateVariation")) continue;
            const v = state as unknown as IEffectHitRateVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetEffectHitRateVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IEffectHitRateVariation")) continue;
            const v = state as unknown as IEffectHitRateVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetEffectHitRateVariationValue(this, rate));
        }
        return clamp(f32(rate / 100), 0, 1);
    }
    /** @rva 0x1385DF0  public float GetProcessedEffectParryRate() { } */
    GetProcessedEffectParryRate(): float {
        let rate = f32(this.BattleParameter.EffectParryRate / 10);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IEffectParryRateVariation")) continue;
            const v = state as unknown as IEffectParryRateVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetEffectParryRateVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IEffectParryRateVariation")) continue;
            const v = state as unknown as IEffectParryRateVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetEffectParryRateVariationValue(this, rate));
        }
        return clamp(f32(rate / 100), 0, 1);
    }
    /** @rva 0x13869F0  public float GetProcessedHealRatio() { } */
    GetProcessedHealRatio(): float {
        let rate = f32(this.BattleParameter.HealRate / 10);
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IHealRateVariation")) continue;
            const v = state as unknown as IHealRateVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetHealRateVariationValue(rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IHealRateVariation")) continue;
            const v = state as unknown as IHealRateVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetHealRateVariationValue(rate));
        }
        return rate;
    }
    /** @rva 0x1386140  public Decimal GetProcessedElementDamageRate(TargetElementType attackElement) { } */
    GetProcessedElementDamageRate(attackElement: TargetElementType): Decimal {
        let value: Decimal = Decimal.fromParts(0, 0, 0, false, 1); // 0.0
        const rate = this.BattleParameter.ElementDamageRates.find(r => r.Element === attackElement) ?? null; // DisplayClass193_0 b__0
        if (rate != null) value = Decimal.fromInt(rate.DamageRate).div(Decimal.fromInt(10));
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IElementDamageRateVariation")) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add((state as unknown as IElementDamageRateVariation).GetElementDamageRateVariationValue(this, attackElement));
        }
        return value;
    }
    /** @rva 0x13864C0  public Decimal GetProcessedElementResistRate(TargetElementType attackElement) { } */
    GetProcessedElementResistRate(attackElement: TargetElementType): Decimal {
        let value: Decimal = Decimal.fromParts(0, 0, 0, false, 1); // 0.0
        const rate = this.BattleParameter.ElementResistRates.find(r => r.Element === attackElement) ?? null; // DisplayClass194_0 b__0
        if (rate != null) value = Decimal.fromInt(rate.ResistRate).div(Decimal.fromInt(10));
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IElementResistVariation")) continue;
            if (state.IsActive$BattleUnit(this)) value = value.add((state as unknown as IElementResistVariation).GetElementResistVariationValue(this, attackElement));
        }
        return Decimal.clamp(value, Decimal.fromInt(-999), Decimal.fromInt(999)); // Math.Clamp(value, -999m, 999m)
    }
    /** @rva 0x1384B10  public float GetProcessedBreakedDamageReceiveRatio() { } */
    GetProcessedBreakedDamageReceiveRatio(): float {
        let rate = 100;
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IBreakedDamageReceiveRatioVariation")) continue;
            const v = state as unknown as IBreakedDamageReceiveRatioVariation;
            if (v.Addition !== AdditionType.Up) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetBreakedDamageReceiveRatioVariationValue(this, rate));
        }
        for (const state of this.Condition.StateList) {
            if (!isImpl(state, "IBreakedDamageReceiveRatioVariation")) continue;
            const v = state as unknown as IBreakedDamageReceiveRatioVariation;
            if (v.Addition !== AdditionType.Down) continue;
            if (state.IsActive$BattleUnit(this)) rate = f32(rate + v.GetBreakedDamageReceiveRatioVariationValue(this, rate));
        }
        return f32(rate - 100);
    }
    /** @rva 0x1385480  public Decimal GetProcessedDamageBaseParamValueDecimal(DamageBaseType damageBaseType) { } */
    GetProcessedDamageBaseParamValueDecimal(damageBaseType: DamageBaseType): Decimal {
        switch (damageBaseType as number) {
            case 1: return this.GetProcessedAtkDecimal();
            case 2: return this.GetProcessedDefDecimal();
            case 3: return Decimal.fromInt(this._MaxHP);
            default: throw new Error(`不正な DamageBaseType です：${enumToString(DamageBaseType$, damageBaseType)}`);
        }
    }
    /** @rva 0x1388A60  private bool <GetStateListForDecide>b__164_0(UnitStateBase state) { } */
    $GetStateListForDecide$b__164_0(state: UnitStateBase): boolean {
        if (!isImpl(state, "IRequiredStateForDecide")) return false;
        return state.IsActive$BattleUnit(this);
    }
}

// ---- ReDriveBattleCore.BattleUnit.TeamType  (TypeDefIndex 347, public enum) ----
export const BattleUnit_TeamType = {
    Ally: 0,
    Enemy: 1,
} as const;
export type BattleUnit_TeamType = (typeof BattleUnit_TeamType)[keyof typeof BattleUnit_TeamType];
