// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { BpCharger } from "./BpCharger";
import { EpCharger } from "./EpCharger";
import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";
import type { SkillMstModel } from "./Model/SkillMstModel";

// ---- ReDriveBattleCore.NormalAttack  (TypeDefIndex 289, public class) ----
export class NormalAttack extends ActiveSkillBase {
    /** @rva 0x72F5E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x139C9D0  public void .ctor(int skillMstId) { } */
    ctor$int(skillMstId: int): this { super.ctor$int(skillMstId); return this; }
    /** @rva 0x139C690  public void .ctor(int id, int uniqueId, int level, string name, int consumeSP) { } */
    ctor$int_int_int_string_int(id: int, uniqueId: int, level: int, name: string, consumeSP: int): this { super.ctor$int_int_int_string_int(id, uniqueId, level, name, consumeSP); return this; }
    /** @rva 0x13B2CF0  public void .ctor(SkillMstModel skillMst, List<SkillDetailMstModel> skillDetailMstList) { } */
    ctor$SkillMstModel_ListSkillDetailMstModel(skillMst: SkillMstModel, skillDetailMstList: List<SkillDetailMstModel>): this { super.ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, skillDetailMstList); return this; }
    /** @rva 0x13B2C10 slot 4  public override AffectedUnitNoticeBundle Execute(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId, bool isForcedAct = False) { } */
    Execute(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int, isForcedAct: boolean = false): AffectedUnitNoticeBundle {
        EpCharger.ChargeByNormalAttack(userUnit);
        BpCharger.ChargeByNormalAttack(userUnit);
        gameDirector.spReferee.AddSp(userUnit.Team, 1);
        return this.Triggering(gameDirector, attackTargetId, userUnit, selectFriendUnitId); // inlined
    }
}
