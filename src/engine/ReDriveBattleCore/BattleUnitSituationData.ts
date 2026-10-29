// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { StateIconData } from "./StateIconData";

// ---- ReDriveBattleCore.BattleUnitSituationData  (TypeDefIndex 361, public class) ----
export class BattleUnitSituationData {
    /** 0x10 private int <battleUnitDataId>k__BackingField */
    _battleUnitDataId: int = 0;
    /** 0x14 private int <maxHp>k__BackingField */
    _maxHp: int = 0;
    /** 0x18 private int <hp>k__BackingField */
    _hp: int = 0;
    /** 0x1C private int <ep>k__BackingField */
    _ep: int = 0;
    /** 0x20 private int <bp>k__BackingField */
    _bp: int = 0;
    /** 0x24 private int <breakPoint>k__BackingField */
    _breakPoint: int = 0;
    /** 0x28 private int <breakedDamageReceiveRate>k__BackingField */
    _breakedDamageReceiveRate: int = 0;
    /** 0x2C private int <currentHpGaugeCount>k__BackingField */
    _currentHpGaugeCount: int = 0;
    /** 0x30 private int <chargePoint>k__BackingField */
    _chargePoint: int = 0;
    /** 0x34 private int <maxChargePoint>k__BackingField */
    _maxChargePoint: int = 0;
    /** 0x38 private StateIconData[] <stateIcons>k__BackingField */
    _stateIcons: StateIconData[] = null!;
    /** 0x40 private string[] <visualEffectNames>k__BackingField */
    _visualEffectNames: string[] = null!;
    /** 0x48 private string <visualShaderName>k__BackingField */
    _visualShaderName: string = null!;
    /** 0x50 private bool <canNotAction>k__BackingField */
    _canNotAction: boolean = false;
    /** 0x51 private bool <canNotUseSkill>k__BackingField */
    _canNotUseSkill: boolean = false;
    /** 0x52 private bool <canNotUseSpecialAttack>k__BackingField */
    _canNotUseSpecialAttack: boolean = false;
    /** 0x53 private bool <isAbnormalState>k__BackingField */
    _isAbnormalState: boolean = false;
    /** 0x54 private int <barrierEndurance>k__BackingField */
    _barrierEndurance: int = 0;
    /** 0x58 private int <maxBarrierEndurance>k__BackingField */
    _maxBarrierEndurance: int = 0;
    /** 0x5C private int <countPoint>k__BackingField */
    _countPoint: int = 0;
    /** 0x60 private int <maxCountPoint>k__BackingField */
    _maxCountPoint: int = 0;
    /** 0x64 private int <zoneStack>k__BackingField */
    _zoneStack: int = 0;
    /** 0x68 private int <maxZoneStack>k__BackingField */
    _maxZoneStack: int = 0;
    /** 0x6C private int <zoneEffectId>k__BackingField */
    _zoneEffectId: int = 0;
    /** 0x70 private BattleUnitSituationData.UniqueLvStateIconData[] <uniqueLvStateIconDataArray>k__BackingField */
    _uniqueLvStateIconDataArray: BattleUnitSituationData_UniqueLvStateIconData[] = null!;
    get battleUnitDataId(): int { return this.get_battleUnitDataId(); }
    set battleUnitDataId(v: int) { this.set_battleUnitDataId(v); }
    get maxHp(): int { return this.get_maxHp(); }
    set maxHp(v: int) { this.set_maxHp(v); }
    get hp(): int { return this.get_hp(); }
    set hp(v: int) { this.set_hp(v); }
    get ep(): int { return this.get_ep(); }
    set ep(v: int) { this.set_ep(v); }
    get bp(): int { return this.get_bp(); }
    set bp(v: int) { this.set_bp(v); }
    get breakPoint(): int { return this.get_breakPoint(); }
    set breakPoint(v: int) { this.set_breakPoint(v); }
    get breakedDamageReceiveRate(): int { return this.get_breakedDamageReceiveRate(); }
    set breakedDamageReceiveRate(v: int) { this.set_breakedDamageReceiveRate(v); }
    get currentHpGaugeCount(): int { return this.get_currentHpGaugeCount(); }
    set currentHpGaugeCount(v: int) { this.set_currentHpGaugeCount(v); }
    get chargePoint(): int { return this.get_chargePoint(); }
    set chargePoint(v: int) { this.set_chargePoint(v); }
    get maxChargePoint(): int { return this.get_maxChargePoint(); }
    set maxChargePoint(v: int) { this.set_maxChargePoint(v); }
    get stateIcons(): StateIconData[] { return this.get_stateIcons(); }
    set stateIcons(v: StateIconData[]) { this.set_stateIcons(v); }
    get visualEffectNames(): string[] { return this.get_visualEffectNames(); }
    set visualEffectNames(v: string[]) { this.set_visualEffectNames(v); }
    get visualShaderName(): string { return this.get_visualShaderName(); }
    set visualShaderName(v: string) { this.set_visualShaderName(v); }
    get canNotAction(): boolean { return this.get_canNotAction(); }
    set canNotAction(v: boolean) { this.set_canNotAction(v); }
    get canNotUseSkill(): boolean { return this.get_canNotUseSkill(); }
    set canNotUseSkill(v: boolean) { this.set_canNotUseSkill(v); }
    get canNotUseSpecialAttack(): boolean { return this.get_canNotUseSpecialAttack(); }
    set canNotUseSpecialAttack(v: boolean) { this.set_canNotUseSpecialAttack(v); }
    get isAbnormalState(): boolean { return this.get_isAbnormalState(); }
    set isAbnormalState(v: boolean) { this.set_isAbnormalState(v); }
    get barrierEndurance(): int { return this.get_barrierEndurance(); }
    set barrierEndurance(v: int) { this.set_barrierEndurance(v); }
    get maxBarrierEndurance(): int { return this.get_maxBarrierEndurance(); }
    set maxBarrierEndurance(v: int) { this.set_maxBarrierEndurance(v); }
    get countPoint(): int { return this.get_countPoint(); }
    set countPoint(v: int) { this.set_countPoint(v); }
    get maxCountPoint(): int { return this.get_maxCountPoint(); }
    set maxCountPoint(v: int) { this.set_maxCountPoint(v); }
    get zoneStack(): int { return this.get_zoneStack(); }
    set zoneStack(v: int) { this.set_zoneStack(v); }
    get maxZoneStack(): int { return this.get_maxZoneStack(); }
    set maxZoneStack(v: int) { this.set_maxZoneStack(v); }
    get zoneEffectId(): int { return this.get_zoneEffectId(); }
    set zoneEffectId(v: int) { this.set_zoneEffectId(v); }
    get uniqueLvStateIconDataArray(): BattleUnitSituationData_UniqueLvStateIconData[] { return this.get_uniqueLvStateIconDataArray(); }
    set uniqueLvStateIconDataArray(v: BattleUnitSituationData_UniqueLvStateIconData[]) { this.set_uniqueLvStateIconDataArray(v); }
    /** @rva 0x7364F0  public int get_battleUnitDataId() { } */
    get_battleUnitDataId(): int { return this._battleUnitDataId; /* auto-property */ }
    /** @rva 0x739D00  public void set_battleUnitDataId(int value) { } */
    set_battleUnitDataId(value: int): void { this._battleUnitDataId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_maxHp() { } */
    get_maxHp(): int { return this._maxHp; /* auto-property */ }
    /** @rva 0x803540  public void set_maxHp(int value) { } */
    set_maxHp(value: int): void { this._maxHp = value; /* auto-property */ }
    /** @rva 0x763820  public int get_hp() { } */
    get_hp(): int { return this._hp; /* auto-property */ }
    /** @rva 0x8A2240  public void set_hp(int value) { } */
    set_hp(value: int): void { this._hp = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_ep() { } */
    get_ep(): int { return this._ep; /* auto-property */ }
    /** @rva 0x7F9820  public void set_ep(int value) { } */
    set_ep(value: int): void { this._ep = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_bp() { } */
    get_bp(): int { return this._bp; /* auto-property */ }
    /** @rva 0x8A2230  public void set_bp(int value) { } */
    set_bp(value: int): void { this._bp = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_breakPoint() { } */
    get_breakPoint(): int { return this._breakPoint; /* auto-property */ }
    /** @rva 0x75A840  public void set_breakPoint(int value) { } */
    set_breakPoint(value: int): void { this._breakPoint = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_breakedDamageReceiveRate() { } */
    get_breakedDamageReceiveRate(): int { return this._breakedDamageReceiveRate; /* auto-property */ }
    /** @rva 0x8A2250  public void set_breakedDamageReceiveRate(int value) { } */
    set_breakedDamageReceiveRate(value: int): void { this._breakedDamageReceiveRate = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_currentHpGaugeCount() { } */
    get_currentHpGaugeCount(): int { return this._currentHpGaugeCount; /* auto-property */ }
    /** @rva 0x8A2260  public void set_currentHpGaugeCount(int value) { } */
    set_currentHpGaugeCount(value: int): void { this._currentHpGaugeCount = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_chargePoint() { } */
    get_chargePoint(): int { return this._chargePoint; /* auto-property */ }
    /** @rva 0x8745A0  public void set_chargePoint(int value) { } */
    set_chargePoint(value: int): void { this._chargePoint = value; /* auto-property */ }
    /** @rva 0x75ED50  public int get_maxChargePoint() { } */
    get_maxChargePoint(): int { return this._maxChargePoint; /* auto-property */ }
    /** @rva 0x8A22A0  public void set_maxChargePoint(int value) { } */
    set_maxChargePoint(value: int): void { this._maxChargePoint = value; /* auto-property */ }
    /** @rva 0x736970  public StateIconData[] get_stateIcons() { } */
    get_stateIcons(): StateIconData[] { return this._stateIcons; /* auto-property */ }
    /** @rva 0x736A30  public void set_stateIcons(StateIconData[] value) { } */
    set_stateIcons(value: StateIconData[]): void { this._stateIcons = value; /* auto-property */ }
    /** @rva 0x7368E0  public string[] get_visualEffectNames() { } */
    get_visualEffectNames(): string[] { return this._visualEffectNames; /* auto-property */ }
    /** @rva 0x736F20  public void set_visualEffectNames(string[] value) { } */
    set_visualEffectNames(value: string[]): void { this._visualEffectNames = value; /* auto-property */ }
    /** @rva 0x7368F0  public string get_visualShaderName() { } */
    get_visualShaderName(): string { return this._visualShaderName; /* auto-property */ }
    /** @rva 0x736A00  public void set_visualShaderName(string value) { } */
    set_visualShaderName(value: string): void { this._visualShaderName = value; /* auto-property */ }
    /** @rva 0x8AC2E0  public bool get_canNotAction() { } */
    get_canNotAction(): boolean { return this._canNotAction; /* auto-property */ }
    /** @rva 0x8AC340  public void set_canNotAction(bool value) { } */
    set_canNotAction(value: boolean): void { this._canNotAction = value; /* auto-property */ }
    /** @rva 0x8AC2F0  public bool get_canNotUseSkill() { } */
    get_canNotUseSkill(): boolean { return this._canNotUseSkill; /* auto-property */ }
    /** @rva 0x8AC350  public void set_canNotUseSkill(bool value) { } */
    set_canNotUseSkill(value: boolean): void { this._canNotUseSkill = value; /* auto-property */ }
    /** @rva 0x8AC300  public bool get_canNotUseSpecialAttack() { } */
    get_canNotUseSpecialAttack(): boolean { return this._canNotUseSpecialAttack; /* auto-property */ }
    /** @rva 0x8AC360  public void set_canNotUseSpecialAttack(bool value) { } */
    set_canNotUseSpecialAttack(value: boolean): void { this._canNotUseSpecialAttack = value; /* auto-property */ }
    /** @rva 0x8DD950  public bool get_isAbnormalState() { } */
    get_isAbnormalState(): boolean { return this._isAbnormalState; /* auto-property */ }
    /** @rva 0x138B200  public void set_isAbnormalState(bool value) { } */
    set_isAbnormalState(value: boolean): void { this._isAbnormalState = value; /* auto-property */ }
    /** @rva 0x8A2210  public int get_barrierEndurance() { } */
    get_barrierEndurance(): int { return this._barrierEndurance; /* auto-property */ }
    /** @rva 0x8A22E0  public void set_barrierEndurance(int value) { } */
    set_barrierEndurance(value: int): void { this._barrierEndurance = value; /* auto-property */ }
    /** @rva 0x737C40  public int get_maxBarrierEndurance() { } */
    get_maxBarrierEndurance(): int { return this._maxBarrierEndurance; /* auto-property */ }
    /** @rva 0x737DF0  public void set_maxBarrierEndurance(int value) { } */
    set_maxBarrierEndurance(value: int): void { this._maxBarrierEndurance = value; /* auto-property */ }
    /** @rva 0x7544F0  public int get_countPoint() { } */
    get_countPoint(): int { return this._countPoint; /* auto-property */ }
    /** @rva 0x7547A0  public void set_countPoint(int value) { } */
    set_countPoint(value: int): void { this._countPoint = value; /* auto-property */ }
    /** @rva 0x8A2200  public int get_maxCountPoint() { } */
    get_maxCountPoint(): int { return this._maxCountPoint; /* auto-property */ }
    /** @rva 0x8A22D0  public void set_maxCountPoint(int value) { } */
    set_maxCountPoint(value: int): void { this._maxCountPoint = value; /* auto-property */ }
    /** @rva 0x8A2220  public int get_zoneStack() { } */
    get_zoneStack(): int { return this._zoneStack; /* auto-property */ }
    /** @rva 0x8A22F0  public void set_zoneStack(int value) { } */
    set_zoneStack(value: int): void { this._zoneStack = value; /* auto-property */ }
    /** @rva 0x901720  public int get_maxZoneStack() { } */
    get_maxZoneStack(): int { return this._maxZoneStack; /* auto-property */ }
    /** @rva 0x901760  public void set_maxZoneStack(int value) { } */
    set_maxZoneStack(value: int): void { this._maxZoneStack = value; /* auto-property */ }
    /** @rva 0x8570F0  public int get_zoneEffectId() { } */
    get_zoneEffectId(): int { return this._zoneEffectId; /* auto-property */ }
    /** @rva 0x9019B0  public void set_zoneEffectId(int value) { } */
    set_zoneEffectId(value: int): void { this._zoneEffectId = value; /* auto-property */ }
    /** @rva 0x737A20  public BattleUnitSituationData.UniqueLvStateIconData[] get_uniqueLvStateIconDataArray() { } */
    get_uniqueLvStateIconDataArray(): BattleUnitSituationData_UniqueLvStateIconData[] { return this._uniqueLvStateIconDataArray; /* auto-property */ }
    /** @rva 0x737A60  public void set_uniqueLvStateIconDataArray(BattleUnitSituationData.UniqueLvStateIconData[] value) { } */
    set_uniqueLvStateIconDataArray(value: BattleUnitSituationData_UniqueLvStateIconData[]): void { this._uniqueLvStateIconDataArray = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.BattleUnitSituationData.UniqueLvStateIconData  (TypeDefIndex 360, public class) ----
export class BattleUnitSituationData_UniqueLvStateIconData {
    /** 0x10 private int <Lv>k__BackingField */
    _Lv: int = 0;
    /** 0x14 private int <HitCounter>k__BackingField */
    _HitCounter: int = 0;
    /** 0x18 private int <RequiredCount>k__BackingField */
    _RequiredCount: int = 0;
    /** 0x1C private int <UniqueStatePatternMstId>k__BackingField */
    _UniqueStatePatternMstId: int = 0;
    /** 0x20 private TargetElementType <TargetElement>k__BackingField */
    _TargetElement: TargetElementType = 0 as TargetElementType;
    get Lv(): int { return this.get_Lv(); }
    set Lv(v: int) { this.set_Lv(v); }
    get HitCounter(): int { return this.get_HitCounter(); }
    set HitCounter(v: int) { this.set_HitCounter(v); }
    get RequiredCount(): int { return this.get_RequiredCount(); }
    set RequiredCount(v: int) { this.set_RequiredCount(v); }
    get UniqueStatePatternMstId(): int { return this.get_UniqueStatePatternMstId(); }
    set UniqueStatePatternMstId(v: int) { this.set_UniqueStatePatternMstId(v); }
    get TargetElement(): TargetElementType { return this.get_TargetElement(); }
    set TargetElement(v: TargetElementType) { this.set_TargetElement(v); }
    /** @rva 0x7364F0  public int get_Lv() { } */
    get_Lv(): int { return this._Lv; /* auto-property */ }
    /** @rva 0x739D00  public void set_Lv(int value) { } */
    set_Lv(value: int): void { this._Lv = value; /* auto-property */ }
    /** @rva 0x803350  public int get_HitCounter() { } */
    get_HitCounter(): int { return this._HitCounter; /* auto-property */ }
    /** @rva 0x803540  public void set_HitCounter(int value) { } */
    set_HitCounter(value: int): void { this._HitCounter = value; /* auto-property */ }
    /** @rva 0x763820  public int get_RequiredCount() { } */
    get_RequiredCount(): int { return this._RequiredCount; /* auto-property */ }
    /** @rva 0x8A2240  public void set_RequiredCount(int value) { } */
    set_RequiredCount(value: int): void { this._RequiredCount = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_UniqueStatePatternMstId() { } */
    get_UniqueStatePatternMstId(): int { return this._UniqueStatePatternMstId; /* auto-property */ }
    /** @rva 0x7F9820  public void set_UniqueStatePatternMstId(int value) { } */
    set_UniqueStatePatternMstId(value: int): void { this._UniqueStatePatternMstId = value; /* auto-property */ }
    /** @rva 0x75ED70  public TargetElementType get_TargetElement() { } */
    get_TargetElement(): TargetElementType { return this._TargetElement; /* auto-property */ }
    /** @rva 0x8A2230  public void set_TargetElement(TargetElementType value) { } */
    set_TargetElement(value: TargetElementType): void { this._TargetElement = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
