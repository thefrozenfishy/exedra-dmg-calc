// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandInitialize } from "./CommandInitialize";
import type { CommandType } from "./CommandType";
import type { GameSituationData } from "../GameSituationData";
import type { TurnActOrderUnitInfo } from "../TurnActOrderUnitInfo";

// ---- ReDriveBattleCore.Command.CommandReproduction  (TypeDefIndex 1009, public sealed class) ----
export class CommandReproduction extends CommandBase {
    /** 0x18 private GameSituationData <GameSituationData>k__BackingField */
    _GameSituationData: GameSituationData = null!;
    /** 0x20 private TurnActOrderUnitInfo <TurnActOrderUnitInfo>k__BackingField */
    _TurnActOrderUnitInfo: TurnActOrderUnitInfo = null!;
    /** 0x28 private CommandInitialize <CommandInitialize>k__BackingField */
    _CommandInitialize: CommandInitialize = null!;
    get GameSituationData(): GameSituationData { return this.get_GameSituationData(); }
    set GameSituationData(v: GameSituationData) { this.set_GameSituationData(v); }
    get TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this.get_TurnActOrderUnitInfo(); }
    set TurnActOrderUnitInfo(v: TurnActOrderUnitInfo) { this.set_TurnActOrderUnitInfo(v); }
    get CommandInitialize(): CommandInitialize { return this.get_CommandInitialize(); }
    set CommandInitialize(v: CommandInitialize) { this.set_CommandInitialize(v); }
    /** @rva 0xA408A0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 11 as CommandType; /* asm: mov eax, 0xb; ret */ }
    /** @rva 0x733E90  public GameSituationData get_GameSituationData() { } */
    get_GameSituationData(): GameSituationData { return this._GameSituationData; /* auto-property */ }
    /** @rva 0x736AB0  public void set_GameSituationData(GameSituationData value) { } */
    set_GameSituationData(value: GameSituationData): void { this._GameSituationData = value; /* auto-property */ }
    /** @rva 0x7369E0  public TurnActOrderUnitInfo get_TurnActOrderUnitInfo() { } */
    get_TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this._TurnActOrderUnitInfo; /* auto-property */ }
    /** @rva 0x736A50  public void set_TurnActOrderUnitInfo(TurnActOrderUnitInfo value) { } */
    set_TurnActOrderUnitInfo(value: TurnActOrderUnitInfo): void { this._TurnActOrderUnitInfo = value; /* auto-property */ }
    /** @rva 0x736EA0  public CommandInitialize get_CommandInitialize() { } */
    get_CommandInitialize(): CommandInitialize { return this._CommandInitialize; /* auto-property */ }
    /** @rva 0x736F10  public void set_CommandInitialize(CommandInitialize value) { } */
    set_CommandInitialize(value: CommandInitialize): void { this._CommandInitialize = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17FC750  public void .ctor(TurnActOrderUnitInfo turnActOrderUnitInfo, GameSituationData gameSituationData, CommandInitialize commandInitialize) { } */
    ctor$TurnActOrderUnitInfo_GameSituationData_CommandInitialize(turnActOrderUnitInfo: TurnActOrderUnitInfo, gameSituationData: GameSituationData, commandInitialize: CommandInitialize): this {
        this._GameSituationData = gameSituationData;
        this._TurnActOrderUnitInfo = turnActOrderUnitInfo;
        this._CommandInitialize = commandInitialize;
        return this;
    }
}
