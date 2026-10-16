// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { List, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleUnit } from "../BattleUnit";
import { DwnCtdFixedUnitState } from "./DwnCtdFixedUnitState";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";

// ---- ReDriveBattleCore.UnitState.DwnCtdConsumeFixedUnitState  (TypeDefIndex 591, public class) ----
export class DwnCtdConsumeFixedUnitState extends DwnCtdFixedUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x15E2260 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_consume_dwn_ctd";
    }
    /** @rva 0x15D9DA0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DB550  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15E2040 slot 30  public override float GetCtdVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtdVariationValue(unit: BattleUnit, processingValue: float): float {
        if (0 < this._RemainCount) return f32(f32(f32(this._UpdateableEffectValue / 10) * -processingValue) / 100);
        return 0;
    }
    /** @rva 0x15E2070 slot 31  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean {
        return noticeList.flatMap(notice => [...notice.Damages, ...notice.BarrierDamages]) // <>c.b__5_0 (Damages.Concat(BarrierDamages))
            .some(damage => damage._IsCritical); // b__5_1
    }
}
