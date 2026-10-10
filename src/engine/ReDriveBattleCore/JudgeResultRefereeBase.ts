// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import type { ResultStatus } from "./ResultStatus";

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
    /** @rva 0x7364F0  public ResultStatus get_Result() { } */
    get_Result(): ResultStatus { return this.result; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x149E9C0  protected void set_Result(ResultStatus value) { } */
    set_Result(value: ResultStatus): void { return notPorted("JudgeResultRefereeBase.set_Result", 0x149E9C0); }
    /** @rva 0x852290  public bool get_BattleFinishByRoundLimit() { } */
    get_BattleFinishByRoundLimit(): boolean { return this._BattleFinishByRoundLimit; /* auto-property */ }
    /** @rva 0x9024F0  protected void set_BattleFinishByRoundLimit(bool value) { } */
    set_BattleFinishByRoundLimit(value: boolean): void { this._BattleFinishByRoundLimit = value; /* auto-property */ }
    /** @rva 0x8522A0  public bool get_BattleFinishByTimeLimit() { } */
    get_BattleFinishByTimeLimit(): boolean { return this._BattleFinishByTimeLimit; /* auto-property */ }
    /** @rva 0x95E170  protected void set_BattleFinishByTimeLimit(bool value) { } */
    set_BattleFinishByTimeLimit(value: boolean): void { this._BattleFinishByTimeLimit = value; /* auto-property */ }
    /** @rva -1 slot 4  public abstract int get_RoundLimit(); */
    abstract get_RoundLimit(): int;
    /** @rva 0x149E9D0  private bool get_HasRoundLimit() { } */
    get_HasRoundLimit(): boolean { return notPorted("JudgeResultRefereeBase.get_HasRoundLimit", 0x149E9D0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x8AB430  public void Init() { } */
    Init(): void { return notPorted("JudgeResultRefereeBase.Init", 0x8AB430); }
    /** @rva 0x8AB430  public void ResetResult() { } */
    ResetResult(): void { return notPorted("JudgeResultRefereeBase.ResetResult", 0x8AB430); }
    /** @rva -1 slot 5  public abstract void CheckMainTargetEnemyDead(BattleUnit deathUnit); */
    abstract CheckMainTargetEnemyDead(deathUnit: BattleUnit): void;
    /** @rva 0x149E960 slot 6  public virtual void CheckBattleFinishBeforeAct(int nextActRound) { } */
    CheckBattleFinishBeforeAct(nextActRound: int): void { return notPorted("JudgeResultRefereeBase.CheckBattleFinishBeforeAct", 0x149E960); }
    /** @rva 0x149E760 slot 7  public virtual void CheckBattleFinishAfterAct(List<BattleUnit> activeUnitList) { } */
    CheckBattleFinishAfterAct(activeUnitList: List<BattleUnit>): void { return notPorted("JudgeResultRefereeBase.CheckBattleFinishAfterAct", 0x149E760); }
    /** @rva 0x730170 slot 8  public virtual void CheckBattleFinishByTimeLimit(DateTimeOffset currentTime) { } */
    CheckBattleFinishByTimeLimit(currentTime: any /* DateTimeOffset */): void { /* asm: ret 0 */ }
    /** @rva 0x149E9C0  public void SetResult(ResultStatus result) { } */
    SetResult(result: ResultStatus): void { return notPorted("JudgeResultRefereeBase.SetResult", 0x149E9C0); }
}
