// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";

// ---- ReDriveBattleCore.ElementAimDamageRate  (TypeDefIndex 338, public class) ----
export class ElementAimDamageRate {
    /** 0x10 private ElementType <Element>k__BackingField */
    _Element: ElementType = 0 as ElementType;
    /** 0x14 private int <DamageRate>k__BackingField */
    _DamageRate: int = 0;
    get Element(): ElementType { return this.get_Element(); }
    set Element(v: ElementType) { this.set_Element(v); }
    get DamageRate(): int { return this.get_DamageRate(); }
    set DamageRate(v: int) { this.set_DamageRate(v); }
    /** @rva 0x7364F0  public ElementType get_Element() { } */
    get_Element(): ElementType { return this._Element; /* auto-property */ }
    /** @rva 0x739D00  public void set_Element(ElementType value) { } */
    set_Element(value: ElementType): void { this._Element = value; /* auto-property */ }
    /** @rva 0x803350  public int get_DamageRate() { } */
    get_DamageRate(): int { return this._DamageRate; /* auto-property */ }
    /** @rva 0x803540  public void set_DamageRate(int value) { } */
    set_DamageRate(value: int): void { this._DamageRate = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x903860  public void .ctor(ElementType element, int damageRate) { } */
    ctor$ElementType_int(element: ElementType, damageRate: int): this {
        this._Element = element;
        this._DamageRate = damageRate;
        return this;
    }
}
