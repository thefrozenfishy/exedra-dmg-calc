// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, float, int } from "../runtime";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectBase_TargetSideType } from "./AbilityEffect/AbilityEffectBase";
import type { CorrelationDamageType } from "./CorrelationDamageType";
import type { DamageCategory } from "./DamageCategory";
import type { EffectOriginType } from "./UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AffectedUnitNotice  (TypeDefIndex 313, public class) ----
export class AffectedUnitNotice {
    /** 0x10 private int <AffectedUnitId>k__BackingField */
    _AffectedUnitId: int = 0;
    /** 0x18 public AffectedUnitNotice.DamageInfo[] Damages */
    Damages: AffectedUnitNotice_DamageInfo[] = null!;
    /** 0x20 private AffectedUnitNotice.DamageInfo <BreakDamage>k__BackingField */
    _BreakDamage: AffectedUnitNotice_DamageInfo = null!;
    /** 0x28 public AffectedUnitNotice.DamageInfo[] BarrierDamages */
    BarrierDamages: AffectedUnitNotice_DamageInfo[] = null!;
    /** 0x30 private bool <IsReceivedAttack>k__BackingField */
    _IsReceivedAttack: boolean = false;
    /** 0x31 private bool <IsVisibleOnAttack>k__BackingField */
    _IsVisibleOnAttack: boolean = false;
    /** 0x34 private int <RecoveryValue>k__BackingField */
    _RecoveryValue: int = 0;
    /** 0x38 private bool <IsReceivedRecovery>k__BackingField */
    _IsReceivedRecovery: boolean = false;
    /** 0x3C private float <TurnGaugeVariation>k__BackingField */
    _TurnGaugeVariation: float = 0;
    /** 0x40 private bool <IsDead>k__BackingField */
    _IsDead: boolean = false;
    /** 0x41 private bool <IsRevived>k__BackingField */
    _IsRevived: boolean = false;
    /** 0x42 private bool <IsSummoned>k__BackingField */
    _IsSummoned: boolean = false;
    /** 0x43 private bool <IsResetBreakPoint>k__BackingField */
    _IsResetBreakPoint: boolean = false;
    /** 0x44 private bool <CanNotAction>k__BackingField */
    _CanNotAction: boolean = false;
    /** 0x45 private bool <FinishCanNotAction>k__BackingField */
    _FinishCanNotAction: boolean = false;
    /** 0x46 private bool <FinishLockTurnOrder>k__BackingField */
    _FinishLockTurnOrder: boolean = false;
    /** 0x47 private bool <IsBarrierAdded>k__BackingField */
    _IsBarrierAdded: boolean = false;
    /** 0x48 private int <BarrierValue>k__BackingField */
    _BarrierValue: int = 0;
    /** 0x4C private bool <IsBarrierAttacked>k__BackingField */
    _IsBarrierAttacked: boolean = false;
    /** 0x4D private bool <IsBarrierDestroyed>k__BackingField */
    _IsBarrierDestroyed: boolean = false;
    /** 0x4E private bool <IsReceivedReflection>k__BackingField */
    _IsReceivedReflection: boolean = false;
    /** 0x4F private bool <IsCounterAttack>k__BackingField */
    _IsCounterAttack: boolean = false;
    /** 0x50 private int <BreakedDamageReceiveRateUpValue>k__BackingField */
    _BreakedDamageReceiveRateUpValue: int = 0;
    /** 0x54 private bool <IsBreakedDamageReceiveRateBecomeMax>k__BackingField */
    _IsBreakedDamageReceiveRateBecomeMax: boolean = false;
    /** 0x55 private bool <IsWeakElementAttacked>k__BackingField */
    _IsWeakElementAttacked: boolean = false;
    /** 0x58 private List<string> <DamageVisualEffectList>k__BackingField */
    _DamageVisualEffectList: List<string> = null!;
    /** 0x60 private List<string> <NonDamageVisualEffectList>k__BackingField */
    _NonDamageVisualEffectList: List<string> = null!;
    /** 0x68 private List<AffectedUnitNotice.AddStateInfo> <AddStateInfoList>k__BackingField */
    _AddStateInfoList: List<AffectedUnitNotice_AddStateInfo> = null!;
    /** 0x70 private List<string> <ReceivedSlipDamageEffectTypeList>k__BackingField */
    _ReceivedSlipDamageEffectTypeList: List<string> = null!;
    get AffectedUnitId(): int { return this.get_AffectedUnitId(); }
    set AffectedUnitId(v: int) { this.set_AffectedUnitId(v); }
    get BreakDamage(): AffectedUnitNotice_DamageInfo { return this.get_BreakDamage(); }
    set BreakDamage(v: AffectedUnitNotice_DamageInfo) { this.set_BreakDamage(v); }
    get IsReceivedAttack(): boolean { return this.get_IsReceivedAttack(); }
    set IsReceivedAttack(v: boolean) { this.set_IsReceivedAttack(v); }
    get IsVisibleOnAttack(): boolean { return this.get_IsVisibleOnAttack(); }
    set IsVisibleOnAttack(v: boolean) { this.set_IsVisibleOnAttack(v); }
    get RecoveryValue(): int { return this.get_RecoveryValue(); }
    set RecoveryValue(v: int) { this.set_RecoveryValue(v); }
    get IsReceivedRecovery(): boolean { return this.get_IsReceivedRecovery(); }
    set IsReceivedRecovery(v: boolean) { this.set_IsReceivedRecovery(v); }
    get TurnGaugeVariation(): float { return this.get_TurnGaugeVariation(); }
    set TurnGaugeVariation(v: float) { this.set_TurnGaugeVariation(v); }
    get IsDead(): boolean { return this.get_IsDead(); }
    set IsDead(v: boolean) { this.set_IsDead(v); }
    get IsRevived(): boolean { return this.get_IsRevived(); }
    set IsRevived(v: boolean) { this.set_IsRevived(v); }
    get IsSummoned(): boolean { return this.get_IsSummoned(); }
    set IsSummoned(v: boolean) { this.set_IsSummoned(v); }
    get IsResetBreakPoint(): boolean { return this.get_IsResetBreakPoint(); }
    set IsResetBreakPoint(v: boolean) { this.set_IsResetBreakPoint(v); }
    get CanNotAction(): boolean { return this.get_CanNotAction(); }
    set CanNotAction(v: boolean) { this.set_CanNotAction(v); }
    get FinishCanNotAction(): boolean { return this.get_FinishCanNotAction(); }
    set FinishCanNotAction(v: boolean) { this.set_FinishCanNotAction(v); }
    get FinishLockTurnOrder(): boolean { return this.get_FinishLockTurnOrder(); }
    set FinishLockTurnOrder(v: boolean) { this.set_FinishLockTurnOrder(v); }
    get IsBarrierAdded(): boolean { return this.get_IsBarrierAdded(); }
    set IsBarrierAdded(v: boolean) { this.set_IsBarrierAdded(v); }
    get BarrierValue(): int { return this.get_BarrierValue(); }
    set BarrierValue(v: int) { this.set_BarrierValue(v); }
    get IsBarrierAttacked(): boolean { return this.get_IsBarrierAttacked(); }
    set IsBarrierAttacked(v: boolean) { this.set_IsBarrierAttacked(v); }
    get IsBarrierDestroyed(): boolean { return this.get_IsBarrierDestroyed(); }
    set IsBarrierDestroyed(v: boolean) { this.set_IsBarrierDestroyed(v); }
    get IsReceivedReflection(): boolean { return this.get_IsReceivedReflection(); }
    set IsReceivedReflection(v: boolean) { this.set_IsReceivedReflection(v); }
    get IsCounterAttack(): boolean { return this.get_IsCounterAttack(); }
    set IsCounterAttack(v: boolean) { this.set_IsCounterAttack(v); }
    get BreakedDamageReceiveRateUpValue(): int { return this.get_BreakedDamageReceiveRateUpValue(); }
    set BreakedDamageReceiveRateUpValue(v: int) { this.set_BreakedDamageReceiveRateUpValue(v); }
    get IsBreakedDamageReceiveRateBecomeMax(): boolean { return this.get_IsBreakedDamageReceiveRateBecomeMax(); }
    set IsBreakedDamageReceiveRateBecomeMax(v: boolean) { this.set_IsBreakedDamageReceiveRateBecomeMax(v); }
    get IsWeakElementAttacked(): boolean { return this.get_IsWeakElementAttacked(); }
    set IsWeakElementAttacked(v: boolean) { this.set_IsWeakElementAttacked(v); }
    get DamageVisualEffectList(): List<string> { return this.get_DamageVisualEffectList(); }
    set DamageVisualEffectList(v: List<string>) { this.set_DamageVisualEffectList(v); }
    get NonDamageVisualEffectList(): List<string> { return this.get_NonDamageVisualEffectList(); }
    set NonDamageVisualEffectList(v: List<string>) { this.set_NonDamageVisualEffectList(v); }
    get AddStateInfoList(): List<AffectedUnitNotice_AddStateInfo> { return this.get_AddStateInfoList(); }
    set AddStateInfoList(v: List<AffectedUnitNotice_AddStateInfo>) { this.set_AddStateInfoList(v); }
    get ReceivedSlipDamageEffectTypeList(): List<string> { return this.get_ReceivedSlipDamageEffectTypeList(); }
    set ReceivedSlipDamageEffectTypeList(v: List<string>) { this.set_ReceivedSlipDamageEffectTypeList(v); }
    get IsReceivedDamage(): boolean { return this.get_IsReceivedDamage(); }
    /** @rva 0x7364F0  public int get_AffectedUnitId() { } */
    get_AffectedUnitId(): int { return this._AffectedUnitId; /* auto-property */ }
    /** @rva 0x739D00  public void set_AffectedUnitId(int value) { } */
    set_AffectedUnitId(value: int): void { this._AffectedUnitId = value; /* auto-property */ }
    /** @rva 0x7369E0  public AffectedUnitNotice.DamageInfo get_BreakDamage() { } */
    get_BreakDamage(): AffectedUnitNotice_DamageInfo { return this._BreakDamage; /* auto-property */ }
    /** @rva 0x736A50  public void set_BreakDamage(AffectedUnitNotice.DamageInfo value) { } */
    set_BreakDamage(value: AffectedUnitNotice_DamageInfo): void { this._BreakDamage = value; /* auto-property */ }
    /** @rva 0x75F800  public bool get_IsReceivedAttack() { } */
    get_IsReceivedAttack(): boolean { return this._IsReceivedAttack; /* auto-property */ }
    /** @rva 0x75F830  public void set_IsReceivedAttack(bool value) { } */
    set_IsReceivedAttack(value: boolean): void { this._IsReceivedAttack = value; /* auto-property */ }
    /** @rva 0x75F810  public bool get_IsVisibleOnAttack() { } */
    get_IsVisibleOnAttack(): boolean { return this._IsVisibleOnAttack; /* auto-property */ }
    /** @rva 0x75F840  public void set_IsVisibleOnAttack(bool value) { } */
    set_IsVisibleOnAttack(value: boolean): void { this._IsVisibleOnAttack = value; /* auto-property */ }
    /** @rva 0x75ED50  public int get_RecoveryValue() { } */
    get_RecoveryValue(): int { return this._RecoveryValue; /* auto-property */ }
    /** @rva 0x8A22A0  public void set_RecoveryValue(int value) { } */
    set_RecoveryValue(value: int): void { this._RecoveryValue = value; /* auto-property */ }
    /** @rva 0x7388E0  public bool get_IsReceivedRecovery() { } */
    get_IsReceivedRecovery(): boolean { return this._IsReceivedRecovery; /* auto-property */ }
    /** @rva 0x7388F0  public void set_IsReceivedRecovery(bool value) { } */
    set_IsReceivedRecovery(value: boolean): void { this._IsReceivedRecovery = value; /* auto-property */ }
    /** @rva 0x9FD120  public float get_TurnGaugeVariation() { } */
    get_TurnGaugeVariation(): float { return this._TurnGaugeVariation; /* auto-property */ }
    /** @rva 0x1379E60  public void set_TurnGaugeVariation(float value) { } */
    set_TurnGaugeVariation(value: float): void { this._TurnGaugeVariation = value; /* auto-property */ }
    /** @rva 0x902790  public bool get_IsDead() { } */
    get_IsDead(): boolean { return this._IsDead; /* auto-property */ }
    /** @rva 0x9027C0  public void set_IsDead(bool value) { } */
    set_IsDead(value: boolean): void { this._IsDead = value; /* auto-property */ }
    /** @rva 0xA0E570  public bool get_IsRevived() { } */
    get_IsRevived(): boolean { return this._IsRevived; /* auto-property */ }
    /** @rva 0xA0E580  public void set_IsRevived(bool value) { } */
    set_IsRevived(value: boolean): void { this._IsRevived = value; /* auto-property */ }
    /** @rva 0xD2C250  public bool get_IsSummoned() { } */
    get_IsSummoned(): boolean { return this._IsSummoned; /* auto-property */ }
    /** @rva 0xF60FA0  public void set_IsSummoned(bool value) { } */
    set_IsSummoned(value: boolean): void { this._IsSummoned = value; /* auto-property */ }
    /** @rva 0xD2C1C0  public bool get_IsResetBreakPoint() { } */
    get_IsResetBreakPoint(): boolean { return this._IsResetBreakPoint; /* auto-property */ }
    /** @rva 0x12D53C0  public void set_IsResetBreakPoint(bool value) { } */
    set_IsResetBreakPoint(value: boolean): void { this._IsResetBreakPoint = value; /* auto-property */ }
    /** @rva 0x8F3F20  public bool get_CanNotAction() { } */
    get_CanNotAction(): boolean { return this._CanNotAction; /* auto-property */ }
    /** @rva 0x902BA0  public void set_CanNotAction(bool value) { } */
    set_CanNotAction(value: boolean): void { this._CanNotAction = value; /* auto-property */ }
    /** @rva 0x8F3F50  public bool get_FinishCanNotAction() { } */
    get_FinishCanNotAction(): boolean { return this._FinishCanNotAction; /* auto-property */ }
    /** @rva 0x902B90  public void set_FinishCanNotAction(bool value) { } */
    set_FinishCanNotAction(value: boolean): void { this._FinishCanNotAction = value; /* auto-property */ }
    /** @rva 0x8F3F30  public bool get_FinishLockTurnOrder() { } */
    get_FinishLockTurnOrder(): boolean { return this._FinishLockTurnOrder; /* auto-property */ }
    /** @rva 0xF1E070  public void set_FinishLockTurnOrder(bool value) { } */
    set_FinishLockTurnOrder(value: boolean): void { this._FinishLockTurnOrder = value; /* auto-property */ }
    /** @rva 0x8F3F10  public bool get_IsBarrierAdded() { } */
    get_IsBarrierAdded(): boolean { return this._IsBarrierAdded; /* auto-property */ }
    /** @rva 0x1379E40  public void set_IsBarrierAdded(bool value) { } */
    set_IsBarrierAdded(value: boolean): void { this._IsBarrierAdded = value; /* auto-property */ }
    /** @rva 0x854810  public int get_BarrierValue() { } */
    get_BarrierValue(): int { return this._BarrierValue; /* auto-property */ }
    /** @rva 0x902050  public void set_BarrierValue(int value) { } */
    set_BarrierValue(value: int): void { this._BarrierValue = value; /* auto-property */ }
    /** @rva 0x9FD230  public bool get_IsBarrierAttacked() { } */
    get_IsBarrierAttacked(): boolean { return this._IsBarrierAttacked; /* auto-property */ }
    /** @rva 0xA107C0  public void set_IsBarrierAttacked(bool value) { } */
    set_IsBarrierAttacked(value: boolean): void { this._IsBarrierAttacked = value; /* auto-property */ }
    /** @rva 0x9FD280  public bool get_IsBarrierDestroyed() { } */
    get_IsBarrierDestroyed(): boolean { return this._IsBarrierDestroyed; /* auto-property */ }
    /** @rva 0xA14B90  public void set_IsBarrierDestroyed(bool value) { } */
    set_IsBarrierDestroyed(value: boolean): void { this._IsBarrierDestroyed = value; /* auto-property */ }
    /** @rva 0x9FD240  public bool get_IsReceivedReflection() { } */
    get_IsReceivedReflection(): boolean { return this._IsReceivedReflection; /* auto-property */ }
    /** @rva 0xA14BA0  public void set_IsReceivedReflection(bool value) { } */
    set_IsReceivedReflection(value: boolean): void { this._IsReceivedReflection = value; /* auto-property */ }
    /** @rva 0x9FD2C0  public bool get_IsCounterAttack() { } */
    get_IsCounterAttack(): boolean { return this._IsCounterAttack; /* auto-property */ }
    /** @rva 0xA14BB0  public void set_IsCounterAttack(bool value) { } */
    set_IsCounterAttack(value: boolean): void { this._IsCounterAttack = value; /* auto-property */ }
    /** @rva 0x7545F0  public int get_BreakedDamageReceiveRateUpValue() { } */
    get_BreakedDamageReceiveRateUpValue(): int { return this._BreakedDamageReceiveRateUpValue; /* auto-property */ }
    /** @rva 0x7548B0  public void set_BreakedDamageReceiveRateUpValue(int value) { } */
    set_BreakedDamageReceiveRateUpValue(value: int): void { this._BreakedDamageReceiveRateUpValue = value; /* auto-property */ }
    /** @rva 0x87BB30  public bool get_IsBreakedDamageReceiveRateBecomeMax() { } */
    get_IsBreakedDamageReceiveRateBecomeMax(): boolean { return this._IsBreakedDamageReceiveRateBecomeMax; /* auto-property */ }
    /** @rva 0xA14B80  public void set_IsBreakedDamageReceiveRateBecomeMax(bool value) { } */
    set_IsBreakedDamageReceiveRateBecomeMax(value: boolean): void { this._IsBreakedDamageReceiveRateBecomeMax = value; /* auto-property */ }
    /** @rva 0x8DD9C0  public bool get_IsWeakElementAttacked() { } */
    get_IsWeakElementAttacked(): boolean { return this._IsWeakElementAttacked; /* auto-property */ }
    /** @rva 0x1379E50  public void set_IsWeakElementAttacked(bool value) { } */
    set_IsWeakElementAttacked(value: boolean): void { this._IsWeakElementAttacked = value; /* auto-property */ }
    /** @rva 0x736900  public List<string> get_DamageVisualEffectList() { } */
    get_DamageVisualEffectList(): List<string> { return this._DamageVisualEffectList; /* auto-property */ }
    /** @rva 0x736A10  public void set_DamageVisualEffectList(List<string> value) { } */
    set_DamageVisualEffectList(value: List<string>): void { this._DamageVisualEffectList = value; /* auto-property */ }
    /** @rva 0x737A10  public List<string> get_NonDamageVisualEffectList() { } */
    get_NonDamageVisualEffectList(): List<string> { return this._NonDamageVisualEffectList; /* auto-property */ }
    /** @rva 0x737A50  public void set_NonDamageVisualEffectList(List<string> value) { } */
    set_NonDamageVisualEffectList(value: List<string>): void { this._NonDamageVisualEffectList = value; /* auto-property */ }
    /** @rva 0x737A30  public List<AffectedUnitNotice.AddStateInfo> get_AddStateInfoList() { } */
    get_AddStateInfoList(): List<AffectedUnitNotice_AddStateInfo> { return this._AddStateInfoList; /* auto-property */ }
    /** @rva 0x737A70  public void set_AddStateInfoList(List<AffectedUnitNotice.AddStateInfo> value) { } */
    set_AddStateInfoList(value: List<AffectedUnitNotice_AddStateInfo>): void { this._AddStateInfoList = value; /* auto-property */ }
    /** @rva 0x737A20  public List<string> get_ReceivedSlipDamageEffectTypeList() { } */
    get_ReceivedSlipDamageEffectTypeList(): List<string> { return this._ReceivedSlipDamageEffectTypeList; /* auto-property */ }
    /** @rva 0x737A60  public void set_ReceivedSlipDamageEffectTypeList(List<string> value) { } */
    set_ReceivedSlipDamageEffectTypeList(value: List<string>): void { this._ReceivedSlipDamageEffectTypeList = value; /* auto-property */ }
    /** @rva 0x1379940  public bool get_IsReceivedDamage() { } */
    get_IsReceivedDamage(): boolean { return notPorted("AffectedUnitNotice.get_IsReceivedDamage", 0x1379940); }
    /** @rva 0x13797E0  public void .ctor() { } */
    ctor(): this { return notPorted("AffectedUnitNotice..ctor", 0x13797E0); }
    /** @rva 0x1379670  public void .ctor(int affectedUnitId) { } */
    ctor$int(affectedUnitId: int): this { return notPorted("AffectedUnitNotice..ctor", 0x1379670); }
    /** @rva 0x1378A40  public static AffectedUnitNotice CreateByDamage(int affectedUnitId, int damageValue, DamageCategory damageCategory, bool isCritical, CorrelationDamageType correlationDamageType, List<string> visualEffectList, TargetElementType attackElement = 0, bool isBreakBonusApplied = False) { } */
    static CreateByDamage(affectedUnitId: int, damageValue: int, damageCategory: DamageCategory, isCritical: boolean, correlationDamageType: CorrelationDamageType, visualEffectList: List<string>, attackElement?: TargetElementType /* = 0 */, isBreakBonusApplied?: boolean /* = False */): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByDamage", 0x1378A40); }
    /** @rva 0x1378650  public static AffectedUnitNotice CreateByBarrierDamage(int affectedUnitId, int damageValue, DamageCategory damageCategory, bool isCritical, CorrelationDamageType correlationDamageType, List<string> visualEffectList, TargetElementType attackElement = 0, bool isBreakBonusApplied = False) { } */
    static CreateByBarrierDamage(affectedUnitId: int, damageValue: int, damageCategory: DamageCategory, isCritical: boolean, correlationDamageType: CorrelationDamageType, visualEffectList: List<string>, attackElement?: TargetElementType /* = 0 */, isBreakBonusApplied?: boolean /* = False */): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByBarrierDamage", 0x1378650); }
    /** @rva 0x1378DF0  public static AffectedUnitNotice CreateByRecovery(int affectedUnitId, int recoveryValue, bool isRevival = False) { } */
    static CreateByRecovery(affectedUnitId: int, recoveryValue: int, isRevival?: boolean /* = False */): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByRecovery", 0x1378DF0); }
    /** @rva 0x1379130  public static AffectedUnitNotice CreateByTurnGaugeVariation(int affectedUnitId, float turnGaugeVariation) { } */
    static CreateByTurnGaugeVariation(affectedUnitId: int, turnGaugeVariation: float): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByTurnGaugeVariation", 0x1379130); }
    /** @rva 0x1379010  public static AffectedUnitNotice CreateByRemoveState(int affectedUnitId, AbilityEffectBase.TargetSideType targetSide) { } */
    static CreateByRemoveState(affectedUnitId: int, targetSide: AbilityEffectBase_TargetSideType): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByRemoveState", 0x1379010); }
    /** @rva 0x1378CF0  public static AffectedUnitNotice CreateByOneState(int affectedUnitId, string visualEffect) { } */
    static CreateByOneState(affectedUnitId: int, visualEffect: string): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByOneState", 0x1378CF0); }
    /** @rva 0x1378920  public static AffectedUnitNotice CreateByBarrier(int affectedUnitId, bool isCharacterFigure, int barrierValue) { } */
    static CreateByBarrier(affectedUnitId: int, isCharacterFigure: boolean, barrierValue: int): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByBarrier", 0x1378920); }
    /** @rva 0x1378800  public static AffectedUnitNotice CreateByBarrierHit(int affectedUnitId, bool isCharacterFigure, bool isBarrierDestroyed) { } */
    static CreateByBarrierHit(affectedUnitId: int, isCharacterFigure: boolean, isBarrierDestroyed: boolean): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByBarrierHit", 0x1378800); }
    /** @rva 0x1378F10  public static AffectedUnitNotice CreateByReflection(int affectedUnitId) { } */
    static CreateByReflection(affectedUnitId: int): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByReflection", 0x1378F10); }
    /** @rva 0x1378BF0  public static AffectedUnitNotice CreateByDisabledDamageHit(int affectedUnitId) { } */
    static CreateByDisabledDamageHit(affectedUnitId: int): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByDisabledDamageHit", 0x1378BF0); }
    /** @rva 0x1378550  public static AffectedUnitNotice CreateByAddStateInfo(int affectedUnitId, AffectedUnitNotice.AddStateInfo addStateInfo) { } */
    static CreateByAddStateInfo(affectedUnitId: int, addStateInfo: AffectedUnitNotice_AddStateInfo): AffectedUnitNotice { return notPorted("AffectedUnitNotice.CreateByAddStateInfo", 0x1378550); }
    /** @rva 0x1379A90  public static AffectedUnitNotice op_Addition(AffectedUnitNotice notice1, AffectedUnitNotice notice2) { } */
    static op_Addition(notice1: AffectedUnitNotice, notice2: AffectedUnitNotice): AffectedUnitNotice { return notPorted("AffectedUnitNotice.op_Addition", 0x1379A90); }
    /** @rva 0x1379240  public int GetTotalDamageValue(bool includeBreakDamage = True) { } */
    GetTotalDamageValue(includeBreakDamage?: boolean /* = True */): int { return notPorted("AffectedUnitNotice.GetTotalDamageValue", 0x1379240); }
    /** @rva 0x1379440  public void SetDamageSequence(int seq) { } */
    SetDamageSequence(seq: int): void { return notPorted("AffectedUnitNotice.SetDamageSequence", 0x1379440); }
    /** @rva 0x13791A0  public List<AffectedUnitNotice.DamageInfo> GetDisplayDamageInfoList() { } */
    GetDisplayDamageInfoList(): List<AffectedUnitNotice_DamageInfo> { return notPorted("AffectedUnitNotice.GetDisplayDamageInfoList", 0x13791A0); }
    /** @rva 0x1379390  public bool HasAnyDamageOfCategory(DamageCategory category) { } */
    HasAnyDamageOfCategory(category: DamageCategory): boolean { return notPorted("AffectedUnitNotice.HasAnyDamageOfCategory", 0x1379390); }
    /** @rva 0x1379600  public bool ShouldSerializeDamages() { } */
    ShouldSerializeDamages(): boolean { return notPorted("AffectedUnitNotice.ShouldSerializeDamages", 0x1379600); }
    /** @rva 0xBE6780  public bool ShouldSerializeBarrierDamages() { } */
    ShouldSerializeBarrierDamages(): boolean { return notPorted("AffectedUnitNotice.ShouldSerializeBarrierDamages", 0xBE6780); }
    /** @rva 0x13795B0  public bool ShouldSerializeDamageVisualEffectList() { } */
    ShouldSerializeDamageVisualEffectList(): boolean { return notPorted("AffectedUnitNotice.ShouldSerializeDamageVisualEffectList", 0x13795B0); }
    /** @rva 0x1379620  public bool ShouldSerializeNonDamageVisualEffectList() { } */
    ShouldSerializeNonDamageVisualEffectList(): boolean { return notPorted("AffectedUnitNotice.ShouldSerializeNonDamageVisualEffectList", 0x1379620); }
    /** @rva 0x1379560  public bool ShouldSerializeAddStateInfoList() { } */
    ShouldSerializeAddStateInfoList(): boolean { return notPorted("AffectedUnitNotice.ShouldSerializeAddStateInfoList", 0x1379560); }
}

