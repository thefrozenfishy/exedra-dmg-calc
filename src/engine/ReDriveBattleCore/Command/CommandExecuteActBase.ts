// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import { CommandBase } from "./CommandBase";
import type { GainSoloRaidBuffPointNotice } from "../GainSoloRaidBuffPointNotice";
import type { TurnActOrderUnitInfo } from "../TurnActOrderUnitInfo";

// ---- ReDriveBattleCore.Command.CommandExecuteActBase  (TypeDefIndex 989, public abstract class) ----
export abstract class CommandExecuteActBase extends CommandBase {
    /** 0x18 private int <ActUnitId>k__BackingField */
    _ActUnitId: int = 0;
    /** 0x20 private List<AffectedUnitNotice> <AffectedUnitNoticeList>k__BackingField */
    _AffectedUnitNoticeList: List<AffectedUnitNotice> = null!;
    /** 0x28 private List<GainSoloRaidBuffPointNotice> <GainSoloRaidBuffPointNoticeList>k__BackingField */
    _GainSoloRaidBuffPointNoticeList: List<GainSoloRaidBuffPointNotice> = null!;
    /** 0x30 private TurnActOrderUnitInfo <TurnActOrderUnitInfo>k__BackingField */
    _TurnActOrderUnitInfo: TurnActOrderUnitInfo = null!;
    get ActUnitId(): int { return this.get_ActUnitId(); }
    set ActUnitId(v: int) { this.set_ActUnitId(v); }
    get AffectedUnitNoticeList(): List<AffectedUnitNotice> { return this.get_AffectedUnitNoticeList(); }
    set AffectedUnitNoticeList(v: List<AffectedUnitNotice>) { this.set_AffectedUnitNoticeList(v); }
    get GainSoloRaidBuffPointNoticeList(): List<GainSoloRaidBuffPointNotice> { return this.get_GainSoloRaidBuffPointNoticeList(); }
    set GainSoloRaidBuffPointNoticeList(v: List<GainSoloRaidBuffPointNotice>) { this.set_GainSoloRaidBuffPointNoticeList(v); }
    get TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this.get_TurnActOrderUnitInfo(); }
    set TurnActOrderUnitInfo(v: TurnActOrderUnitInfo) { this.set_TurnActOrderUnitInfo(v); }
    /** @rva 0x763820  public int get_ActUnitId() { } */
    get_ActUnitId(): int { return this._ActUnitId; /* auto-property */ }
    /** @rva 0x8A2240  public void set_ActUnitId(int value) { } */
    set_ActUnitId(value: int): void { this._ActUnitId = value; /* auto-property */ }
    /** @rva 0x7369E0  public List<AffectedUnitNotice> get_AffectedUnitNoticeList() { } */
    get_AffectedUnitNoticeList(): List<AffectedUnitNotice> { return this._AffectedUnitNoticeList; /* auto-property */ }
    /** @rva 0x736A50  public void set_AffectedUnitNoticeList(List<AffectedUnitNotice> value) { } */
    set_AffectedUnitNoticeList(value: List<AffectedUnitNotice>): void { this._AffectedUnitNoticeList = value; /* auto-property */ }
    /** @rva 0x736EA0  public List<GainSoloRaidBuffPointNotice> get_GainSoloRaidBuffPointNoticeList() { } */
    get_GainSoloRaidBuffPointNoticeList(): List<GainSoloRaidBuffPointNotice> { return this._GainSoloRaidBuffPointNoticeList; /* auto-property */ }
    /** @rva 0x736F10  public void set_GainSoloRaidBuffPointNoticeList(List<GainSoloRaidBuffPointNotice> value) { } */
    set_GainSoloRaidBuffPointNoticeList(value: List<GainSoloRaidBuffPointNotice>): void { this._GainSoloRaidBuffPointNoticeList = value; /* auto-property */ }
    /** @rva 0x736F00  public TurnActOrderUnitInfo get_TurnActOrderUnitInfo() { } */
    get_TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this._TurnActOrderUnitInfo; /* auto-property */ }
    /** @rva 0x736F30  public void set_TurnActOrderUnitInfo(TurnActOrderUnitInfo value) { } */
    set_TurnActOrderUnitInfo(value: TurnActOrderUnitInfo): void { this._TurnActOrderUnitInfo = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
