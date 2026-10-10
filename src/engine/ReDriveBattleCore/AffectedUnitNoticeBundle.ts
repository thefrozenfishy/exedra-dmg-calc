// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, IEnumerable, List, int } from "../runtime";
import type { AffectedUnitNotice, AffectedUnitNotice_DamageInfo } from "./AffectedUnitNotice";
import type { GainSoloRaidBuffPointNotice } from "./GainSoloRaidBuffPointNotice";

// ---- ReDriveBattleCore.AffectedUnitNoticeBundle  (TypeDefIndex 315, public class) ----
export class AffectedUnitNoticeBundle {
    /** 0x10 private Dictionary<int, AffectedUnitNotice> noticeDic */
    noticeDic: Dictionary<int, AffectedUnitNotice> = null!;
    /** 0x18 private List<GainSoloRaidBuffPointNotice> <GainSoloRaidBuffPointNoticeList>k__BackingField */
    _GainSoloRaidBuffPointNoticeList: List<GainSoloRaidBuffPointNotice> = null!;
    get GainSoloRaidBuffPointNoticeList(): List<GainSoloRaidBuffPointNotice> { return this.get_GainSoloRaidBuffPointNoticeList(); }
    set GainSoloRaidBuffPointNoticeList(v: List<GainSoloRaidBuffPointNotice>) { this.set_GainSoloRaidBuffPointNoticeList(v); }
    /** @rva 0x733E90  public List<GainSoloRaidBuffPointNotice> get_GainSoloRaidBuffPointNoticeList() { } */
    get_GainSoloRaidBuffPointNoticeList(): List<GainSoloRaidBuffPointNotice> { return this._GainSoloRaidBuffPointNoticeList; /* auto-property */ }
    /** @rva 0x736AB0  public void set_GainSoloRaidBuffPointNoticeList(List<GainSoloRaidBuffPointNotice> value) { } */
    set_GainSoloRaidBuffPointNoticeList(value: List<GainSoloRaidBuffPointNotice>): void { this._GainSoloRaidBuffPointNoticeList = value; /* auto-property */ }
    /** @rva 0x1377A70  public void Add(AffectedUnitNotice notice) { } */
    Add(notice: AffectedUnitNotice): void { return notPorted("AffectedUnitNoticeBundle.Add", 0x1377A70); }
    /** @rva 0x1377CB0  public List<AffectedUnitNotice> GetNoticeList() { } */
    GetNoticeList(): List<AffectedUnitNotice> { return notPorted("AffectedUnitNoticeBundle.GetNoticeList", 0x1377CB0); }
    /** @rva 0x1377B60  public IEnumerable<AffectedUnitNotice.DamageInfo> GetAllDisplayDamageInfo() { } */
    GetAllDisplayDamageInfo(): IEnumerable<AffectedUnitNotice_DamageInfo> { return notPorted("AffectedUnitNoticeBundle.GetAllDisplayDamageInfo", 0x1377B60); }
    /** @rva 0x1377DD0  public static AffectedUnitNoticeBundle op_Addition(AffectedUnitNoticeBundle bundle1, AffectedUnitNoticeBundle bundle2) { } */
    static op_Addition(bundle1: AffectedUnitNoticeBundle, bundle2: AffectedUnitNoticeBundle): AffectedUnitNoticeBundle { return notPorted("AffectedUnitNoticeBundle.op_Addition", 0x1377DD0); }
    /** @rva 0x1377D10  public void .ctor() { } */
    ctor(): this { return notPorted("AffectedUnitNoticeBundle..ctor", 0x1377D10); }
}
