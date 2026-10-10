// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";
import type { SkillMstModel } from "./Model/SkillMstModel";

// ---- ReDriveBattleCore.SpecialAttack  (TypeDefIndex 288, public class) ----
export class SpecialAttack extends ActiveSkillBase {
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1375BA0  public void .ctor(int skillMstId) { } */
    ctor$int(skillMstId: int): this { return notPorted("SpecialAttack..ctor", 0x1375BA0); }
    /** @rva 0x1375880  public void .ctor(int id, int uniqueId, int level, string name, int consumeSP) { } */
    ctor$int_int_int_string_int(id: int, uniqueId: int, level: int, name: string, consumeSP: int): this { return notPorted("SpecialAttack..ctor", 0x1375880); }
    /** @rva 0x138B640  public void .ctor(SkillMstModel skillMst, List<SkillDetailMstModel> skillDetailMstList) { } */
    ctor$SkillMstModel_ListSkillDetailMstModel(skillMst: SkillMstModel, skillDetailMstList: List<SkillDetailMstModel>): this { return notPorted("SpecialAttack..ctor", 0x138B640); }
    /** @rva 0x138C4F0 slot 4  public override AffectedUnitNoticeBundle Execute(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId, bool isForcedAct = False) { } */
    Execute(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int, isForcedAct?: boolean /* = False */): AffectedUnitNoticeBundle { return notPorted("SpecialAttack.Execute", 0x138C4F0); }
    /** @rva 0x138C6C0  public SpecialAttack.CompositionType GetComposition() { } */
    GetComposition(): SpecialAttack_CompositionType { return notPorted("SpecialAttack.GetComposition", 0x138C6C0); }
}

// ---- ReDriveBattleCore.SpecialAttack.CompositionType  (TypeDefIndex 286, public enum) ----
export const SpecialAttack_CompositionType = {
    None: 0,
    Damage: 1,
    RecoveryHp: 2,
    NonDamage: 3,
} as const;
export type SpecialAttack_CompositionType = (typeof SpecialAttack_CompositionType)[keyof typeof SpecialAttack_CompositionType];
