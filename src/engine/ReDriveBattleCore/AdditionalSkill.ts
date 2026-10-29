// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { SkillType } from "../Network/Definition/Battle/SkillType";
import { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";
import type { SkillMstModel } from "./Model/SkillMstModel";

// ---- ReDriveBattleCore.AdditionalSkill  (TypeDefIndex 290, public class) ----
export class AdditionalSkill extends ActiveSkillBase {
    /** 0x38 private SkillType skillType */
    skillType: SkillType = 0 as SkillType;
    get SkillType(): SkillType { return this.get_SkillType(); }
    /** @rva 0x75EDA0  public SkillType get_SkillType() { } */
    get_SkillType(): SkillType { return this.skillType; /* asm: mov eax, dword ptr [rcx + 0x38]; ret */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1386ED0  public void .ctor(int skillMstId) { } */
    ctor$int(skillMstId: int): this { super.ctor$int(skillMstId); return this; }
    /** @rva 0x1386B90  public void .ctor(int id, int uniqueId, int level, string name, int consumeSP) { } */
    ctor$int_int_int_string_int(id: int, uniqueId: int, level: int, name: string, consumeSP: int): this { super.ctor$int_int_int_string_int(id, uniqueId, level, name, consumeSP); return this; }
    /** @rva 0x1388D60  public void .ctor(SkillMstModel skillMst, List<SkillDetailMstModel> skillDetailMstList) { } */
    ctor$SkillMstModel_ListSkillDetailMstModel(skillMst: SkillMstModel, skillDetailMstList: List<SkillDetailMstModel>): this { super.ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, skillDetailMstList); return this; }
    /** @rva 0x1388C90 slot 4  public override AffectedUnitNoticeBundle Execute(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId, bool isForcedAct = False) { } */
    Execute(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int, isForcedAct: boolean = false): AffectedUnitNoticeBundle {
        if (userUnit.Condition.CanNotUseSkill || userUnit.BreakPoint.IsBreak) {
            if (!isForcedAct) return null!;
        }
        if (gameDirector.spReferee.GetSp(userUnit.Team) < this.ConsumeSP) return null!;
        return this.Triggering(gameDirector, attackTargetId, userUnit, selectFriendUnitId);
    }
}
