// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { GveChainData } from "./GveChainData";
import type { GveHistoryData } from "./GveHistoryData";

// ---- ReDriveBattleCore.Command.CommandGveSyncHpDirection  (TypeDefIndex 995, public sealed class) ----
export class CommandGveSyncHpDirection extends CommandBase {
    /** 0x18 private readonly GveHistoryData[] <HistoryDataArray>k__BackingField */
    _HistoryDataArray: GveHistoryData[] = null!;
    /** 0x20 private readonly GveChainData[] <ChainDataArray>k__BackingField */
    _ChainDataArray: GveChainData[] = null!;
    get HistoryDataArray(): GveHistoryData[] { return this.get_HistoryDataArray(); }
    get ChainDataArray(): GveChainData[] { return this.get_ChainDataArray(); }
    /** @rva 0xD8FF70 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 15 as CommandType; /* asm: mov eax, 0xf; ret */ }
    /** @rva 0x732E90  public GveHistoryData[] get_HistoryDataArray() { } */
    get_HistoryDataArray(): GveHistoryData[] { return this._HistoryDataArray; /* auto-property */ }
    /** @rva 0x7359E0  public GveChainData[] get_ChainDataArray() { } */
    get_ChainDataArray(): GveChainData[] { return this._ChainDataArray; /* auto-property */ }
    /** @rva 0xABC2E0  public void .ctor(GveHistoryData[] historyDataArray, GveChainData[] chainDataArray) { } */
    ctor$GveHistoryData_GveChainData(historyDataArray: GveHistoryData[], chainDataArray: GveChainData[]): this {
        this._HistoryDataArray = historyDataArray;
        this._ChainDataArray = chainDataArray;
        return this;
    }
}
