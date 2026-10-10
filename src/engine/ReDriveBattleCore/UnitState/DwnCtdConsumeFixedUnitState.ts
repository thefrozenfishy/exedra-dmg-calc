// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
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
    /** @rva 0x15BC970 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DwnCtdConsumeFixedUnitState.get_IconName", 0x15BC970); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnCtdConsumeFixedUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnCtdConsumeFixedUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BC750 slot 30  public override float GetCtdVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtdVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("DwnCtdConsumeFixedUnitState.GetCtdVariationValue", 0x15BC750); }
    /** @rva 0x15BC780 slot 31  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean { return notPorted("DwnCtdConsumeFixedUnitState.ShouldConsume", 0x15BC780); }
}
