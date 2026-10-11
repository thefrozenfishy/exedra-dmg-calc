// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AffectedUnitNotice } from "./AffectedUnitNotice";
import { notPorted } from "../runtime";
import type { Dictionary, IEnumerable, List, int } from "../runtime";
import type { AffectedUnitNotice_DamageInfo } from "./AffectedUnitNotice";
import type { GainSoloRaidBuffPointNotice } from "./GainSoloRaidBuffPointNotice";
import { dictGet } from "../runtime";

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
    Add(notice: AffectedUnitNotice): void {
        if (notice == null) return;
        if (this.noticeDic.has(notice._AffectedUnitId)) {
            const id = notice._AffectedUnitId;
            notice = AffectedUnitNotice.op_Addition(dictGet(this.noticeDic, id), notice);
            this.noticeDic.set(id, notice);
            return;
        }
        this.noticeDic.set(notice._AffectedUnitId, notice);
    }
    /** @rva 0x1377CB0  public List<AffectedUnitNotice> GetNoticeList() { } */
    GetNoticeList(): List<AffectedUnitNotice> {
        return [...this.noticeDic.values()];
    }
    /** @rva 0x1377B60  public IEnumerable<AffectedUnitNotice.DamageInfo> GetAllDisplayDamageInfo() { } */
    GetAllDisplayDamageInfo(): IEnumerable<AffectedUnitNotice_DamageInfo> {
        return [...this.noticeDic.values()].flatMap(x => x.GetDisplayDamageInfoList()); // SelectMany(<>c.b__7_0)
    }
    /** @rva 0x1377DD0  public static AffectedUnitNoticeBundle op_Addition(AffectedUnitNoticeBundle bundle1, AffectedUnitNoticeBundle bundle2) { } */
    static op_Addition(bundle1: AffectedUnitNoticeBundle, bundle2: AffectedUnitNoticeBundle): AffectedUnitNoticeBundle {
        const maxSequence = Math.max(...bundle1.GetAllDisplayDamageInfo().map(x => x._Sequence) /* <>c.b__8_0 */, 0); // .Append(0).Max()
        const minSequence = Math.min(...bundle2.GetAllDisplayDamageInfo().map(x => x._Sequence) /* <>c.b__8_1 */, 0); // .Append(0).Min()
        if (maxSequence - minSequence !== 0) {
            for (const notice of [...bundle2.noticeDic.values()]) {
                for (const damageInfo of notice.GetDisplayDamageInfoList()) {
                    damageInfo._Sequence = damageInfo._Sequence + (maxSequence - minSequence);
                }
            }
        }
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const notice of [...bundle1.noticeDic.values()]) bundle.Add(notice);
        for (const notice of [...bundle2.noticeDic.values()]) bundle.Add(notice);
        bundle._GainSoloRaidBuffPointNoticeList.push(...bundle1._GainSoloRaidBuffPointNoticeList);
        bundle._GainSoloRaidBuffPointNoticeList.push(...bundle2._GainSoloRaidBuffPointNoticeList);
        return bundle;
    }
    /** @rva 0x1377D10  public void .ctor() { } */
    ctor(): this {
        this.noticeDic = new Map();
        this._GainSoloRaidBuffPointNoticeList = [];
        return this;
    }
}
