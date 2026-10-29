// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IBuff } from "./IBuff";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";
import { QuestEnemyAppearanceParameter } from "../QuestEnemyAppearanceParameter";
import { CorrelationEffect } from "../CorrelationEffect";
import { CharacterParameter } from "../CharacterParameter";

// ---- ReDriveBattleCore.UnitState.UpWeakElementDmgRatioUnitState  (TypeDefIndex 814, public class) ----
export class UpWeakElementDmgRatioUnitState extends ParameterVariationUnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16FC6A0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_weak_element_dmg_ratio";
    }
    /** @rva 0x16FC670 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x15CBE70 slot 28  public virtual float get_UpRatio() { } */
    get_UpRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x16FC090 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__12_0
        if (list.length > 0) {
            if (userUnit._Team !== 0) return [];
            const enemyParams: QuestEnemyAppearanceParameter[] = []; // <>c__DisplayClass12_0
            for (const enemy of gameDirector.get_EnemyUnitList()) {
                const p = enemy.get_Param();
                if (p instanceof QuestEnemyAppearanceParameter) enemyParams.push(p);
            }
            list = list.filter(unit => { // DisplayClass12_0.b__1
                const charParam = unit.get_Param() instanceof CharacterParameter ? unit.get_Param() as CharacterParameter : null; // DisplayClass12_1
                if (charParam == null) return false;
                return enemyParams.some(enemyParam => CorrelationEffect.IsMatchWeakElement(charParam._Element as any, enemyParam._WeakElements)); // b__2
            });
        }
        return list;
    }
    /** @rva 0x16FC4A0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
