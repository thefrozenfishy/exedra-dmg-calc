// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import type { IConsumeRemainCountOnAttack } from "./IConsumeRemainCountOnAttack";
import { UpWeakElementDmgRatioUnitState } from "./UpWeakElementDmgRatioUnitState";

// ---- ReDriveBattleCore.UnitState.UpWeakElementDmgConsumeRatioUnitState  (TypeDefIndex 817, public class) ----
export class UpWeakElementDmgConsumeRatioUnitState extends UpWeakElementDmgRatioUnitState {  // implements IConsumeRemainCountOnAttack, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IConsumeRemainCountOnAttack', 'IConsumeRemainCount'];
    /** @rva 0x16E78C0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpWeakElementDmgConsumeRatioUnitState.get_IconName", 0x16E78C0); }
    /** @rva 0x16E1D00 slot 28  public override float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("UpWeakElementDmgConsumeRatioUnitState.get_UpRatio", 0x16E1D00); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpWeakElementDmgConsumeRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpWeakElementDmgConsumeRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E7600 slot 29  public bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean { return notPorted("UpWeakElementDmgConsumeRatioUnitState.ShouldConsume", 0x16E7600); }
}