// ---- ReDriveBattleCore.AffectedUnitNotice.DamageInfo  (TypeDefIndex 309, public class) ----
export class AffectedUnitNotice_DamageInfo {
    /** 0x10 private int <DamageValue>k__BackingField */
    _DamageValue: int = 0;
    /** 0x14 private TargetElementType <AttackElement>k__BackingField */
    _AttackElement: TargetElementType = 0 as TargetElementType;
    /** 0x18 private bool <IsCritical>k__BackingField */
    _IsCritical: boolean = false;
    /** 0x1C private CorrelationDamageType <CorrelationDamageType>k__BackingField */
    _CorrelationDamageType: CorrelationDamageType = 0 as CorrelationDamageType;
    /** 0x20 private int <Sequence>k__BackingField */
    _Sequence: int = 0;
    /** 0x24 private bool <IsBreakBonusApplied>k__BackingField */
    _IsBreakBonusApplied: boolean = false;
    /** 0x25 private bool <IsMaxBreakBonusWhenHit>k__BackingField */
    _IsMaxBreakBonusWhenHit: boolean = false;
    /** 0x26 private bool <IsBarrierDamage>k__BackingField */
    _IsBarrierDamage: boolean = false;
    /** 0x28 private DamageCategory <Category>k__BackingField */
    _Category: DamageCategory = 0 as DamageCategory;
    get DamageValue(): int { return this.get_DamageValue(); }
    set DamageValue(v: int) { this.set_DamageValue(v); }
    get AttackElement(): TargetElementType { return this.get_AttackElement(); }
    set AttackElement(v: TargetElementType) { this.set_AttackElement(v); }
    get IsCritical(): boolean { return this.get_IsCritical(); }
    set IsCritical(v: boolean) { this.set_IsCritical(v); }
    get CorrelationDamageType(): CorrelationDamageType { return this.get_CorrelationDamageType(); }
    set CorrelationDamageType(v: CorrelationDamageType) { this.set_CorrelationDamageType(v); }
    get Sequence(): int { return this.get_Sequence(); }
    set Sequence(v: int) { this.set_Sequence(v); }
    get IsBreakBonusApplied(): boolean { return this.get_IsBreakBonusApplied(); }
    set IsBreakBonusApplied(v: boolean) { this.set_IsBreakBonusApplied(v); }
    get IsMaxBreakBonusWhenHit(): boolean { return this.get_IsMaxBreakBonusWhenHit(); }
    set IsMaxBreakBonusWhenHit(v: boolean) { this.set_IsMaxBreakBonusWhenHit(v); }
    get IsBarrierDamage(): boolean { return this.get_IsBarrierDamage(); }
    set IsBarrierDamage(v: boolean) { this.set_IsBarrierDamage(v); }
    set IsReflectionDamage(v: boolean) { this.set_IsReflectionDamage(v); }
    get Category(): DamageCategory { return this.get_Category(); }
    set Category(v: DamageCategory) { this.set_Category(v); }
    /** @rva 0x7364F0  public int get_DamageValue() { } */
    get_DamageValue(): int { return this._DamageValue; /* auto-property */ }
    /** @rva 0x739D00  public void set_DamageValue(int value) { } */
    set_DamageValue(value: int): void { this._DamageValue = value; /* auto-property */ }
    /** @rva 0x803350  public TargetElementType get_AttackElement() { } */
    get_AttackElement(): TargetElementType { return this._AttackElement; /* auto-property */ }
    /** @rva 0x803540  public void set_AttackElement(TargetElementType value) { } */
    set_AttackElement(value: TargetElementType): void { this._AttackElement = value; /* auto-property */ }
    /** @rva 0x7F97F0  public bool get_IsCritical() { } */
    get_IsCritical(): boolean { return this._IsCritical; /* auto-property */ }
    /** @rva 0x7F9810  public void set_IsCritical(bool value) { } */
    set_IsCritical(value: boolean): void { this._IsCritical = value; /* auto-property */ }
    /** @rva 0x7F9800  public CorrelationDamageType get_CorrelationDamageType() { } */
    get_CorrelationDamageType(): CorrelationDamageType { return this._CorrelationDamageType; /* auto-property */ }
    /** @rva 0x7F9820  public void set_CorrelationDamageType(CorrelationDamageType value) { } */
    set_CorrelationDamageType(value: CorrelationDamageType): void { this._CorrelationDamageType = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_Sequence() { } */
    get_Sequence(): int { return this._Sequence; /* auto-property */ }
    /** @rva 0x8A2230  public void set_Sequence(int value) { } */
    set_Sequence(value: int): void { this._Sequence = value; /* auto-property */ }
    /** @rva 0x8A21C0  public bool get_IsBreakBonusApplied() { } */
    get_IsBreakBonusApplied(): boolean { return this._IsBreakBonusApplied; /* auto-property */ }
    /** @rva 0x8A2270  public void set_IsBreakBonusApplied(bool value) { } */
    set_IsBreakBonusApplied(value: boolean): void { this._IsBreakBonusApplied = value; /* auto-property */ }
    /** @rva 0x8A21D0  public bool get_IsMaxBreakBonusWhenHit() { } */
    get_IsMaxBreakBonusWhenHit(): boolean { return this._IsMaxBreakBonusWhenHit; /* auto-property */ }
    /** @rva 0x8A2280  public void set_IsMaxBreakBonusWhenHit(bool value) { } */
    set_IsMaxBreakBonusWhenHit(value: boolean): void { this._IsMaxBreakBonusWhenHit = value; /* auto-property */ }
    /** @rva 0x8A21E0  public bool get_IsBarrierDamage() { } */
    get_IsBarrierDamage(): boolean { return this._IsBarrierDamage; /* auto-property */ }
    /** @rva 0x8A2290  public void set_IsBarrierDamage(bool value) { } */
    set_IsBarrierDamage(value: boolean): void { this._IsBarrierDamage = value; /* auto-property */ }
    /** @rva 0x138B530  public void set_IsReflectionDamage(bool value) { } */
    set_IsReflectionDamage(value: boolean): void { return notPorted("AffectedUnitNotice_DamageInfo.set_IsReflectionDamage", 0x138B530); }
    /** @rva 0x7637A0  public DamageCategory get_Category() { } */
    get_Category(): DamageCategory { return this._Category; /* auto-property */ }
    /** @rva 0x8A2250  public void set_Category(DamageCategory value) { } */
    set_Category(value: DamageCategory): void { this._Category = value; /* auto-property */ }
    /** @rva 0x138B4C0  public void .ctor(int damageValue, TargetElementType attackElement, DamageCategory category, bool isCritical = False, CorrelationDamageType correlationDamageType = 0, bool isBreakBonusApplied = False, bool isBarrierDamage = False) { } */
    ctor$int_TargetElementType_DamageCategory_bool_CorrelationDamageType_bool_bool(damageValue: int, attackElement: TargetElementType, category: DamageCategory, isCritical?: boolean /* = False */, correlationDamageType?: CorrelationDamageType /* = 0 */, isBreakBonusApplied?: boolean /* = False */, isBarrierDamage?: boolean /* = False */): this { return notPorted("AffectedUnitNotice_DamageInfo..ctor", 0x138B4C0); }
}

// ---- ReDriveBattleCore.AffectedUnitNotice.AddStateInfo  (TypeDefIndex 310, public class) ----
export class AffectedUnitNotice_AddStateInfo {
    /** 0x10 public string stateEffectType */
    stateEffectType: string = null!;
    /** 0x18 public string stateIconName */
    stateIconName: string = null!;
    /** 0x20 public int detailMstId */
    detailMstId: int = 0;
    /** 0x24 public EffectOriginType effectOrigin */
    effectOrigin: EffectOriginType = 0 as EffectOriginType;
    /** 0x28 public bool isNewUnitStateType */
    isNewUnitStateType: boolean = false;
    /** 0x29 public bool isDontShowFlip */
    isDontShowFlip: boolean = false;
    /** 0x2A public bool isRemovableBuff */
    isRemovableBuff: boolean = false;
    /** 0x2B public bool isRemovableDebuff */
    isRemovableDebuff: boolean = false;
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
