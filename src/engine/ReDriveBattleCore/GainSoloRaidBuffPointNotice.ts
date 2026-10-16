// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";

// ---- ReDriveBattleCore.GainSoloRaidBuffPointNotice  (TypeDefIndex 316, public class) ----
export class GainSoloRaidBuffPointNotice {
    /** 0x10 private string <IconName>k__BackingField */
    _IconName: string = null!;
    /** 0x18 private int <GainPoint>k__BackingField */
    _GainPoint: int = 0;
    /** 0x1C private int <AfterPoint>k__BackingField */
    _AfterPoint: int = 0;
    /** 0x20 private AbilitySourceType <AbilitySource>k__BackingField */
    _AbilitySource: AbilitySourceType = 0 as AbilitySourceType;
    get IconName(): string { return this.get_IconName(); }
    set IconName(v: string) { this.set_IconName(v); }
    get GainPoint(): int { return this.get_GainPoint(); }
    set GainPoint(v: int) { this.set_GainPoint(v); }
    get AfterPoint(): int { return this.get_AfterPoint(); }
    set AfterPoint(v: int) { this.set_AfterPoint(v); }
    get AbilitySource(): AbilitySourceType { return this.get_AbilitySource(); }
    set AbilitySource(v: AbilitySourceType) { this.set_AbilitySource(v); }
    /** @rva 0x72FC50  public string get_IconName() { } */
    get_IconName(): string { return this._IconName; /* auto-property */ }
    /** @rva 0x72FC60  public void set_IconName(string value) { } */
    set_IconName(value: string): void { this._IconName = value; /* auto-property */ }
    /** @rva 0x762820  public int get_GainPoint() { } */
    get_GainPoint(): int { return this._GainPoint; /* auto-property */ }
    /** @rva 0x8A1240  public void set_GainPoint(int value) { } */
    set_GainPoint(value: int): void { this._GainPoint = value; /* auto-property */ }
    /** @rva 0x7F8800  public int get_AfterPoint() { } */
    get_AfterPoint(): int { return this._AfterPoint; /* auto-property */ }
    /** @rva 0x7F8820  public void set_AfterPoint(int value) { } */
    set_AfterPoint(value: int): void { this._AfterPoint = value; /* auto-property */ }
    /** @rva 0x75DD70  public AbilitySourceType get_AbilitySource() { } */
    get_AbilitySource(): AbilitySourceType { return this._AbilitySource; /* auto-property */ }
    /** @rva 0x8A1230  public void set_AbilitySource(AbilitySourceType value) { } */
    set_AbilitySource(value: AbilitySourceType): void { this._AbilitySource = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x13066D0  public void .ctor(string iconName, int gainPoint, int afterPoint, AbilitySourceType abilitySource) { } */
    ctor$string_int_int_AbilitySourceType(iconName: string, gainPoint: int, afterPoint: int, abilitySource: AbilitySourceType): this {
        this._IconName = iconName;
        this._AfterPoint = afterPoint;
        this._AbilitySource = abilitySource;
        this._GainPoint = gainPoint;
        return this;
    }
}
