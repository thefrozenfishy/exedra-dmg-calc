// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { Phase } from "./Phase";

// ---- ReDriveBattleCore.Command.CommandBattlePhase  (TypeDefIndex 977, public sealed class) ----
export class CommandBattlePhase extends CommandBase {
    /** 0x18 private Phase <Phase>k__BackingField */
    _Phase: Phase = 0 as Phase;
    /** 0x20 private CommandBattlePhase.ReadyPhaseData <ReadyPhase>k__BackingField */
    _ReadyPhase: CommandBattlePhase_ReadyPhaseData = null!;
    /** 0x28 private CommandBattlePhase.FinishPhaseData <FinishPhase>k__BackingField */
    _FinishPhase: CommandBattlePhase_FinishPhaseData = null!;
    get Phase(): Phase { return this.get_Phase(); }
    set Phase(v: Phase) { this.set_Phase(v); }
    get ReadyPhase(): CommandBattlePhase_ReadyPhaseData { return this.get_ReadyPhase(); }
    set ReadyPhase(v: CommandBattlePhase_ReadyPhaseData) { this.set_ReadyPhase(v); }
    get FinishPhase(): CommandBattlePhase_FinishPhaseData { return this.get_FinishPhase(); }
    set FinishPhase(v: CommandBattlePhase_FinishPhaseData) { this.set_FinishPhase(v); }
    /** @rva 0x763820  public Phase get_Phase() { } */
    get_Phase(): Phase { return this._Phase; /* auto-property */ }
    /** @rva 0x8A2240  public void set_Phase(Phase value) { } */
    set_Phase(value: Phase): void { this._Phase = value; /* auto-property */ }
    /** @rva 0x7369E0  public CommandBattlePhase.ReadyPhaseData get_ReadyPhase() { } */
    get_ReadyPhase(): CommandBattlePhase_ReadyPhaseData { return this._ReadyPhase; /* auto-property */ }
    /** @rva 0x736A50  public void set_ReadyPhase(CommandBattlePhase.ReadyPhaseData value) { } */
    set_ReadyPhase(value: CommandBattlePhase_ReadyPhaseData): void { this._ReadyPhase = value; /* auto-property */ }
    /** @rva 0x736EA0  public CommandBattlePhase.FinishPhaseData get_FinishPhase() { } */
    get_FinishPhase(): CommandBattlePhase_FinishPhaseData { return this._FinishPhase; /* auto-property */ }
    /** @rva 0x736F10  public void set_FinishPhase(CommandBattlePhase.FinishPhaseData value) { } */
    set_FinishPhase(value: CommandBattlePhase_FinishPhaseData): void { this._FinishPhase = value; /* auto-property */ }
    /** @rva 0x759B30 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 1 as CommandType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17E85B0  public void .ctor(in Phase phase, CommandBattlePhase.ReadyPhaseData readyPhase, CommandBattlePhase.FinishPhaseData finishPhase) { } */
    ctor$Phase_ReadyPhaseData_FinishPhaseData(phase: Phase, readyPhase: CommandBattlePhase_ReadyPhaseData, finishPhase: CommandBattlePhase_FinishPhaseData): this {
        this._Phase = phase;
        this._ReadyPhase = readyPhase;
        this._FinishPhase = finishPhase;
        return this;
    }
}

// ---- ReDriveBattleCore.Command.CommandBattlePhase.PhaseDataBase  (TypeDefIndex 974, public class) ----
export class CommandBattlePhase_PhaseDataBase {
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.Command.CommandBattlePhase.ReadyPhaseData  (TypeDefIndex 975, public class) ----
export class CommandBattlePhase_ReadyPhaseData extends CommandBattlePhase_PhaseDataBase {
    /** 0x10 private int <firstAllyUnitId>k__BackingField */
    _firstAllyUnitId: int = 0;
    get firstAllyUnitId(): int { return this.get_firstAllyUnitId(); }
    set firstAllyUnitId(v: int) { this.set_firstAllyUnitId(v); }
    /** @rva 0x7364F0  public int get_firstAllyUnitId() { } */
    get_firstAllyUnitId(): int { return this._firstAllyUnitId; /* auto-property */ }
    /** @rva 0x739D00  public void set_firstAllyUnitId(int value) { } */
    set_firstAllyUnitId(value: int): void { this._firstAllyUnitId = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.Command.CommandBattlePhase.FinishPhaseData  (TypeDefIndex 976, public class) ----
export class CommandBattlePhase_FinishPhaseData extends CommandBattlePhase_PhaseDataBase {
    /** 0x10 private bool <isWinPlayer>k__BackingField */
    _isWinPlayer: boolean = false;
    /** 0x11 private bool <battleFinishByRoundLimit>k__BackingField */
    _battleFinishByRoundLimit: boolean = false;
    /** 0x12 private bool <battleFinishByTimeLimit>k__BackingField */
    _battleFinishByTimeLimit: boolean = false;
    get isWinPlayer(): boolean { return this.get_isWinPlayer(); }
    set isWinPlayer(v: boolean) { this.set_isWinPlayer(v); }
    get battleFinishByRoundLimit(): boolean { return this.get_battleFinishByRoundLimit(); }
    set battleFinishByRoundLimit(v: boolean) { this.set_battleFinishByRoundLimit(v); }
    get battleFinishByTimeLimit(): boolean { return this.get_battleFinishByTimeLimit(); }
    set battleFinishByTimeLimit(v: boolean) { this.set_battleFinishByTimeLimit(v); }
    /** @rva 0x730A80  public bool get_isWinPlayer() { } */
    get_isWinPlayer(): boolean { return this._isWinPlayer; /* auto-property */ }
    /** @rva 0x730A90  public void set_isWinPlayer(bool value) { } */
    set_isWinPlayer(value: boolean): void { this._isWinPlayer = value; /* auto-property */ }
    /** @rva 0x9025E0  public bool get_battleFinishByRoundLimit() { } */
    get_battleFinishByRoundLimit(): boolean { return this._battleFinishByRoundLimit; /* auto-property */ }
    /** @rva 0x9026B0  public void set_battleFinishByRoundLimit(bool value) { } */
    set_battleFinishByRoundLimit(value: boolean): void { this._battleFinishByRoundLimit = value; /* auto-property */ }
    /** @rva 0x9025A0  public bool get_battleFinishByTimeLimit() { } */
    get_battleFinishByTimeLimit(): boolean { return this._battleFinishByTimeLimit; /* auto-property */ }
    /** @rva 0x902660  public void set_battleFinishByTimeLimit(bool value) { } */
    set_battleFinishByTimeLimit(value: boolean): void { this._battleFinishByTimeLimit = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
