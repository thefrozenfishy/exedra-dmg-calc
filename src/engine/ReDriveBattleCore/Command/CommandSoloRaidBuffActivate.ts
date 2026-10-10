// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, float, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { SoloRaidBuffReferee } from "../SoloRaidBuffReferee";

// ---- ReDriveBattleCore.Command.CommandSoloRaidBuffActivate  (TypeDefIndex 1016, public sealed class) ----
export class CommandSoloRaidBuffActivate extends CommandBase {
    /** 0x18 private readonly bool <IsSeasonBuffActive>k__BackingField */
    _IsSeasonBuffActive: boolean = false;
    /** 0x1C private readonly int <CurrentSeasonBuffPoint>k__BackingField */
    _CurrentSeasonBuffPoint: int = 0;
    /** 0x20 private readonly int <MaxSeasonBuffPoint>k__BackingField */
    _MaxSeasonBuffPoint: int = 0;
    /** 0x24 private readonly int <ActiveMaxSeasonBuffPoint>k__BackingField */
    _ActiveMaxSeasonBuffPoint: int = 0;
    /** 0x28 private readonly float <ActiveCurrentSeasonBuffTurnGaugeValue>k__BackingField */
    _ActiveCurrentSeasonBuffTurnGaugeValue: float = 0;
    /** 0x2C private readonly int <ActiveMaxSeasonBuffTurnGaugeValue>k__BackingField */
    _ActiveMaxSeasonBuffTurnGaugeValue: int = 0;
    /** 0x30 private readonly int <ResultSp>k__BackingField */
    _ResultSp: int = 0;
    /** 0x38 private readonly List<AffectedUnitNotice> <AffectedUnitNoticeList>k__BackingField */
    _AffectedUnitNoticeList: List<AffectedUnitNotice> = null!;
    get IsSeasonBuffActive(): boolean { return this.get_IsSeasonBuffActive(); }
    get CurrentSeasonBuffPoint(): int { return this.get_CurrentSeasonBuffPoint(); }
    get MaxSeasonBuffPoint(): int { return this.get_MaxSeasonBuffPoint(); }
    get ActiveMaxSeasonBuffPoint(): int { return this.get_ActiveMaxSeasonBuffPoint(); }
    get ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this.get_ActiveCurrentSeasonBuffTurnGaugeValue(); }
    get ActiveMaxSeasonBuffTurnGaugeValue(): int { return this.get_ActiveMaxSeasonBuffTurnGaugeValue(); }
    get ResultSp(): int { return this.get_ResultSp(); }
    get AffectedUnitNoticeList(): List<AffectedUnitNotice> { return this.get_AffectedUnitNoticeList(); }
    /** @rva 0x11C1560 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 30 as CommandType; /* asm: mov eax, 0x1e; ret */ }
    /** @rva 0x7F97F0  public bool get_IsSeasonBuffActive() { } */
    get_IsSeasonBuffActive(): boolean { return this._IsSeasonBuffActive; /* auto-property */ }
    /** @rva 0x7F9800  public int get_CurrentSeasonBuffPoint() { } */
    get_CurrentSeasonBuffPoint(): int { return this._CurrentSeasonBuffPoint; /* auto-property */ }
    /** @rva 0x75ED70  public int get_MaxSeasonBuffPoint() { } */
    get_MaxSeasonBuffPoint(): int { return this._MaxSeasonBuffPoint; /* auto-property */ }
    /** @rva 0x75A830  public int get_ActiveMaxSeasonBuffPoint() { } */
    get_ActiveMaxSeasonBuffPoint(): int { return this._ActiveMaxSeasonBuffPoint; /* auto-property */ }
    /** @rva 0x946D70  public float get_ActiveCurrentSeasonBuffTurnGaugeValue() { } */
    get_ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this._ActiveCurrentSeasonBuffTurnGaugeValue; /* auto-property */ }
    /** @rva 0x85E530  public int get_ActiveMaxSeasonBuffTurnGaugeValue() { } */
    get_ActiveMaxSeasonBuffTurnGaugeValue(): int { return this._ActiveMaxSeasonBuffTurnGaugeValue; /* auto-property */ }
    /** @rva 0x75ED60  public int get_ResultSp() { } */
    get_ResultSp(): int { return this._ResultSp; /* auto-property */ }
    /** @rva 0x736970  public List<AffectedUnitNotice> get_AffectedUnitNoticeList() { } */
    get_AffectedUnitNoticeList(): List<AffectedUnitNotice> { return this._AffectedUnitNoticeList; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EB690  public void .ctor(SoloRaidBuffReferee soloRaidBuffReferee, int resultSp, List<AffectedUnitNotice> noticeList) { } */
    ctor$SoloRaidBuffReferee_int_ListAffectedUnitNotice(soloRaidBuffReferee: SoloRaidBuffReferee, resultSp: int, noticeList: List<AffectedUnitNotice>): this {
        if (soloRaidBuffReferee == null) return this;
        this._IsSeasonBuffActive = soloRaidBuffReferee.isSeasonBuffActive;
        this._CurrentSeasonBuffPoint = soloRaidBuffReferee.currentSeasonBuffPoint;
        this._MaxSeasonBuffPoint = soloRaidBuffReferee.maxSeasonBuffPoint;
        this._ActiveMaxSeasonBuffPoint = soloRaidBuffReferee.activeMaxSeasonBuffPoint;
        this._ActiveCurrentSeasonBuffTurnGaugeValue = soloRaidBuffReferee.activeCurrentSeasonBuffTurnGaugeValue;
        this._ActiveMaxSeasonBuffTurnGaugeValue = soloRaidBuffReferee.activeMaxSeasonBuffTurnGaugeValue;
        this._ResultSp = resultSp;
        this._AffectedUnitNoticeList = noticeList;
        return this;
    }
}
