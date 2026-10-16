// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../runtime";
import type { SkillType } from "../Network/Definition/Battle/SkillType";

// ---- ReDriveBattleCore.IActiveSkillInfo  (TypeDefIndex 277, public interface) ----
export interface IActiveSkillInfo {
    /** @rva -1 slot 0  public abstract void SetActiveSkillInfo(SkillType skillType, int skillMstId); */
    SetActiveSkillInfo(skillType: SkillType, skillMstId: int): void;
}
