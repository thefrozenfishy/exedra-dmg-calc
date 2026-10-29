// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted, union } from "../runtime";
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
    /** 0x3C private int <ConsumeHpValue>k__BackingField */
    _ConsumeHpValue: int = 0;
    /** 0x39 private bool <IsConsumeHp>k__BackingField */
    _IsConsumeHp: boolean = false;
    /** 0x40 private float <TurnGaugeVariation>k__BackingField */
    _TurnGaugeVariation: float = 0;
    /** 0x44 private bool <IsDead>k__BackingField */
    _IsDead: boolean = false;
    /** 0x45 private bool <IsRevived>k__BackingField */
    _IsRevived: boolean = false;
    /** 0x46 private bool <IsSummoned>k__BackingField */
    _IsSummoned: boolean = false;
    /** 0x47 private bool <IsResetBreakPoint>k__BackingField */
    _IsResetBreakPoint: boolean = false;
    /** 0x48 private bool <CanNotAction>k__BackingField */
    _CanNotAction: boolean = false;
    /** 0x49 private bool <FinishCanNotAction>k__BackingField */
    _FinishCanNotAction: boolean = false;
    /** 0x4A private bool <FinishLockTurnOrder>k__BackingField */
    _FinishLockTurnOrder: boolean = false;
    /** 0x4B private bool <IsBarrierAdded>k__BackingField */
    _IsBarrierAdded: boolean = false;
    /** 0x4C private int <BarrierValue>k__BackingField */
    _BarrierValue: int = 0;
    /** 0x50 private bool <IsBarrierAttacked>k__BackingField */
    _IsBarrierAttacked: boolean = false;
    /** 0x51 private bool <IsBarrierDestroyed>k__BackingField */
    _IsBarrierDestroyed: boolean = false;
    /** 0x52 private bool <IsReceivedReflection>k__BackingField */
    _IsReceivedReflection: boolean = false;
    /** 0x53 private bool <IsCounterAttack>k__BackingField */
    _IsCounterAttack: boolean = false;
    /** 0x54 private int <BreakedDamageReceiveRateUpValue>k__BackingField */
    _BreakedDamageReceiveRateUpValue: int = 0;
    /** 0x58 private bool <IsBreakedDamageReceiveRateBecomeMax>k__BackingField */
    _IsBreakedDamageReceiveRateBecomeMax: boolean = false;
    /** 0x59 private bool <IsWeakElementAttacked>k__BackingField */
    _IsWeakElementAttacked: boolean = false;
    /** 0x60 private List<string> <DamageVisualEffectList>k__BackingField */
    _DamageVisualEffectList: List<string> = null!;
    /** 0x68 private List<string> <NonDamageVisualEffectList>k__BackingField */
    _NonDamageVisualEffectList: List<string> = null!;
    /** 0x70 private List<AffectedUnitNotice.AddStateInfo> <AddStateInfoList>k__BackingField */
    _AddStateInfoList: List<AffectedUnitNotice_AddStateInfo> = null!;
    /** 0x78 private List<string> <ReceivedSlipDamageEffectTypeList>k__BackingField */
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
    set ConsumeHpValue(v: int) { this.set_ConsumeHpValue(v); }
    get ConsumeHpValue(): int { return this.get_ConsumeHpValue(); }
    set IsConsumeHp(v: boolean) { this.set_IsConsumeHp(v); }
    get IsConsumeHp(): boolean { return this.get_IsConsumeHp(); }
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
    /** @rva 0x901820  public void set_ConsumeHpValue(int value) { } */
    set_ConsumeHpValue(value: int): void { this._ConsumeHpValue = value; /* auto-property */ }
    /** @rva 0x8F3EF0  public int get_ConsumeHpValue() { } */
    get_ConsumeHpValue(): int { return this._ConsumeHpValue; /* auto-property */ }
    /** @rva 0x901AF0  public void set_IsConsumeHp(bool value) { } */
    set_IsConsumeHp(value: boolean): void { this._IsConsumeHp = value; /* auto-property */ }
    /** @rva 0x901A30  public bool get_IsConsumeHp() { } */
    get_IsConsumeHp(): boolean { return this._IsConsumeHp; /* auto-property */ }
    /** @rva 0x7545B0  public float get_TurnGaugeVariation() { } */
    get_TurnGaugeVariation(): float { return this._TurnGaugeVariation; /* auto-property */ }
    /** @rva 0x754870  public void set_TurnGaugeVariation(float value) { } */
    set_TurnGaugeVariation(value: float): void { this._TurnGaugeVariation = value; /* auto-property */ }
    /** @rva 0x8F3ED0  public bool get_IsDead() { } */
    get_IsDead(): boolean { return this._IsDead; /* auto-property */ }
    /** @rva 0x902260  public void set_IsDead(bool value) { } */
    set_IsDead(value: boolean): void { this._IsDead = value; /* auto-property */ }
    /** @rva 0x8F3F00  public bool get_IsRevived() { } */
    get_IsRevived(): boolean { return this._IsRevived; /* auto-property */ }
    /** @rva 0x902250  public void set_IsRevived(bool value) { } */
    set_IsRevived(value: boolean): void { this._IsRevived = value; /* auto-property */ }
    /** @rva 0x8F3EE0  public bool get_IsSummoned() { } */
    get_IsSummoned(): boolean { return this._IsSummoned; /* auto-property */ }
    /** @rva 0xF2B330  public void set_IsSummoned(bool value) { } */
    set_IsSummoned(value: boolean): void { this._IsSummoned = value; /* auto-property */ }
    /** @rva 0x8F3EC0  public bool get_IsResetBreakPoint() { } */
    get_IsResetBreakPoint(): boolean { return this._IsResetBreakPoint; /* auto-property */ }
    /** @rva 0x138B210  public void set_IsResetBreakPoint(bool value) { } */
    set_IsResetBreakPoint(value: boolean): void { this._IsResetBreakPoint = value; /* auto-property */ }
    /** @rva 0x82ACE0  public bool get_CanNotAction() { } */
    get_CanNotAction(): boolean { return this._CanNotAction; /* auto-property */ }
    /** @rva 0x901B40  public void set_CanNotAction(bool value) { } */
    set_CanNotAction(value: boolean): void { this._CanNotAction = value; /* auto-property */ }
    /** @rva 0x901A70  public bool get_FinishCanNotAction() { } */
    get_FinishCanNotAction(): boolean { return this._FinishCanNotAction; /* auto-property */ }
    /** @rva 0x901B50  public void set_FinishCanNotAction(bool value) { } */
    set_FinishCanNotAction(value: boolean): void { this._FinishCanNotAction = value; /* auto-property */ }
    /** @rva 0x8305B0  public bool get_FinishLockTurnOrder() { } */
    get_FinishLockTurnOrder(): boolean { return this._FinishLockTurnOrder; /* auto-property */ }
    /** @rva 0x8306F0  public void set_FinishLockTurnOrder(bool value) { } */
    set_FinishLockTurnOrder(value: boolean): void { this._FinishLockTurnOrder = value; /* auto-property */ }
    /** @rva 0x1176B00  public bool get_IsBarrierAdded() { } */
    get_IsBarrierAdded(): boolean { return this._IsBarrierAdded; /* auto-property */ }
    /** @rva 0x138B1F0  public void set_IsBarrierAdded(bool value) { } */
    set_IsBarrierAdded(value: boolean): void { this._IsBarrierAdded = value; /* auto-property */ }
    /** @rva 0x87BCD0  public int get_BarrierValue() { } */
    get_BarrierValue(): int { return this._BarrierValue; /* auto-property */ }
    /** @rva 0x901740  public void set_BarrierValue(int value) { } */
    set_BarrierValue(value: int): void { this._BarrierValue = value; /* auto-property */ }
    /** @rva 0x8AC2E0  public bool get_IsBarrierAttacked() { } */
    get_IsBarrierAttacked(): boolean { return this._IsBarrierAttacked; /* auto-property */ }
    /** @rva 0x8AC340  public void set_IsBarrierAttacked(bool value) { } */
    set_IsBarrierAttacked(value: boolean): void { this._IsBarrierAttacked = value; /* auto-property */ }
    /** @rva 0x8AC2F0  public bool get_IsBarrierDestroyed() { } */
    get_IsBarrierDestroyed(): boolean { return this._IsBarrierDestroyed; /* auto-property */ }
    /** @rva 0x8AC350  public void set_IsBarrierDestroyed(bool value) { } */
    set_IsBarrierDestroyed(value: boolean): void { this._IsBarrierDestroyed = value; /* auto-property */ }
    /** @rva 0x8AC300  public bool get_IsReceivedReflection() { } */
    get_IsReceivedReflection(): boolean { return this._IsReceivedReflection; /* auto-property */ }
    /** @rva 0x8AC360  public void set_IsReceivedReflection(bool value) { } */
    set_IsReceivedReflection(value: boolean): void { this._IsReceivedReflection = value; /* auto-property */ }
    /** @rva 0x8DD950  public bool get_IsCounterAttack() { } */
    get_IsCounterAttack(): boolean { return this._IsCounterAttack; /* auto-property */ }
    /** @rva 0x138B200  public void set_IsCounterAttack(bool value) { } */
    set_IsCounterAttack(value: boolean): void { this._IsCounterAttack = value; /* auto-property */ }
    /** @rva 0x8A2210  public int get_BreakedDamageReceiveRateUpValue() { } */
    get_BreakedDamageReceiveRateUpValue(): int { return this._BreakedDamageReceiveRateUpValue; /* auto-property */ }
    /** @rva 0x8A22E0  public void set_BreakedDamageReceiveRateUpValue(int value) { } */
    set_BreakedDamageReceiveRateUpValue(value: int): void { this._BreakedDamageReceiveRateUpValue = value; /* auto-property */ }
    /** @rva 0x7FAAD0  public bool get_IsBreakedDamageReceiveRateBecomeMax() { } */
    get_IsBreakedDamageReceiveRateBecomeMax(): boolean { return this._IsBreakedDamageReceiveRateBecomeMax; /* auto-property */ }
    /** @rva 0x7FACD0  public void set_IsBreakedDamageReceiveRateBecomeMax(bool value) { } */
    set_IsBreakedDamageReceiveRateBecomeMax(value: boolean): void { this._IsBreakedDamageReceiveRateBecomeMax = value; /* auto-property */ }
    /** @rva 0x7FAAF0  public bool get_IsWeakElementAttacked() { } */
    get_IsWeakElementAttacked(): boolean { return this._IsWeakElementAttacked; /* auto-property */ }
    /** @rva 0x902200  public void set_IsWeakElementAttacked(bool value) { } */
    set_IsWeakElementAttacked(value: boolean): void { this._IsWeakElementAttacked = value; /* auto-property */ }
    /** @rva 0x737A10  public List<string> get_DamageVisualEffectList() { } */
    get_DamageVisualEffectList(): List<string> { return this._DamageVisualEffectList; /* auto-property */ }
    /** @rva 0x737A50  public void set_DamageVisualEffectList(List<string> value) { } */
    set_DamageVisualEffectList(value: List<string>): void { this._DamageVisualEffectList = value; /* auto-property */ }
    /** @rva 0x737A30  public List<string> get_NonDamageVisualEffectList() { } */
    get_NonDamageVisualEffectList(): List<string> { return this._NonDamageVisualEffectList; /* auto-property */ }
    /** @rva 0x737A70  public void set_NonDamageVisualEffectList(List<string> value) { } */
    set_NonDamageVisualEffectList(value: List<string>): void { this._NonDamageVisualEffectList = value; /* auto-property */ }
    /** @rva 0x737A20  public List<AffectedUnitNotice.AddStateInfo> get_AddStateInfoList() { } */
    get_AddStateInfoList(): List<AffectedUnitNotice_AddStateInfo> { return this._AddStateInfoList; /* auto-property */ }
    /** @rva 0x737A60  public void set_AddStateInfoList(List<AffectedUnitNotice.AddStateInfo> value) { } */
    set_AddStateInfoList(value: List<AffectedUnitNotice_AddStateInfo>): void { this._AddStateInfoList = value; /* auto-property */ }
    /** @rva 0x737C60  public List<string> get_ReceivedSlipDamageEffectTypeList() { } */
    get_ReceivedSlipDamageEffectTypeList(): List<string> { return this._ReceivedSlipDamageEffectTypeList; /* auto-property */ }
    /** @rva 0x737E10  public void set_ReceivedSlipDamageEffectTypeList(List<string> value) { } */
    set_ReceivedSlipDamageEffectTypeList(value: List<string>): void { this._ReceivedSlipDamageEffectTypeList = value; /* auto-property */ }
    /** @rva 0x138ACE0  public bool get_IsReceivedDamage() { } */
    get_IsReceivedDamage(): boolean {
        const damage = this.Damages.reduce((a, d) => a + d._DamageValue, 0); // <>c.b__128_0
        if (this._BreakDamage != null) return 0 < damage + this._BreakDamage._DamageValue;
        return 0 < damage;
    }
    /** @rva 0x138AB80  public void .ctor() { } */
    ctor(): this {
        this.Damages = [];
        this.BarrierDamages = [];
        this._DamageVisualEffectList = [];
        this._NonDamageVisualEffectList = [];
        this._AddStateInfoList = [];
        this._ReceivedSlipDamageEffectTypeList = [];
        return this;
    }
    /** @rva 0x138AA10  public void .ctor(int affectedUnitId) { } */
    ctor$int(affectedUnitId: int): this {
        this.Damages = [];
        this.BarrierDamages = [];
        this._DamageVisualEffectList = [];
        this._NonDamageVisualEffectList = [];
        this._AddStateInfoList = [];
        this._ReceivedSlipDamageEffectTypeList = [];
        this._AffectedUnitId = affectedUnitId;
        return this;
    }
    /** @rva 0x1389DE0  public static AffectedUnitNotice CreateByDamage(int affectedUnitId, int damageValue, DamageCategory damageCategory, bool isCritical, CorrelationDamageType correlationDamageType, List<string> visualEffectList, TargetElementType attackElement = 0, bool isBreakBonusApplied = False) { } */
    static CreateByDamage(affectedUnitId: int, damageValue: int, damageCategory: DamageCategory, isCritical: boolean, correlationDamageType: CorrelationDamageType, visualEffectList: List<string>, attackElement: TargetElementType = 0 as TargetElementType, isBreakBonusApplied: boolean = false): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        const damageInfo = new AffectedUnitNotice_DamageInfo();
        damageInfo._AttackElement = attackElement;
        damageInfo._CorrelationDamageType = correlationDamageType;
        damageInfo._IsBreakBonusApplied = isBreakBonusApplied;
        damageInfo._DamageValue = damageValue;
        damageInfo._Category = damageCategory;
        damageInfo._IsCritical = isCritical;
        damageInfo._IsBarrierDamage = false;
        notice.Damages = [damageInfo];
        notice._IsReceivedAttack = true;
        notice._IsVisibleOnAttack = true;
        notice._DamageVisualEffectList = visualEffectList ?? [];
        return notice;
    }
    /** @rva 0x1389980  public static AffectedUnitNotice CreateByBarrierDamage(int affectedUnitId, int damageValue, DamageCategory damageCategory, bool isCritical, CorrelationDamageType correlationDamageType, List<string> visualEffectList, TargetElementType attackElement = 0, bool isBreakBonusApplied = False) { } */
    static CreateByBarrierDamage(affectedUnitId: int, damageValue: int, damageCategory: DamageCategory, isCritical: boolean, correlationDamageType: CorrelationDamageType, visualEffectList: List<string>, attackElement: TargetElementType = 0 as TargetElementType, isBreakBonusApplied: boolean = false): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        const damageInfo = new AffectedUnitNotice_DamageInfo();
        damageInfo._AttackElement = attackElement;
        damageInfo._CorrelationDamageType = correlationDamageType;
        damageInfo._IsBreakBonusApplied = isBreakBonusApplied;
        damageInfo._DamageValue = damageValue;
        damageInfo._Category = damageCategory;
        damageInfo._IsCritical = isCritical;
        damageInfo._IsBarrierDamage = true;
        notice.BarrierDamages = [damageInfo];
        notice._IsReceivedAttack = true;
        notice._IsVisibleOnAttack = true;
        notice._DamageVisualEffectList = visualEffectList ?? [];
        return notice;
    }
    /** @rva 0x138A190  public static AffectedUnitNotice CreateByRecovery(int affectedUnitId, int recoveryValue, bool isRevival = False) { } */
    static CreateByRecovery(affectedUnitId: int, recoveryValue: int, isRevival?: boolean /* = False */): AffectedUnitNotice {
        isRevival = isRevival ?? false;
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._RecoveryValue = recoveryValue;
        notice._IsReceivedRecovery = true;
        notice._IsRevived = isRevival;
        notice._NonDamageVisualEffectList.push(isRevival ? "revival_temp" : "eff_cmn_act_recovery_appear_001");
        return notice;
    }
    /** @rva 0x1389D70  public static AffectedUnitNotice CreateByConsumeHp(int affectedUnitId, int consumeHpValue) { } */
    static CreateByConsumeHp(affectedUnitId: int, consumeHpValue: int): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._IsConsumeHp = true;
        notice._ConsumeHpValue = consumeHpValue;
        return notice;
    }
    /** @rva 0x138A4D0  public static AffectedUnitNotice CreateByTurnGaugeVariation(int affectedUnitId, float turnGaugeVariation) { } */
    static CreateByTurnGaugeVariation(affectedUnitId: int, turnGaugeVariation: float): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._TurnGaugeVariation = turnGaugeVariation;
        return notice;
    }
    /** @rva 0x138A3B0  public static AffectedUnitNotice CreateByRemoveState(int affectedUnitId, AbilityEffectBase.TargetSideType targetSide) { } */
    static CreateByRemoveState(affectedUnitId: int, targetSide: AbilityEffectBase_TargetSideType): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._NonDamageVisualEffectList.push(targetSide === 0 ? "eff_cmn_act_recovery_appear_001" : "eff_cmn_act_debuff_appear_001");
        return notice;
    }
    /** @rva 0x138A090  public static AffectedUnitNotice CreateByOneState(int affectedUnitId, string visualEffect) { } */
    static CreateByOneState(affectedUnitId: int, visualEffect: string): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._NonDamageVisualEffectList.push(visualEffect);
        return notice;
    }
    /** @rva 0x1389C50  public static AffectedUnitNotice CreateByBarrier(int affectedUnitId, bool isCharacterFigure, int barrierValue) { } */
    static CreateByBarrier(affectedUnitId: int, isCharacterFigure: boolean, barrierValue: int): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._IsBarrierAdded = true;
        notice._BarrierValue = barrierValue;
        notice._NonDamageVisualEffectList.push(isCharacterFigure ? "eff_cmn_act_barrier_appear_001" : "eff_cmn_act_barrier_appear_002");
        return notice;
    }
    /** @rva 0x1389B30  public static AffectedUnitNotice CreateByBarrierHit(int affectedUnitId, bool isCharacterFigure, bool isBarrierDestroyed) { } */
    static CreateByBarrierHit(affectedUnitId: int, isCharacterFigure: boolean, isBarrierDestroyed: boolean): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._IsBarrierAttacked = true;
        notice._IsBarrierDestroyed = isBarrierDestroyed;
        notice._DamageVisualEffectList.push(isCharacterFigure ? "eff_cmn_act_barrier_active_001" : "eff_cmn_act_barrier_active_002");
        return notice;
    }
    /** @rva 0x138A2B0  public static AffectedUnitNotice CreateByReflection(int affectedUnitId) { } */
    static CreateByReflection(affectedUnitId: int): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._DamageVisualEffectList.push("eff_cmn_act_reflection_active_001");
        return notice;
    }
    /** @rva 0x1389F90  public static AffectedUnitNotice CreateByDisabledDamageHit(int affectedUnitId) { } */
    static CreateByDisabledDamageHit(affectedUnitId: int): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._DamageVisualEffectList.push("eff_639002_smoke_001");
        return notice;
    }
    /** @rva 0x1389880  public static AffectedUnitNotice CreateByAddStateInfo(int affectedUnitId, AffectedUnitNotice.AddStateInfo addStateInfo) { } */
    static CreateByAddStateInfo(affectedUnitId: int, addStateInfo: AffectedUnitNotice_AddStateInfo): AffectedUnitNotice {
        const notice = new AffectedUnitNotice().ctor$int(affectedUnitId);
        notice._AddStateInfoList.push(addStateInfo);
        return notice;
    }
    /** @rva 0x138AE30  public static AffectedUnitNotice op_Addition(AffectedUnitNotice notice1, AffectedUnitNotice notice2) { } */
    static op_Addition(notice1: AffectedUnitNotice, notice2: AffectedUnitNotice): AffectedUnitNotice {
        const n = new AffectedUnitNotice().ctor$int(notice1._AffectedUnitId);
        n.Damages = union(notice1.Damages, notice2.Damages);
        n._BreakDamage = notice2._BreakDamage ?? notice1._BreakDamage;
        n.BarrierDamages = union(notice1.BarrierDamages, notice2.BarrierDamages);
        n._IsReceivedAttack = notice1._IsReceivedAttack || notice2._IsReceivedAttack;
        n._IsVisibleOnAttack = notice1._IsVisibleOnAttack || notice2._IsVisibleOnAttack;
        n._RecoveryValue = notice1._RecoveryValue + notice2._RecoveryValue;
        n._BarrierValue = notice1._BarrierValue + notice2._BarrierValue;
        n._TurnGaugeVariation = f32(notice1._TurnGaugeVariation + notice2._TurnGaugeVariation);
        n._IsReceivedRecovery = notice1._IsReceivedRecovery || notice2._IsReceivedRecovery;
        n._IsConsumeHp = notice1._IsConsumeHp || notice2._IsConsumeHp; // 3.21.0
        n._ConsumeHpValue = notice1._ConsumeHpValue + notice2._ConsumeHpValue;
        n._IsDead = notice1._IsDead || notice2._IsDead;
        n._IsRevived = notice1._IsRevived || notice2._IsRevived;
        n._IsSummoned = notice1._IsSummoned || notice2._IsSummoned;
        n._IsResetBreakPoint = notice1._IsResetBreakPoint || notice2._IsResetBreakPoint;
        n._IsBarrierAdded = notice1._IsBarrierAdded || notice2._IsBarrierAdded;
        n._IsBarrierAttacked = notice1._IsBarrierAttacked || notice2._IsBarrierAttacked;
        n._IsBarrierDestroyed = notice1._IsBarrierDestroyed || notice2._IsBarrierDestroyed;
        n._IsReceivedReflection = notice1._IsReceivedReflection || notice2._IsReceivedReflection;
        n._IsCounterAttack = notice1._IsCounterAttack || notice2._IsCounterAttack;
        n._BreakedDamageReceiveRateUpValue = notice1._BreakedDamageReceiveRateUpValue + notice2._BreakedDamageReceiveRateUpValue;
        n._IsBreakedDamageReceiveRateBecomeMax = notice1._IsBreakedDamageReceiveRateBecomeMax || notice2._IsBreakedDamageReceiveRateBecomeMax;
        n._IsWeakElementAttacked = notice1._IsWeakElementAttacked || notice2._IsWeakElementAttacked;
        n._CanNotAction = notice1._CanNotAction || notice2._CanNotAction;
        n._FinishCanNotAction = notice1._FinishCanNotAction || notice2._FinishCanNotAction;
        n._FinishLockTurnOrder = notice1._FinishLockTurnOrder || notice2._FinishLockTurnOrder;
        n._DamageVisualEffectList = union(notice1._DamageVisualEffectList, notice2._DamageVisualEffectList);
        n._NonDamageVisualEffectList = union(notice1._NonDamageVisualEffectList, notice2._NonDamageVisualEffectList);
        n._AddStateInfoList = union(notice1._AddStateInfoList, notice2._AddStateInfoList);
        n._ReceivedSlipDamageEffectTypeList = union(notice1._ReceivedSlipDamageEffectTypeList, notice2._ReceivedSlipDamageEffectTypeList);
        return n;
    }
    /** @rva 0x138A5E0  public int GetTotalDamageValue(bool includeBreakDamage = True) { } */
    GetTotalDamageValue(includeBreakDamage?: boolean /* = True */): int {
        includeBreakDamage = includeBreakDamage ?? true;
        const damage = this.Damages.reduce((a, d) => a + d._DamageValue, 0) | 0; // Enumerable.Sum (<>c.b__128_0)
        if (includeBreakDamage && this._BreakDamage != null) return (damage + this._BreakDamage._DamageValue) | 0;
        return damage;
    }
    /** @rva 0x138A7E0  public void SetDamageSequence(int seq) { } */
    SetDamageSequence(seq: int): void {
        // <>c__DisplayClass129_0: 0x10 seq
        this.Damages.forEach(x => { x._Sequence = seq; }); // b__0
        this.BarrierDamages.forEach(x => { x._Sequence = seq; }); // b__1
    }
    /** @rva 0x138A540  public List<AffectedUnitNotice.DamageInfo> GetDisplayDamageInfoList() { } */
    GetDisplayDamageInfoList(): List<AffectedUnitNotice_DamageInfo> {
        const list: List<AffectedUnitNotice_DamageInfo> = [];
        list.push(...this.BarrierDamages);
        list.push(...this.Damages);
        return list;
    }
    /** @rva 0x138A730  public bool HasAnyDamageOfCategory(DamageCategory category) { } */
    HasAnyDamageOfCategory(category: DamageCategory): boolean {
        for (const d of this.Damages) if (d._Category === category) return true;
        if (this._BreakDamage != null && this._BreakDamage._Category === category) return true;
        for (const d of this.BarrierDamages) if (d._Category === category) return true;
        return false;
    }
    /** @rva 0x138A9A0  public bool ShouldSerializeDamages() { } */
    ShouldSerializeDamages(): boolean { return this.Damages.length !== 0; }
    /** @rva 0xBEC7F0  public bool ShouldSerializeBarrierDamages() { } */
    ShouldSerializeBarrierDamages(): boolean { return this.BarrierDamages.length !== 0; }
    /** @rva 0x138A950  public bool ShouldSerializeDamageVisualEffectList() { } */
    ShouldSerializeDamageVisualEffectList(): boolean { return 0 < this._DamageVisualEffectList.length; }
    /** @rva 0x138A9C0  public bool ShouldSerializeNonDamageVisualEffectList() { } */
    ShouldSerializeNonDamageVisualEffectList(): boolean { return 0 < this._NonDamageVisualEffectList.length; }
    /** @rva 0x138A900  public bool ShouldSerializeAddStateInfoList() { } */
    ShouldSerializeAddStateInfoList(): boolean { return 0 < this._AddStateInfoList.length; }
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
    /** @rva 0x139D0D0  public void set_IsReflectionDamage(bool value) { } */
    set_IsReflectionDamage(value: boolean): void {
        this._Category = (value ? 5 : 0) as DamageCategory;
    }
    /** @rva 0x7637A0  public DamageCategory get_Category() { } */
    get_Category(): DamageCategory { return this._Category; /* auto-property */ }
    /** @rva 0x8A2250  public void set_Category(DamageCategory value) { } */
    set_Category(value: DamageCategory): void { this._Category = value; /* auto-property */ }
    /** @rva 0x139D060  public void .ctor(int damageValue, TargetElementType attackElement, DamageCategory category, bool isCritical = False, CorrelationDamageType correlationDamageType = 0, bool isBreakBonusApplied = False, bool isBarrierDamage = False) { } */
    ctor$int_TargetElementType_DamageCategory_bool_CorrelationDamageType_bool_bool(damageValue: int, attackElement: TargetElementType, category: DamageCategory, isCritical?: boolean /* = False */, correlationDamageType?: CorrelationDamageType /* = 0 */, isBreakBonusApplied?: boolean /* = False */, isBarrierDamage?: boolean /* = False */): this {
        this._IsCritical = (isCritical ?? false);
        this._CorrelationDamageType = (correlationDamageType ?? 0);
        this._IsBreakBonusApplied = (isBreakBonusApplied ?? false);
        this._DamageValue = damageValue;
        this._Category = category;
        this._IsBarrierDamage = (isBarrierDamage ?? false);
        this._AttackElement = attackElement;
        return this;
    }
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
