// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { BattleCoreErrorType } from "./BattleCoreErrorType";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandError  (TypeDefIndex 988, public class) ----
export class CommandError extends CommandBase {
    /** 0x18 private BattleCoreErrorType <ErrorType>k__BackingField */
    _ErrorType: BattleCoreErrorType = 0 as BattleCoreErrorType;
    get ErrorType(): BattleCoreErrorType { return this.get_ErrorType(); }
    set ErrorType(v: BattleCoreErrorType) { this.set_ErrorType(v); }
    /** @rva 0x17FB050 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 27 as CommandType; /* asm: mov eax, 0x1b; ret */ }
    /** @rva 0x763820  public BattleCoreErrorType get_ErrorType() { } */
    get_ErrorType(): BattleCoreErrorType { return this._ErrorType; /* auto-property */ }
    /** @rva 0x8A2240  public void set_ErrorType(BattleCoreErrorType value) { } */
    set_ErrorType(value: BattleCoreErrorType): void { this._ErrorType = value; /* auto-property */ }
    /** @rva 0x14ADFA0  public void .ctor(BattleCoreErrorType errorType) { } */
    ctor$BattleCoreErrorType(errorType: BattleCoreErrorType): this {
        this._ErrorType = errorType;
        return this;
    }
}
