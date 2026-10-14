// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../runtime";

// ---- ReDriveBattleCore.BattleUnitSpeedAccumulator  (TypeDefIndex 362, public class) ----
export class BattleUnitSpeedAccumulator {
    /** 0x10 private int <AccumulatedSpeed>k__BackingField */
    _AccumulatedSpeed: int = 0;
    /** 0x14 private int useSpeedAmount */
    useSpeedAmount: int = 0;
    /** 0x18 private readonly int recastTimeSec */
    recastTimeSec: int = 0;
    /** 0x1C private int remainRecastTimeSec */
    remainRecastTimeSec: int = 0;
    get AccumulatedSpeed(): int { return this.get_AccumulatedSpeed(); }
    set AccumulatedSpeed(v: int) { this.set_AccumulatedSpeed(v); }
    /** @rva 0x7364F0  public int get_AccumulatedSpeed() { } */
    get_AccumulatedSpeed(): int { return this._AccumulatedSpeed; /* auto-property */ }
    /** @rva 0x739D00  private void set_AccumulatedSpeed(int value) { } */
    set_AccumulatedSpeed(value: int): void { this._AccumulatedSpeed = value; /* auto-property */ }
    /** @rva 0x14912C0  public void .ctor(int useSpeedAmount, int recastTimeSecRegulation) { } */
    ctor$int_int(useSpeedAmount: int, recastTimeSecRegulation: int): this {
        this.useSpeedAmount = useSpeedAmount;
        this.recastTimeSec = recastTimeSecRegulation;
        return this;
    }
    /** @rva 0x14912A0  public void TryUpdate(int addSpeedIfNotRecasting) { } */
    TryUpdate(addSpeedIfNotRecasting: int): void {
        if (this.remainRecastTimeSec < 1) {
            this._AccumulatedSpeed = (this._AccumulatedSpeed + addSpeedIfNotRecasting) | 0;
            return;
        }
        this.remainRecastTimeSec = (this.remainRecastTimeSec - 1) | 0;
    }
    /** @rva 0x1491280  public bool IsCanUseSpeed() { } */
    IsCanUseSpeed(): boolean {
        if (this._AccumulatedSpeed < this.useSpeedAmount) return false;
        return this.remainRecastTimeSec === 0;
    }
    /** @rva 0x14912B0  public void UseSpeed() { } */
    UseSpeed(): void {
        this._AccumulatedSpeed = (this._AccumulatedSpeed - this.useSpeedAmount) | 0;
        this.remainRecastTimeSec = this.recastTimeSec;
    }
}
