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
import { UpCtrFixedUnitState } from "./UpCtrFixedUnitState";

// ---- ReDriveBattleCore.UnitState.UpCtrConsumeFixedUnitState  (TypeDefIndex 769, public class) ----
export class UpCtrConsumeFixedUnitState extends UpCtrFixedUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x16E22C0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpCtrConsumeFixedUnitState.get_IconName", 0x16E22C0); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpCtrConsumeFixedUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpCtrConsumeFixedUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E1D00 slot 30  public override float GetCtrVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtrVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("UpCtrConsumeFixedUnitState.GetCtrVariationValue", 0x16E1D00); }
    /** @rva 0x16E2250 slot 31  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean { return notPorted("UpCtrConsumeFixedUnitState.ShouldConsume", 0x16E2250); }
}
