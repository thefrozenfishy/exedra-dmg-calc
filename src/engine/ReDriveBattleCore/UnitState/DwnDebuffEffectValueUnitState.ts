// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import  { StateAbilityEffect } from "../AbilityEffect/StateAbilityEffect";
import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { DownEffectValueUnitStateBase } from "./DownEffectValueUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DwnDebuffEffectValueUnitState  (TypeDefIndex 633, public class) ----
export class DwnDebuffEffectValueUnitState extends DownEffectValueUnitStateBase {
    /** @rva 0x16D02D0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x16D02C0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x16D0510 slot 27  public override float GetEffectValueVariationRate(UnitStateBase targetState) { } */
    GetEffectValueVariationRate(targetState: UnitStateBase): float {
        if (targetState.get_Direction() === 1) return -f32(this._DownRatio / 100);
        return 0;
    }
    /** @rva 0x16D02E0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__3_0
        if (list.length > 0) list = list.filter(unit => unit._SkillSet.GetList().some(skill => skill.GetAbilityEffectList().some(effect => effect instanceof StateAbilityEffect && effect._GiveUnitState.get_Direction() === 1)) /* b__3_2, b__3_3 */); // b__3_1
        return list;
    }
    /** @rva 0x16D0570 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByBreak);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
