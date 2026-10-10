// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
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
    /** @rva 0x16E1F10 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpCtdConsumeFixedUnitState.get_IconName", 0x16E1F10); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpCtdConsumeFixedUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpCtdConsumeFixedUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E1D00 slot 30  public override float GetCtdVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtdVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("UpCtdConsumeFixedUnitState.GetCtdVariationValue", 0x16E1D00); }
    /** @rva 0x16E1D20 slot 31  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean { return notPorted("UpCtdConsumeFixedUnitState.ShouldConsume", 0x16E1D20); }
}
