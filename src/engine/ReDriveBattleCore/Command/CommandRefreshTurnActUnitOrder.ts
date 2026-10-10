// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { TurnActOrderUnitInfo } from "../TurnActOrderUnitInfo";

// ---- ReDriveBattleCore.Command.CommandRefreshTurnActUnitOrder  (TypeDefIndex 1008, public class) ----
export class CommandRefreshTurnActUnitOrder extends CommandBase {
    /** 0x18 private TurnActOrderUnitInfo <TurnActOrderUnitInfo>k__BackingField */
    _TurnActOrderUnitInfo: TurnActOrderUnitInfo = null!;
    /** 0x20 private CommandRefreshTurnActUnitOrder.RefreshReasonType <ReasonType>k__BackingField */
    _ReasonType: CommandRefreshTurnActUnitOrder_RefreshReasonType = 0 as CommandRefreshTurnActUnitOrder_RefreshReasonType;
    /** 0x24 private int <ReasonUnitId>k__BackingField */
    _ReasonUnitId: int = 0;
    get TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this.get_TurnActOrderUnitInfo(); }
    set TurnActOrderUnitInfo(v: TurnActOrderUnitInfo) { this.set_TurnActOrderUnitInfo(v); }
    get ReasonType(): CommandRefreshTurnActUnitOrder_RefreshReasonType { return this.get_ReasonType(); }
    set ReasonType(v: CommandRefreshTurnActUnitOrder_RefreshReasonType) { this.set_ReasonType(v); }
    get ReasonUnitId(): int { return this.get_ReasonUnitId(); }
    set ReasonUnitId(v: int) { this.set_ReasonUnitId(v); }
    /** @rva 0x17EA8C0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 18 as CommandType; /* asm: mov eax, 0x12; ret */ }
    /** @rva 0x733E90  public TurnActOrderUnitInfo get_TurnActOrderUnitInfo() { } */
    get_TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this._TurnActOrderUnitInfo; /* auto-property */ }
    /** @rva 0x736AB0  public void set_TurnActOrderUnitInfo(TurnActOrderUnitInfo value) { } */
    set_TurnActOrderUnitInfo(value: TurnActOrderUnitInfo): void { this._TurnActOrderUnitInfo = value; /* auto-property */ }
    /** @rva 0x75ED70  public CommandRefreshTurnActUnitOrder.RefreshReasonType get_ReasonType() { } */
    get_ReasonType(): CommandRefreshTurnActUnitOrder_RefreshReasonType { return this._ReasonType; /* auto-property */ }
    /** @rva 0x8A2230  public void set_ReasonType(CommandRefreshTurnActUnitOrder.RefreshReasonType value) { } */
    set_ReasonType(value: CommandRefreshTurnActUnitOrder_RefreshReasonType): void { this._ReasonType = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_ReasonUnitId() { } */
    get_ReasonUnitId(): int { return this._ReasonUnitId; /* auto-property */ }
    /** @rva 0x75A840  public void set_ReasonUnitId(int value) { } */
    set_ReasonUnitId(value: int): void { this._ReasonUnitId = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EA8D0  public void .ctor(TurnActOrderUnitInfo info, CommandRefreshTurnActUnitOrder.RefreshReasonType reasonType = 0, int reasonUnitId = 0) { } */
    ctor$TurnActOrderUnitInfo_RefreshReasonType_int(info: TurnActOrderUnitInfo, reasonType?: CommandRefreshTurnActUnitOrder_RefreshReasonType /* = 0 */, reasonUnitId?: int /* = 0 */): this {
        this._TurnActOrderUnitInfo = info;
        this._ReasonType = (reasonType ?? 0);
        this._ReasonUnitId = (reasonUnitId ?? 0);
        return this;
    }
}

// ---- ReDriveBattleCore.Command.CommandRefreshTurnActUnitOrder.RefreshReasonType  (TypeDefIndex 1007, public enum) ----
export const CommandRefreshTurnActUnitOrder_RefreshReasonType = {
    None: 0,
    RegisterSpecialAttack: 1,
    RegisterStartTimingAct: 2,
    DebugTurnGaugeEdit: 3,
} as const;
export type CommandRefreshTurnActUnitOrder_RefreshReasonType = (typeof CommandRefreshTurnActUnitOrder_RefreshReasonType)[keyof typeof CommandRefreshTurnActUnitOrder_RefreshReasonType];
