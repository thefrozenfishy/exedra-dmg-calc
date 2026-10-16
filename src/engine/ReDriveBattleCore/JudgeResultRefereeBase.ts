// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { ResultStatus } from "./ResultStatus";
import { BattleUnit_TeamType } from "./BattleUnit";

// ---- ReDriveBattleCore.JudgeResultRefereeBase  (TypeDefIndex 418, public abstract class) ----
export abstract class JudgeResultRefereeBase {
    /** 0x10 private ResultStatus result */
    result: ResultStatus = 0 as ResultStatus;
    /** 0x14 private bool <BattleFinishByRoundLimit>k__BackingField */
    _BattleFinishByRoundLimit: boolean = false;
    /** 0x15 private bool <BattleFinishByTimeLimit>k__BackingField */
    _BattleFinishByTimeLimit: boolean = false;
    /** public const int DefaultRoundLimit */
    static readonly DefaultRoundLimit: int = 100;
    get Result(): ResultStatus { return this.get_Result(); }
    set Result(v: ResultStatus) { this.set_Result(v); }
    get BattleFinishByRoundLimit(): boolean { return this.get_BattleFinishByRoundLimit(); }
    set BattleFinishByRoundLimit(v: boolean) { this.set_BattleFinishByRoundLimit(v); }
    get BattleFinishByTimeLimit(): boolean { return this.get_BattleFinishByTimeLimit(); }
    set BattleFinishByTimeLimit(v: boolean) { this.set_BattleFinishByTimeLimit(v); }
    get RoundLimit(): int { return this.get_RoundLimit(); }
    get HasRoundLimit(): boolean { return this.get_HasRoundLimit(); }
    /** @rva 0x7354F0  public ResultStatus get_Result() { } */
    get_Result(): ResultStatus { return this.result; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x14C4C50  protected void set_Result(ResultStatus value) { } */
    set_Result(value: ResultStatus): void {
        if (this.result === ResultStatus.None) this.result = value;
    }
    /** @rva 0x851290  public bool get_BattleFinishByRoundLimit() { } */
    get_BattleFinishByRoundLimit(): boolean { return this._BattleFinishByRoundLimit; /* auto-property */ }
    /** @rva 0x900970  protected void set_BattleFinishByRoundLimit(bool value) { } */
    set_BattleFinishByRoundLimit(value: boolean): void { this._BattleFinishByRoundLimit = value; /* auto-property */ }
    /** @rva 0x8512A0  public bool get_BattleFinishByTimeLimit() { } */
    get_BattleFinishByTimeLimit(): boolean { return this._BattleFinishByTimeLimit; /* auto-property */ }
    /** @rva 0x96C500  protected void set_BattleFinishByTimeLimit(bool value) { } */
    set_BattleFinishByTimeLimit(value: boolean): void { this._BattleFinishByTimeLimit = value; /* auto-property */ }
    /** @rva -1 slot 4  public abstract int get_RoundLimit(); */
    abstract get_RoundLimit(): int;
    /** @rva 0x14C4C60  private bool get_HasRoundLimit() { } */
    get_HasRoundLimit(): boolean {
        return 0 < this.get_RoundLimit();
    }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x8AA430  public void Init() { } */
    Init(): void {
        this.result = 0;
    }
    /** @rva 0x8AA430  public void ResetResult() { } */
    ResetResult(): void {
        this.result = 0;
    }
    /** @rva -1 slot 5  public abstract void CheckMainTargetEnemyDead(BattleUnit deathUnit); */
    abstract CheckMainTargetEnemyDead(deathUnit: BattleUnit): void;
    /** @rva 0x14C4BF0 slot 6  public virtual void CheckBattleFinishBeforeAct(int nextActRound) { } */
    CheckBattleFinishBeforeAct(nextActRound: int): void {
        if (0 < this.get_RoundLimit() && this.get_RoundLimit() < nextActRound) { // HasRoundLimit inlined
            if (this.result === ResultStatus.None) this.result = ResultStatus.Losing;
            this._BattleFinishByRoundLimit = true;
        }
    }
    /** @rva 0x14C49F0 slot 7  public virtual void CheckBattleFinishAfterAct(List<BattleUnit> activeUnitList) { } */
    CheckBattleFinishAfterAct(activeUnitList: List<BattleUnit>): void {
        if (!activeUnitList.some(unit => unit.Team === BattleUnit_TeamType.Enemy)) { // <>c.b__22_0
            if (this.result === ResultStatus.None) this.result = ResultStatus.Winning;
        } else if (!activeUnitList.some(unit => unit.Team === BattleUnit_TeamType.Ally) && this.result === ResultStatus.None) { // <>c.b__22_1
            this.result = ResultStatus.Losing;
        }
    }
    /** @rva 0x72F170 slot 8  public virtual void CheckBattleFinishByTimeLimit(DateTimeOffset currentTime) { } */
    CheckBattleFinishByTimeLimit(currentTime: any /* DateTimeOffset */): void { /* asm: ret 0 */ }
    /** @rva 0x14C4C50  public void SetResult(ResultStatus result) { } */
    SetResult(result: ResultStatus): void {
        if (this.result === ResultStatus.None) this.result = result; // same code as set_Result
    }
}
