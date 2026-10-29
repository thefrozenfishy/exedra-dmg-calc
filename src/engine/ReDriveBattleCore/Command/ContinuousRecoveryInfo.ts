// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Command.ContinuousRecoveryInfo  (TypeDefIndex 1029, public class) ----
export class ContinuousRecoveryInfo {
    /** 0x10 private int <AffectedUnitId>k__BackingField */
    _AffectedUnitId: int = 0;
    /** 0x14 private int <RecoveryValue>k__BackingField */
    _RecoveryValue: int = 0;
    /** 0x18 private int <ResultHp>k__BackingField */
    _ResultHp: int = 0;
    get AffectedUnitId(): int { return this.get_AffectedUnitId(); }
    set AffectedUnitId(v: int) { this.set_AffectedUnitId(v); }
    get RecoveryValue(): int { return this.get_RecoveryValue(); }
    set RecoveryValue(v: int) { this.set_RecoveryValue(v); }
    get ResultHp(): int { return this.get_ResultHp(); }
    set ResultHp(v: int) { this.set_ResultHp(v); }
    /** @rva 0x7364F0  public int get_AffectedUnitId() { } */
    get_AffectedUnitId(): int { return this._AffectedUnitId; /* auto-property */ }
    /** @rva 0x739D00  public void set_AffectedUnitId(int value) { } */
    set_AffectedUnitId(value: int): void { this._AffectedUnitId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_RecoveryValue() { } */
    get_RecoveryValue(): int { return this._RecoveryValue; /* auto-property */ }
    /** @rva 0x803540  public void set_RecoveryValue(int value) { } */
    set_RecoveryValue(value: int): void { this._RecoveryValue = value; /* auto-property */ }
    /** @rva 0x763820  public int get_ResultHp() { } */
    get_ResultHp(): int { return this._ResultHp; /* auto-property */ }
    /** @rva 0x8A2240  public void set_ResultHp(int value) { } */
    set_ResultHp(value: int): void { this._ResultHp = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
