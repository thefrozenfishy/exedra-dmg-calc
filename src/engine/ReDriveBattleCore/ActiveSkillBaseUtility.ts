// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { SkillMstRecord } from "../Network/Definition/Skill/SkillMstRecord";
import { SkillMstModel } from "./Model/SkillMstModel";
import { SkillDetailMstReader } from "./Reader/SkillDetailMstReader";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { AdditionalSkill } from "./AdditionalSkill";
import { NormalAttack } from "./NormalAttack";
import { ActiveSkill } from "./ActiveSkill";
import { isImpl, notPorted } from "../runtime";
import type { Dictionary, Nullable, Type, int } from "../runtime";
import type { SkillType } from "../Network/Definition/Battle/SkillType";

import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.ActiveSkillBaseUtility  (TypeDefIndex 296, public static class) ----
export class ActiveSkillBaseUtility {
    /** @rva 0x1374E50  public static Nullable<SkillType> GetSkillTypeForSwitchSkill(Type type) { } */
    static GetSkillTypeForSwitchSkill(type_: Type): Nullable<SkillType> {
        if (type_ === ActiveSkill) return 1 as SkillType;
        if (type_ === NormalAttack) return 3 as SkillType;
        return null;
    }
    /** @rva 0x1374C90  public static AdditionalSkill GetAdditionalSkill(int skillMstId) { } */
    static GetAdditionalSkill(skillMstId: int): AdditionalSkill {
        const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(skillMstId);
        if (skillMst == null) return null!;
        void skillMst.Type; // read and discarded in 3.19.0
        const details = SkillDetailMstReader.GetDetailModelsByMstId(skillMstId);
        const skill = new AdditionalSkill().ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, details);
        skill.skillType = skillMst.Type;
        return skill;
    }
    /** @rva 0x1374BB0  public static ActiveSkill GetActiveSkill(int skillMstId) { } */
    static GetActiveSkill(skillMstId: int): ActiveSkill {
        const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(skillMstId);
        if (skillMst == null || skillMst.Type !== 1) return null!;
        return new ActiveSkill().ctor$SkillMstModel_ListSkillDetailMstModel_int_int(skillMst, SkillDetailMstReader.GetDetailModelsByMstId(skillMstId), 0); // ctor inlined (weight 0)
    }
    /** @rva 0x1374D70  public static NormalAttack GetNormalAttack(int skillMstId) { } */
    static GetNormalAttack(skillMstId: int): NormalAttack {
        const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(skillMstId);
        if (skillMst == null || skillMst.Type !== 3) return null!;
        return new NormalAttack().ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, SkillDetailMstReader.GetDetailModelsByMstId(skillMstId));
    }
    /** @rva -1  public static ActiveSkillBase GetSwitchableSkill<T>(int skillUniqueId, int level) { } */
    static GetSwitchableSkill<T>(T$: Type, skillUniqueId: int, level: int): ActiveSkillBase {
        // shared instance 0x2746820
        const skillType = ActiveSkillBaseUtility.GetSkillTypeForSwitchSkill(T$);
        const mst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel)
            .GetModel(m => m.skillUniqueId === skillUniqueId && m.level === level); // DisplayClass4_0<T>.<GetSwitchableSkill>b__0
        if (mst == null) return null!;
        if (!(skillType != null && mst.Type === skillType)) return null!;
        const details = SkillDetailMstReader.GetDetailModelsByMstId(mst.SkillMstId);
        if (skillType === 1) return new ActiveSkill().ctor$SkillMstModel_ListSkillDetailMstModel_int_int(mst, details, 0, 0);
        if (skillType === 3) return new NormalAttack().ctor$SkillMstModel_ListSkillDetailMstModel(mst, details);
        return null!;
    }
    /** @rva 0x1374F50  public static void RemoveByUserUnitDeath(BattleUnit userUnit, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static RemoveByUserUnitDeath(userUnit: BattleUnit, battleUnitDic: Dictionary<int, BattleUnit>): void {
        const predicate = (state: UnitStateBase) => isImpl(state, "IRemoveByUserUnitDeath") && state.UserUnitId === userUnit.Id; // DisplayClass5_0 b__0 (cached)
        for (const unit of battleUnitDic.values()) unit.Condition.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, predicate);
    }
}
