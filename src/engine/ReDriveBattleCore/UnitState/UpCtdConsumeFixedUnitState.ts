// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { List, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleUnit } from "../BattleUnit";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";
import { UpCtdFixedUnitState } from "./UpCtdFixedUnitState";

// ---- ReDriveBattleCore.UnitState.UpCtdConsumeFixedUnitState  (TypeDefIndex 765, public class) ----
export class UpCtdConsumeFixedUnitState extends UpCtdFixedUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x170C9B0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_consume_up_ctd";
    }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15E14E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x170C7A0 slot 30  public override float GetCtdVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtdVariationValue(unit: BattleUnit, processingValue: float): float {
        if (0 < this._RemainCount) return f32(this._UpdateableEffectValue / 10);
        return 0;
    }
    /** @rva 0x170C7C0 slot 31  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean {
        return noticeList.flatMap(notice => [...notice.Damages, ...notice.BarrierDamages]) // <>c.b__5_0 (Damages.Concat(BarrierDamages))
            .some(damage => damage._IsCritical); // b__5_1
    }
}
