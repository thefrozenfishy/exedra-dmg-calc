// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";
import { UpWeakElementDmgRatioUnitState } from "./UpWeakElementDmgRatioUnitState";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpWeakElementDmgConsumeRatioUnitState  (TypeDefIndex 817, public class) ----
export class UpWeakElementDmgConsumeRatioUnitState extends UpWeakElementDmgRatioUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x16FC060 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_consume_up_weak_element_dmg_ratio";
    }
    /** @rva 0x16F6470 slot 28  public override float get_UpRatio() { } */
    get_UpRatio(): float {
        if (this._RemainCount > 0) return f32(this._UpdateableEffectValue / 10);
        return 0;
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x16FBDA0 slot 29  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean {
        return noticeList.flatMap(notice => [...notice.Damages, ...notice.BarrierDamages]) // <>c.b__6_0 (Damages.Concat(BarrierDamages))
            .filter(damage => damage._Category === 1 || damage._Category === 2) // b__6_1
            .some(damage => damage._CorrelationDamageType === 2); // b__6_2
    }
}
