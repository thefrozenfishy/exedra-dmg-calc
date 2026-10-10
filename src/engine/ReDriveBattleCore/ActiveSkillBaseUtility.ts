// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, Nullable, Type, int } from "../runtime";
import type { SkillType } from "../Network/Definition/Battle/SkillType";
import type { ActiveSkill } from "./ActiveSkill";
import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AdditionalSkill } from "./AdditionalSkill";
import type { BattleUnit } from "./BattleUnit";
import type { NormalAttack } from "./NormalAttack";

// ---- ReDriveBattleCore.ActiveSkillBaseUtility  (TypeDefIndex 296, public static class) ----
export class ActiveSkillBaseUtility {
    /** @rva 0x1374E50  public static Nullable<SkillType> GetSkillTypeForSwitchSkill(Type type) { } */
    static GetSkillTypeForSwitchSkill(type_: Type): Nullable<SkillType> { return notPorted("ActiveSkillBaseUtility.GetSkillTypeForSwitchSkill", 0x1374E50); }
    /** @rva 0x1374C90  public static AdditionalSkill GetAdditionalSkill(int skillMstId) { } */
    static GetAdditionalSkill(skillMstId: int): AdditionalSkill { return notPorted("ActiveSkillBaseUtility.GetAdditionalSkill", 0x1374C90); }
    /** @rva 0x1374BB0  public static ActiveSkill GetActiveSkill(int skillMstId) { } */
    static GetActiveSkill(skillMstId: int): ActiveSkill { return notPorted("ActiveSkillBaseUtility.GetActiveSkill", 0x1374BB0); }
    /** @rva 0x1374D70  public static NormalAttack GetNormalAttack(int skillMstId) { } */
    static GetNormalAttack(skillMstId: int): NormalAttack { return notPorted("ActiveSkillBaseUtility.GetNormalAttack", 0x1374D70); }
    /** @rva -1  public static ActiveSkillBase GetSwitchableSkill<T>(int skillUniqueId, int level) { } */
    static GetSwitchableSkill<T>(T$: abstract new (...args: any[]) => T, skillUniqueId: int, level: int): ActiveSkillBase { return notPorted("ActiveSkillBaseUtility.GetSwitchableSkill", 0); }
    /** @rva 0x1374F50  public static void RemoveByUserUnitDeath(BattleUnit userUnit, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static RemoveByUserUnitDeath(userUnit: BattleUnit, battleUnitDic: Dictionary<int, BattleUnit>): void { return notPorted("ActiveSkillBaseUtility.RemoveByUserUnitDeath", 0x1374F50); }
}
