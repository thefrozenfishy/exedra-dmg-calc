// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { List } from "../../runtime";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";

// ---- ReDriveBattleCore.UnitState.IConsumeRemainCountOnAttack  (TypeDefIndex 736, public interface) ----
export interface IConsumeRemainCountOnAttack extends IConsumeRemainCount {
    /** @rva 0x76F830 slot 0  public virtual bool ShouldConsume(ActiveSkillBase attackSkill, List<AffectedUnitNotice> noticeList) { } */
    ShouldConsume(attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean;
}

/** Interface dispatch of IConsumeRemainCountOnAttack.ShouldConsume (slot 0): the class's override when it has one,
 * else the C# default interface method (@rva 0x76F830: `return true;`). */
export function IConsumeRemainCountOnAttack$ShouldConsume(self: IConsumeRemainCountOnAttack, attackSkill: ActiveSkillBase, noticeList: List<AffectedUnitNotice>): boolean {
    const o = self as unknown as { ShouldConsume?: (a: ActiveSkillBase, n: List<AffectedUnitNotice>) => boolean };
    if (typeof o.ShouldConsume === "function") return o.ShouldConsume(attackSkill, noticeList);
    return true;
}
