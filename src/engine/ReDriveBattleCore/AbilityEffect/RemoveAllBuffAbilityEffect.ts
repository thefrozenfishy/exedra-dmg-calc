// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { ParameterVariationUnitStateBase } from "../UnitState/ParameterVariationUnitStateBase";
import { UpDefenseUnitStateBase } from "../UnitState/UpDefenseUnitStateBase";
import { UpAttackUnitStateBase } from "../UnitState/UpAttackUnitStateBase";
import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { isImpl, notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { RemoveStateAbilityEffectBase } from "./RemoveStateAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { UnitStateBase } from "../UnitState/UnitStateBase";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.RemoveAllBuffAbilityEffect  (TypeDefIndex 1203, public class) ----
export class RemoveAllBuffAbilityEffect extends RemoveStateAbilityEffectBase {
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x191DBF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.maxRemoveCount = info._EffectValue1;
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva 0x191D0E0 slot 8  public override bool IsRemovable(UnitStateBase state) { } */
    IsRemovable(state: UnitStateBase): boolean {
        if (state._EffectOrigin !== 1) return false;
        return isImpl(state, "IBuff");
    }
    /** @rva 0x191CED0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        if (this._EffectRange === -1) return [];
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__3_0
        if (list.length > 0) list = list.filter(unit => this.$GetAIFilteredTargets$b__3_1(unit));
        return list;
    }
    /** @rva 0x191D140 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const funcList = [
            AISkillTargetSelector.UnitFilterByMainTarget,
            AISkillTargetSelector.UnitFilterByBreak,
            (c: IEnumerable<BattleUnit>) => this.$SelectTargetInAIAction$g__UnitFilterByUpAtk_4_0(c),
            (c: IEnumerable<BattleUnit>) => this.$SelectTargetInAIAction$g__UnitFilterByUpDef_4_1(c),
            (c: IEnumerable<BattleUnit>) => this.$SelectTargetInAIAction$g__UnitFilterByUpParam_4_2(c),
        ];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(targetUnitList, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        return unit == null ? 0 : unit._Id;
    }
    /** @rva 0x191D520  private bool <GetAIFilteredTargets>b__3_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__3_1(unit: BattleUnit): boolean {
        return unit._Condition._StateList.filter(state => this.$GetAIFilteredTargets$b__3_2(state)).length > 1; // Count(b__3_2) > 1
    }
    /** @rva 0x191D5D0  private bool <GetAIFilteredTargets>b__3_2(UnitStateBase state) { } */
    $GetAIFilteredTargets$b__3_2(state: UnitStateBase): boolean { return this.IsRemovable(state); /* vslot 8 */ }
    /** @rva 0x191DA40  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByUpAtk|4_0(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterByUpAtk_4_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => this.$SelectTargetInAIAction$b__4_3(unit));
    }
    /** @rva 0x191D5F0  private bool <SelectTargetInAIAction>b__4_3(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__4_3(unit: BattleUnit): boolean { return unit._Condition._StateList.some(state => this.$SelectTargetInAIAction$b__4_4(state)); }
    /** @rva 0x191D6A0  private bool <SelectTargetInAIAction>b__4_4(UnitStateBase state) { } */
    $SelectTargetInAIAction$b__4_4(state: UnitStateBase): boolean { return this.IsRemovable(state) && state instanceof UpAttackUnitStateBase; }
    /** @rva 0x191DAD0  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByUpDef|4_1(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterByUpDef_4_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => this.$SelectTargetInAIAction$b__4_5(unit));
    }
    /** @rva 0x191D760  private bool <SelectTargetInAIAction>b__4_5(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__4_5(unit: BattleUnit): boolean { return unit._Condition._StateList.some(state => this.$SelectTargetInAIAction$b__4_6(state)); }
    /** @rva 0x191D810  private bool <SelectTargetInAIAction>b__4_6(UnitStateBase state) { } */
    $SelectTargetInAIAction$b__4_6(state: UnitStateBase): boolean { return this.IsRemovable(state) && state instanceof UpDefenseUnitStateBase; }
    /** @rva 0x191DB60  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByUpParam|4_2(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterByUpParam_4_2(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => this.$SelectTargetInAIAction$b__4_7(unit));
    }
    /** @rva 0x191D8D0  private bool <SelectTargetInAIAction>b__4_7(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__4_7(unit: BattleUnit): boolean { return unit._Condition._StateList.some(state => this.$SelectTargetInAIAction$b__4_8(state)); }
    /** @rva 0x191D980  private bool <SelectTargetInAIAction>b__4_8(UnitStateBase state) { } */
    $SelectTargetInAIAction$b__4_8(state: UnitStateBase): boolean { return this.IsRemovable(state) && state instanceof ParameterVariationUnitStateBase; }
}
