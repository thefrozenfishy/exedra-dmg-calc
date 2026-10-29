// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { ElementDamageRate } from "./ElementDamageRate";
import type { ElementResistRate } from "./ElementResistRate";

// ---- ReDriveBattleCore.BattleParameter  (TypeDefIndex 335, public class) ----
export class BattleParameter {
    /** 0x10 private int <ATK>k__BackingField */
    _ATK: int = 0;
    /** 0x14 private int <DEF>k__BackingField */
    _DEF: int = 0;
    /** 0x18 private int <CTR>k__BackingField */
    _CTR: int = 0;
    /** 0x1C private int <CTD>k__BackingField */
    _CTD: int = 0;
    /** 0x20 private int <HP>k__BackingField */
    _HP: int = 0;
    /** 0x24 private int <Speed>k__BackingField */
    _Speed: int = 0;
    /** 0x28 private int <HealRate>k__BackingField */
    _HealRate: int = 0;
    /** 0x2C private int <EffectHitRate>k__BackingField */
    _EffectHitRate: int = 0;
    /** 0x30 private int <EffectParryRate>k__BackingField */
    _EffectParryRate: int = 0;
    /** 0x38 private ElementDamageRate[] <ElementDamageRates>k__BackingField */
    _ElementDamageRates: ElementDamageRate[] = null!;
    /** 0x40 private ElementResistRate[] <ElementResistRates>k__BackingField */
    _ElementResistRates: ElementResistRate[] = null!;
    /** 0x48 private int <BreakPoint>k__BackingField */
    _BreakPoint: int = 0;
    /** 0x4C private int <BreakPointRecoveryPerTurn>k__BackingField */
    _BreakPointRecoveryPerTurn: int = 0;
    /** 0x50 private int <BreakTurnGaugeSlowRatio>k__BackingField */
    _BreakTurnGaugeSlowRatio: int = 0;
    /** 0x54 private int <InitialBreakedDamageReceiveRate>k__BackingField */
    _InitialBreakedDamageReceiveRate: int = 0;
    /** 0x58 private int <MaxBreakedDamageReceiveRate>k__BackingField */
    _MaxBreakedDamageReceiveRate: int = 0;
    /** 0x5C private int <BreakedDamageReceiveRateIncreaseRate>k__BackingField */
    _BreakedDamageReceiveRateIncreaseRate: int = 0;
    get ATK(): int { return this.get_ATK(); }
    set ATK(v: int) { this.set_ATK(v); }
    get DEF(): int { return this.get_DEF(); }
    set DEF(v: int) { this.set_DEF(v); }
    get CTR(): int { return this.get_CTR(); }
    set CTR(v: int) { this.set_CTR(v); }
    get CTD(): int { return this.get_CTD(); }
    set CTD(v: int) { this.set_CTD(v); }
    get HP(): int { return this.get_HP(); }
    set HP(v: int) { this.set_HP(v); }
    get Speed(): int { return this.get_Speed(); }
    set Speed(v: int) { this.set_Speed(v); }
    get HealRate(): int { return this.get_HealRate(); }
    set HealRate(v: int) { this.set_HealRate(v); }
    get EffectHitRate(): int { return this.get_EffectHitRate(); }
    set EffectHitRate(v: int) { this.set_EffectHitRate(v); }
    get EffectParryRate(): int { return this.get_EffectParryRate(); }
    set EffectParryRate(v: int) { this.set_EffectParryRate(v); }
    get ElementDamageRates(): ElementDamageRate[] { return this.get_ElementDamageRates(); }
    set ElementDamageRates(v: ElementDamageRate[]) { this.set_ElementDamageRates(v); }
    get ElementResistRates(): ElementResistRate[] { return this.get_ElementResistRates(); }
    set ElementResistRates(v: ElementResistRate[]) { this.set_ElementResistRates(v); }
    get BreakPoint(): int { return this.get_BreakPoint(); }
    set BreakPoint(v: int) { this.set_BreakPoint(v); }
    get BreakPointRecoveryPerTurn(): int { return this.get_BreakPointRecoveryPerTurn(); }
    set BreakPointRecoveryPerTurn(v: int) { this.set_BreakPointRecoveryPerTurn(v); }
    get BreakTurnGaugeSlowRatio(): int { return this.get_BreakTurnGaugeSlowRatio(); }
    set BreakTurnGaugeSlowRatio(v: int) { this.set_BreakTurnGaugeSlowRatio(v); }
    get InitialBreakedDamageReceiveRate(): int { return this.get_InitialBreakedDamageReceiveRate(); }
    set InitialBreakedDamageReceiveRate(v: int) { this.set_InitialBreakedDamageReceiveRate(v); }
    get MaxBreakedDamageReceiveRate(): int { return this.get_MaxBreakedDamageReceiveRate(); }
    set MaxBreakedDamageReceiveRate(v: int) { this.set_MaxBreakedDamageReceiveRate(v); }
    get BreakedDamageReceiveRateIncreaseRate(): int { return this.get_BreakedDamageReceiveRateIncreaseRate(); }
    set BreakedDamageReceiveRateIncreaseRate(v: int) { this.set_BreakedDamageReceiveRateIncreaseRate(v); }
    /** @rva 0x7364F0  public int get_ATK() { } */
    get_ATK(): int { return this._ATK; /* auto-property */ }
    /** @rva 0x739D00  public void set_ATK(int value) { } */
    set_ATK(value: int): void { this._ATK = value; /* auto-property */ }
    /** @rva 0x803350  public int get_DEF() { } */
    get_DEF(): int { return this._DEF; /* auto-property */ }
    /** @rva 0x803540  public void set_DEF(int value) { } */
    set_DEF(value: int): void { this._DEF = value; /* auto-property */ }
    /** @rva 0x763820  public int get_CTR() { } */
    get_CTR(): int { return this._CTR; /* auto-property */ }
    /** @rva 0x8A2240  public void set_CTR(int value) { } */
    set_CTR(value: int): void { this._CTR = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_CTD() { } */
    get_CTD(): int { return this._CTD; /* auto-property */ }
    /** @rva 0x7F9820  public void set_CTD(int value) { } */
    set_CTD(value: int): void { this._CTD = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_HP() { } */
    get_HP(): int { return this._HP; /* auto-property */ }
    /** @rva 0x8A2230  public void set_HP(int value) { } */
    set_HP(value: int): void { this._HP = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_Speed() { } */
    get_Speed(): int { return this._Speed; /* auto-property */ }
    /** @rva 0x75A840  public void set_Speed(int value) { } */
    set_Speed(value: int): void { this._Speed = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_HealRate() { } */
    get_HealRate(): int { return this._HealRate; /* auto-property */ }
    /** @rva 0x8A2250  public void set_HealRate(int value) { } */
    set_HealRate(value: int): void { this._HealRate = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_EffectHitRate() { } */
    get_EffectHitRate(): int { return this._EffectHitRate; /* auto-property */ }
    /** @rva 0x8A2260  public void set_EffectHitRate(int value) { } */
    set_EffectHitRate(value: int): void { this._EffectHitRate = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_EffectParryRate() { } */
    get_EffectParryRate(): int { return this._EffectParryRate; /* auto-property */ }
    /** @rva 0x8745A0  public void set_EffectParryRate(int value) { } */
    set_EffectParryRate(value: int): void { this._EffectParryRate = value; /* auto-property */ }
    /** @rva 0x736970  public ElementDamageRate[] get_ElementDamageRates() { } */
    get_ElementDamageRates(): ElementDamageRate[] { return this._ElementDamageRates; /* auto-property */ }
    /** @rva 0x736A30  public void set_ElementDamageRates(ElementDamageRate[] value) { } */
    set_ElementDamageRates(value: ElementDamageRate[]): void { this._ElementDamageRates = value; /* auto-property */ }
    /** @rva 0x7368E0  public ElementResistRate[] get_ElementResistRates() { } */
    get_ElementResistRates(): ElementResistRate[] { return this._ElementResistRates; /* auto-property */ }
    /** @rva 0x736F20  public void set_ElementResistRates(ElementResistRate[] value) { } */
    set_ElementResistRates(value: ElementResistRate[]): void { this._ElementResistRates = value; /* auto-property */ }
    /** @rva 0x854810  public int get_BreakPoint() { } */
    get_BreakPoint(): int { return this._BreakPoint; /* auto-property */ }
    /** @rva 0x901750  public void set_BreakPoint(int value) { } */
    set_BreakPoint(value: int): void { this._BreakPoint = value; /* auto-property */ }
    /** @rva 0x87BCD0  public int get_BreakPointRecoveryPerTurn() { } */
    get_BreakPointRecoveryPerTurn(): int { return this._BreakPointRecoveryPerTurn; /* auto-property */ }
    /** @rva 0x901740  public void set_BreakPointRecoveryPerTurn(int value) { } */
    set_BreakPointRecoveryPerTurn(value: int): void { this._BreakPointRecoveryPerTurn = value; /* auto-property */ }
    /** @rva 0x7545F0  public int get_BreakTurnGaugeSlowRatio() { } */
    get_BreakTurnGaugeSlowRatio(): int { return this._BreakTurnGaugeSlowRatio; /* auto-property */ }
    /** @rva 0x7548B0  public void set_BreakTurnGaugeSlowRatio(int value) { } */
    set_BreakTurnGaugeSlowRatio(value: int): void { this._BreakTurnGaugeSlowRatio = value; /* auto-property */ }
    /** @rva 0x8A2210  public int get_InitialBreakedDamageReceiveRate() { } */
    get_InitialBreakedDamageReceiveRate(): int { return this._InitialBreakedDamageReceiveRate; /* auto-property */ }
    /** @rva 0x8A22E0  public void set_InitialBreakedDamageReceiveRate(int value) { } */
    set_InitialBreakedDamageReceiveRate(value: int): void { this._InitialBreakedDamageReceiveRate = value; /* auto-property */ }
    /** @rva 0x737C40  public int get_MaxBreakedDamageReceiveRate() { } */
    get_MaxBreakedDamageReceiveRate(): int { return this._MaxBreakedDamageReceiveRate; /* auto-property */ }
    /** @rva 0x737DF0  public void set_MaxBreakedDamageReceiveRate(int value) { } */
    set_MaxBreakedDamageReceiveRate(value: int): void { this._MaxBreakedDamageReceiveRate = value; /* auto-property */ }
    /** @rva 0x7544F0  public int get_BreakedDamageReceiveRateIncreaseRate() { } */
    get_BreakedDamageReceiveRateIncreaseRate(): int { return this._BreakedDamageReceiveRateIncreaseRate; /* auto-property */ }
    /** @rva 0x7547A0  public void set_BreakedDamageReceiveRateIncreaseRate(int value) { } */
    set_BreakedDamageReceiveRateIncreaseRate(value: int): void { this._BreakedDamageReceiveRateIncreaseRate = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1392AF0  public void .ctor(in int atk, in int def, in int ctr, in int ctd, in int hp, in int speed, in int healRate, in int effectHitRate, in int effectParryRate, in ElementDamageRate[] elementDamageRates, in ElementResistRate[] elementResistRates) { } */
    ctor$int_int_int_int_int_int_int_int_int_ElementDamageRate_ElementResistRate(atk: int, def: int, ctr: int, ctd: int, hp: int, speed: int, healRate: int, effectHitRate: int, effectParryRate: int, elementDamageRates: ElementDamageRate[], elementResistRates: ElementResistRate[]): this {
        // asm 0x1381740 (Ghidra dropped the last stack argument)
        this._EffectParryRate = effectParryRate;
        this._ATK = atk;
        this._DEF = def;
        this._CTR = ctr;
        this._CTD = ctd;
        this._HP = hp;
        this._Speed = speed;
        this._HealRate = healRate;
        this._EffectHitRate = effectHitRate;
        this._ElementDamageRates = elementDamageRates;
        this._ElementResistRates = elementResistRates;
        return this;
    }
}
