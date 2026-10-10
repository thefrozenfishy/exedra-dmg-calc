// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AbnormalUnitStateBase } from "./UnitState/AbnormalUnitStateBase";
import { isAssignableFrom, notPorted, typeName } from "../runtime";
import type { Ref, Type, int } from "../runtime";
import type { AbnormalType } from "./UnitState/AbnormalType";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbnormalEffectParryRate  (TypeDefIndex 343, public class) ----
export class AbnormalEffectParryRate {
    /** 0x10 private int <ParryRate>k__BackingField */
    _ParryRate: int = 0;
    get ParryRate(): int { return this.get_ParryRate(); }
    set ParryRate(v: int) { this.set_ParryRate(v); }
    get TypeName(): string { return this.get_TypeName(); }
    get AbnormalUnitStateBaseType(): Type { return this.get_AbnormalUnitStateBaseType(); }
    /** @rva 0x7364F0  public int get_ParryRate() { } */
    get_ParryRate(): int { return this._ParryRate; /* auto-property */ }
    /** @rva 0x739D00  public void set_ParryRate(int value) { } */
    set_ParryRate(value: int): void { this._ParryRate = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x733EE0  public void .ctor(int parryRate) { } */
    ctor$int(parryRate: int): this {
        this._ParryRate = parryRate;
        return this;
    }
    /** @rva 0x1374720 slot 4  public virtual string get_TypeName() { } */
    get_TypeName(): string { return ""; /* string.Empty */ }
    /** @rva 0x7431D0 slot 5  public virtual Type get_AbnormalUnitStateBaseType() { } */
    get_AbnormalUnitStateBaseType(): Type { return null!; /* asm: xor eax, eax; ret */ }
    /** @rva 0x13746A0  public bool TryGetAbnormalType(out AbnormalType abnormalType) { } */
    TryGetAbnormalType(abnormalType: Ref<AbnormalType>): boolean {
        return AbnormalUnitStateBase.TryGetAbnormalTypeOfState(this.get_AbnormalUnitStateBaseType(), abnormalType);
    }
    /** @rva 0x7360C0 slot 6  public virtual bool IsTargetType(UnitStateBase unitState) { } */
    IsTargetType$UnitStateBase(unitState: UnitStateBase): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7360C0 slot 7  public virtual bool IsTargetType(Type type) { } */
    IsTargetType$Type(type_: Type): boolean { return false; /* asm: xor al, al; ret */ }
}

// ---- ReDriveBattleCore.AbnormalEffectParryRate<T>  (TypeDefIndex 344, public class) ----
export class AbnormalEffectParryRate$1<T> extends AbnormalEffectParryRate {
    /** typeof(T): the closed generic type argument (IL2CPP keeps it in the class RGCTX). */
    readonly T$: Type;
    constructor(T$: Type) { super(); this.T$ = T$; }
    /** @rva -1  public void .ctor() { } */
    ctor(): this { return this; }
    /** @rva -1  public void .ctor(int parryRate) { } */
    ctor$int(parryRate: int): this { super.ctor$int(parryRate); return this; /* 0x2a235a0 -> 0x733ee0 */ }
    /** @rva -1 slot 4  public override string get_TypeName() { } */
    get_TypeName(): string { return typeName(this.T$); /* 0x2a23610 typeof(T).Name */ }
    /** @rva -1 slot 5  public sealed override Type get_AbnormalUnitStateBaseType() { } */
    get_AbnormalUnitStateBaseType(): Type { return this.T$; /* 0x2a235b0 */ }
    /** @rva -1 slot 6  public override bool IsTargetType(UnitStateBase unitState) { } */
    IsTargetType$UnitStateBase(unitState: UnitStateBase): boolean { return unitState instanceof this.T$; /* 0x2a234d0 isinst T */ }
    /** @rva -1 slot 7  public sealed override bool IsTargetType(Type type) { } */
    IsTargetType$Type(type_: Type): boolean { return isAssignableFrom(this.T$, type_); /* 0x2a23510 typeof(T).IsAssignableFrom(type) */ }
}
