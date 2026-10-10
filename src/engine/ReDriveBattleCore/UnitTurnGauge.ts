// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../runtime";
import type { float, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.UnitTurnGauge  (TypeDefIndex 483, public class) ----
export class UnitTurnGauge {
    /** 0x0 private static readonly float RawGaugeResetValue */
    static RawGaugeResetValue: float = 0;
    /** 0x10 private int <Id>k__BackingField */
    _Id: int = 0;
    /** 0x14 private float <GaugeValue>k__BackingField */
    _GaugeValue: float = 0;
    /** 0x18 private float speed */
    speed: float = 0;
    /** 0x1C public int TurnOrderPriority */
    TurnOrderPriority: int = 0;
    get Id(): int { return this.get_Id(); }
    set Id(v: int) { this.set_Id(v); }
    get GaugeValue(): float { return this.get_GaugeValue(); }
    set GaugeValue(v: float) { this.set_GaugeValue(v); }
    get BaseValue(): float { return this.get_BaseValue(); }
    /** @rva 0x7364F0  public int get_Id() { } */
    get_Id(): int { return this._Id; /* auto-property */ }
    /** @rva 0x739D00  public void set_Id(int value) { } */
    set_Id(value: int): void { this._Id = value; /* auto-property */ }
    /** @rva 0x8879D0  public float get_GaugeValue() { } */
    get_GaugeValue(): float { return this._GaugeValue; /* auto-property */ }
    /** @rva 0x8879F0  public void set_GaugeValue(float value) { } */
    set_GaugeValue(value: float): void { this._GaugeValue = value; /* auto-property */ }
    /** @rva 0x15CF300  public float get_BaseValue() { } */
    get_BaseValue(): float {
        return f32(UnitTurnGauge.RawGaugeResetValue / this.speed);
    }
    /** @rva 0x15CF070  public void Reset(BattleUnit unit) { } */
    Reset(unit: BattleUnit): void {
        this.speed = unit.GetProcessedSpeed();
        this.TurnOrderPriority = 0;
        this._GaugeValue = f32(UnitTurnGauge.RawGaugeResetValue / this.speed);
        this._Id = unit.Id;
    }
    /** @rva 0x15CEF50  public float DecreaseGaugeValue(float decreaseValue, int turnOrderPriority, bool isTurnShiftDecrease = False) { } */
    DecreaseGaugeValue(decreaseValue: float, turnOrderPriority: int, isTurnShiftDecrease: boolean = false): float {
        const before = this._GaugeValue;
        const after = decreaseValue <= before ? f32(before - decreaseValue) : 0;
        if (!isTurnShiftDecrease) this.TurnOrderPriority = -turnOrderPriority;
        this._GaugeValue = after;
        return f32(after - before);
    }
    /** @rva 0x15CEE60  public float AddGaugeValue(float rate, int turnOrderPriority) { } */
    AddGaugeValue(rate: float, turnOrderPriority: int): float {
        const before = this._GaugeValue;
        // helper 0xca5f40 (inlined elsewhere): Math.Max(gauge + base * rate, 0f)
        const after = Math.max(f32(f32(f32(UnitTurnGauge.RawGaugeResetValue / this.speed) * rate) + before), 0);
        this._GaugeValue = after;
        this.TurnOrderPriority = turnOrderPriority;
        return f32(after - before);
    }
    /** @rva 0x15CF1D0  public float SubtractGaugeValue(float rate, int turnOrderPriority) { } */
    SubtractGaugeValue(rate: float, turnOrderPriority: int): float {
        const before = this._GaugeValue;
        const after = Math.max(f32(f32(f32(UnitTurnGauge.RawGaugeResetValue / this.speed) * -rate) + before), 0);
        this._GaugeValue = after;
        this.TurnOrderPriority = turnOrderPriority;
        return f32(after - before);
    }
    /** @rva 0x15CF110  public float SetSpeedAndUpdateGaugeValue(float newSpeed) { } */
    SetSpeedAndUpdateGaugeValue(newSpeed: float): float {
        if (this.speed === newSpeed) return 0; // Single.Equals
        const oldSpeed = this.speed;
        const before = this._GaugeValue;
        this.speed = newSpeed;
        const after = f32(f32(oldSpeed / newSpeed) * before);
        this._GaugeValue = after;
        return f32(after - before);
    }
    /** @rva 0x15CEFE0  public static float GetNewTurnGaugeValueBySpeedVariation(float originalGaugeValue, float originalSpeed, float newSpeed) { } */
    static GetNewTurnGaugeValueBySpeedVariation(originalGaugeValue: float, originalSpeed: float, newSpeed: float): float {
        return f32(f32(originalSpeed / newSpeed) * originalGaugeValue);
    }
    /** @rva 0x15CEF80  public static float GetBaseValueOfSpeed(float speed) { } */
    static GetBaseValueOfSpeed(speed: float): float {
        return f32(UnitTurnGauge.RawGaugeResetValue / speed);
    }
    /** @rva 0x15CEFF0  public static float GetResultGaugeValueOfRateVariation(float gaugeValue, float baseValue, float rate) { } */
    static GetResultGaugeValueOfRateVariation(gaugeValue: float, baseValue: float, rate: float): float {
        let v = f32(f32(baseValue * rate) + gaugeValue);
        if (v <= 0 && !Number.isNaN(v)) v = 0;
        return v;
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x15CF2C0  private static void .cctor() { } */
    static cctor(): void {
        UnitTurnGauge.RawGaugeResetValue = 10000;
    }
}

UnitTurnGauge.cctor(); // C# static constructor