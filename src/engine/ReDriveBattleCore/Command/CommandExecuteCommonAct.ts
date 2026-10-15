// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import { CommandExecuteActBase } from "./CommandExecuteActBase";
import type { CommandType } from "./CommandType";
import type { ContinuousRecoveryInfo } from "./ContinuousRecoveryInfo";
import type { GainSoloRaidBuffPointNotice } from "../GainSoloRaidBuffPointNotice";

// ---- ReDriveBattleCore.Command.CommandExecuteCommonAct  (TypeDefIndex 990, public class) ----
export class CommandExecuteCommonAct extends CommandExecuteActBase {
    /** 0x38 private ContinuousRecoveryInfo <ContinuousRecoveryInfo>k__BackingField */
    _ContinuousRecoveryInfo: ContinuousRecoveryInfo = null!;
    get ContinuousRecoveryInfo(): ContinuousRecoveryInfo { return this.get_ContinuousRecoveryInfo(); }
    set ContinuousRecoveryInfo(v: ContinuousRecoveryInfo) { this.set_ContinuousRecoveryInfo(v); }
    /** @rva 0xAD2AC0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 16 as CommandType; /* asm: mov eax, 0x10; ret */ }
    /** @rva 0x735970  public ContinuousRecoveryInfo get_ContinuousRecoveryInfo() { } */
    get_ContinuousRecoveryInfo(): ContinuousRecoveryInfo { return this._ContinuousRecoveryInfo; /* auto-property */ }
    /** @rva 0x735A30  public void set_ContinuousRecoveryInfo(ContinuousRecoveryInfo value) { } */
    set_ContinuousRecoveryInfo(value: ContinuousRecoveryInfo): void { this._ContinuousRecoveryInfo = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1810430  public static CommandExecuteCommonAct CreateByTurnBegin(int id, List<AffectedUnitNotice> noticeList, ContinuousRecoveryInfo continuousRecoveryInfo, List<GainSoloRaidBuffPointNotice> gainSoloRaidBuffPointNoticeList) { } */
    static CreateByTurnBegin(id: int, noticeList: List<AffectedUnitNotice>, continuousRecoveryInfo: ContinuousRecoveryInfo, gainSoloRaidBuffPointNoticeList: List<GainSoloRaidBuffPointNotice>): CommandExecuteCommonAct {
        const command = new CommandExecuteCommonAct();
        command._ActUnitId = id;
        command._AffectedUnitNoticeList = noticeList;
        command._ContinuousRecoveryInfo = continuousRecoveryInfo;
        command._GainSoloRaidBuffPointNoticeList = gainSoloRaidBuffPointNoticeList;
        return command;
    }
    /** @rva 0x18104F0  public static CommandExecuteCommonAct CreateByTurnEnd(int id, List<AffectedUnitNotice> noticeList) { } */
    static CreateByTurnEnd(id: int, noticeList: List<AffectedUnitNotice>): CommandExecuteCommonAct {
        const command = new CommandExecuteCommonAct();
        command._ActUnitId = id;
        command._AffectedUnitNoticeList = noticeList;
        return command;
    }
    /** @rva 0x1810570  public static CommandExecuteCommonAct CreateNoAct(int id) { } */
    static CreateNoAct(id: int): CommandExecuteCommonAct {
        const command = new CommandExecuteCommonAct();
        command._ActUnitId = id;
        command._AffectedUnitNoticeList = [];
        return command;
    }
}
