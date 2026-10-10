// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilitySourceType } from "../../Network/Definition/Battle/AbilitySourceType";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.Command.UnitStateData  (TypeDefIndex 1028, public class) ----
export class UnitStateData {
    /** 0x10 private AbilitySourceType <AbilitySource>k__BackingField */
    _AbilitySource: AbilitySourceType = 0 as AbilitySourceType;
    /** 0x14 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x18 private EffectOriginType <EffectOrigin>k__BackingField */
    _EffectOrigin: EffectOriginType = 0 as EffectOriginType;
    /** 0x20 private string <EffectType>k__BackingField */
    _EffectType: string = null!;
    /** 0x28 private int <RemainingTurn>k__BackingField */
    _RemainingTurn: int = 0;
    /** 0x2C private bool <IsPermanent>k__BackingField */
    _IsPermanent: boolean = false;
    /** 0x30 private int <RemainCount>k__BackingField */
    _RemainCount: int = 0;
    /** 0x38 private string <IconName>k__BackingField */
    _IconName: string = null!;
    /** 0x40 private bool <IsActive>k__BackingField */
    _IsActive: boolean = false;
    /** 0x41 private bool <ShowStateDetailAttachedByPassiveSkill>k__BackingField */
    _ShowStateDetailAttachedByPassiveSkill: boolean = false;
    /** 0x44 private int <DetailDisplayPriority>k__BackingField */
    _DetailDisplayPriority: int = 0;
    /** 0x48 private int <StateLevel>k__BackingField */
    _StateLevel: int = 0;
    /** 0x4C private int <HitCounter>k__BackingField */
    _HitCounter: int = 0;
    /** 0x50 private int <MaxHitCounter>k__BackingField */
    _MaxHitCounter: int = 0;
    get AbilitySource(): AbilitySourceType { return this.get_AbilitySource(); }
    set AbilitySource(v: AbilitySourceType) { this.set_AbilitySource(v); }
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get EffectOrigin(): EffectOriginType { return this.get_EffectOrigin(); }
    set EffectOrigin(v: EffectOriginType) { this.set_EffectOrigin(v); }
    get EffectType(): string { return this.get_EffectType(); }
    set EffectType(v: string) { this.set_EffectType(v); }
    get RemainingTurn(): int { return this.get_RemainingTurn(); }
    set RemainingTurn(v: int) { this.set_RemainingTurn(v); }
    get IsPermanent(): boolean { return this.get_IsPermanent(); }
    set IsPermanent(v: boolean) { this.set_IsPermanent(v); }
    get RemainCount(): int { return this.get_RemainCount(); }
    set RemainCount(v: int) { this.set_RemainCount(v); }
    get IconName(): string { return this.get_IconName(); }
    set IconName(v: string) { this.set_IconName(v); }
    get IsActive(): boolean { return this.get_IsActive(); }
    set IsActive(v: boolean) { this.set_IsActive(v); }
    get ShowStateDetailAttachedByPassiveSkill(): boolean { return this.get_ShowStateDetailAttachedByPassiveSkill(); }
    set ShowStateDetailAttachedByPassiveSkill(v: boolean) { this.set_ShowStateDetailAttachedByPassiveSkill(v); }
    get DetailDisplayPriority(): int { return this.get_DetailDisplayPriority(); }
    set DetailDisplayPriority(v: int) { this.set_DetailDisplayPriority(v); }
    get StateLevel(): int { return this.get_StateLevel(); }
    set StateLevel(v: int) { this.set_StateLevel(v); }
    get HitCounter(): int { return this.get_HitCounter(); }
    set HitCounter(v: int) { this.set_HitCounter(v); }
    get MaxHitCounter(): int { return this.get_MaxHitCounter(); }
    set MaxHitCounter(v: int) { this.set_MaxHitCounter(v); }
    /** @rva 0x7364F0  public AbilitySourceType get_AbilitySource() { } */
    get_AbilitySource(): AbilitySourceType { return this._AbilitySource; /* auto-property */ }
    /** @rva 0x739D00  public void set_AbilitySource(AbilitySourceType value) { } */
    set_AbilitySource(value: AbilitySourceType): void { this._AbilitySource = value; /* auto-property */ }
    /** @rva 0x803350  public int get_MstId() { } */
    get_MstId(): int { return this._MstId; /* auto-property */ }
    /** @rva 0x803540  public void set_MstId(int value) { } */
    set_MstId(value: int): void { this._MstId = value; /* auto-property */ }
    /** @rva 0x763820  public EffectOriginType get_EffectOrigin() { } */
    get_EffectOrigin(): EffectOriginType { return this._EffectOrigin; /* auto-property */ }
    /** @rva 0x8A2240  public void set_EffectOrigin(EffectOriginType value) { } */
    set_EffectOrigin(value: EffectOriginType): void { this._EffectOrigin = value; /* auto-property */ }
    /** @rva 0x7369E0  public string get_EffectType() { } */
    get_EffectType(): string { return this._EffectType; /* auto-property */ }
    /** @rva 0x736A50  public void set_EffectType(string value) { } */
    set_EffectType(value: string): void { this._EffectType = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_RemainingTurn() { } */
    get_RemainingTurn(): int { return this._RemainingTurn; /* auto-property */ }
    /** @rva 0x8A2250  public void set_RemainingTurn(int value) { } */
    set_RemainingTurn(value: int): void { this._RemainingTurn = value; /* auto-property */ }
    /** @rva 0x839380  public bool get_IsPermanent() { } */
    get_IsPermanent(): boolean { return this._IsPermanent; /* auto-property */ }
    /** @rva 0x902AC0  public void set_IsPermanent(bool value) { } */
    set_IsPermanent(value: boolean): void { this._IsPermanent = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_RemainCount() { } */
    get_RemainCount(): int { return this._RemainCount; /* auto-property */ }
    /** @rva 0x8745A0  public void set_RemainCount(int value) { } */
    set_RemainCount(value: int): void { this._RemainCount = value; /* auto-property */ }
    /** @rva 0x736970  public string get_IconName() { } */
    get_IconName(): string { return this._IconName; /* auto-property */ }
    /** @rva 0x736A30  public void set_IconName(string value) { } */
    set_IconName(value: string): void { this._IconName = value; /* auto-property */ }
    /** @rva 0x902790  public bool get_IsActive() { } */
    get_IsActive(): boolean { return this._IsActive; /* auto-property */ }
    /** @rva 0x9027C0  public void set_IsActive(bool value) { } */
    set_IsActive(value: boolean): void { this._IsActive = value; /* auto-property */ }
    /** @rva 0xA0E570  public bool get_ShowStateDetailAttachedByPassiveSkill() { } */
    get_ShowStateDetailAttachedByPassiveSkill(): boolean { return this._ShowStateDetailAttachedByPassiveSkill; /* auto-property */ }
    /** @rva 0xA0E580  public void set_ShowStateDetailAttachedByPassiveSkill(bool value) { } */
    set_ShowStateDetailAttachedByPassiveSkill(value: boolean): void { this._ShowStateDetailAttachedByPassiveSkill = value; /* auto-property */ }
    /** @rva 0x902010  public int get_DetailDisplayPriority() { } */
    get_DetailDisplayPriority(): int { return this._DetailDisplayPriority; /* auto-property */ }
    /** @rva 0x902040  public void set_DetailDisplayPriority(int value) { } */
    set_DetailDisplayPriority(value: int): void { this._DetailDisplayPriority = value; /* auto-property */ }
    /** @rva 0x854810  public int get_StateLevel() { } */
    get_StateLevel(): int { return this._StateLevel; /* auto-property */ }
    /** @rva 0x902050  public void set_StateLevel(int value) { } */
    set_StateLevel(value: int): void { this._StateLevel = value; /* auto-property */ }
    /** @rva 0x87BCD0  public int get_HitCounter() { } */
    get_HitCounter(): int { return this._HitCounter; /* auto-property */ }
    /** @rva 0x902030  public void set_HitCounter(int value) { } */
    set_HitCounter(value: int): void { this._HitCounter = value; /* auto-property */ }
    /** @rva 0x7545F0  public int get_MaxHitCounter() { } */
    get_MaxHitCounter(): int { return this._MaxHitCounter; /* auto-property */ }
    /** @rva 0x7548B0  public void set_MaxHitCounter(int value) { } */
    set_MaxHitCounter(value: int): void { this._MaxHitCounter = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17F3B50  public void .ctor(UnitStateBase unitState, bool isActive) { } */
    ctor$UnitStateBase_bool(unitState: UnitStateBase, isActive: boolean): this { return notPorted("UnitStateData..ctor", 0x17F3B50); }
}
