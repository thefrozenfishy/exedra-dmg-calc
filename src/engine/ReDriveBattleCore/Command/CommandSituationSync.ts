// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { GameSituationData } from "../GameSituationData";

// ---- ReDriveBattleCore.Command.CommandSituationSync  (TypeDefIndex 1011, public sealed class) ----
export class CommandSituationSync extends CommandBase {
    /** 0x18 private GameSituationData <GameSituationData>k__BackingField */
    _GameSituationData: GameSituationData = null!;
    /** 0x20 private float <ElapsedTime>k__BackingField */
    _ElapsedTime: float = 0;
    get GameSituationData(): GameSituationData { return this.get_GameSituationData(); }
    set GameSituationData(v: GameSituationData) { this.set_GameSituationData(v); }
    get ElapsedTime(): float { return this.get_ElapsedTime(); }
    set ElapsedTime(v: float) { this.set_ElapsedTime(v); }
    /** @rva 0x1056B90 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 5 as CommandType; /* asm: mov eax, 5; ret */ }
    /** @rva 0x732E90  public GameSituationData get_GameSituationData() { } */
    get_GameSituationData(): GameSituationData { return this._GameSituationData; /* auto-property */ }
    /** @rva 0x735AB0  public void set_GameSituationData(GameSituationData value) { } */
    set_GameSituationData(value: GameSituationData): void { this._GameSituationData = value; /* auto-property */ }
    /** @rva 0x96C430  public float get_ElapsedTime() { } */
    get_ElapsedTime(): float { return this._ElapsedTime; /* auto-property */ }
    /** @rva 0x96C4A0  public void set_ElapsedTime(float value) { } */
    set_ElapsedTime(value: float): void { this._ElapsedTime = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1811BA0  public void .ctor(GameSituationData gameSituationData, float elapsedTime) { } */
    ctor$GameSituationData_float(gameSituationData: GameSituationData, elapsedTime: float): this {
        this._GameSituationData = gameSituationData;
        this._ElapsedTime = elapsedTime;
        return this;
    }
}
