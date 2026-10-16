// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";

// ---- ReDriveBattleCore.UnitState.IAdditionalDamage  (TypeDefIndex 733, public interface) ----
export interface IAdditionalDamage {
    /** @rva -1 slot 0  public abstract AffectedUnitNoticeBundle GetAdditionalDamageResult(BattleUnit attackUnit, ActiveSkillBase attackSkill, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector); */
    GetAdditionalDamageResult(attackUnit: BattleUnit, attackSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle;
}
