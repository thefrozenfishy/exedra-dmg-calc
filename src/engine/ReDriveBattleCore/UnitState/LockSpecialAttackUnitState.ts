// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectBase_TargetSideType } from "../AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { INeutralState } from "./INeutralState";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.LockSpecialAttackUnitState  (TypeDefIndex 639, public class) ----
export class LockSpecialAttackUnitState extends UnitStateBase {  // implements INeutralState
    static readonly __interfaces: readonly string[] = ['INeutralState'];
    get INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return this.get_INeutralState$TargetSide(); }
    /** @rva 0x7E0AD0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 2 as UnitStateBase_DirectionType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x758B30 slot 25  private AbilityEffectBase.TargetSideType ReDriveBattleCore.UnitState.INeutralState.get_TargetSide() { } */
    get_INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return 1 as AbilityEffectBase_TargetSideType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16FCDA0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_seal";
    }
    /** @rva 0x16FCD70 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
    /** @rva 0x76E830 slot 20  public override bool get_ShouldRemoveStateByHolderDeath() { } */
    get_ShouldRemoveStateByHolderDeath(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x16F8570  public void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15D9DB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x16FC8C0  private bool IsTarget(BattleUnit unit) { } */
    IsTarget(unit: BattleUnit): boolean {
        if (!unit._Condition._StateList.some(s => s instanceof LockSpecialAttackUnitState) && 0 < unit._MaxEP) { // OfType<>().Any()
            return unit._MaxBP < 1;
        }
        return false;
    }
    /** @rva 0x16FC950 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__13_0
        // 3.21.0: the AI only aims Magic Seal at units it can land on (IsTarget = CanAddTo: not sealed yet, has EP, no BP gauge)
        if (list.length > 0) list = list.filter(unit => this.$GetAIFilteredTargets$b__13_1(unit));
        return list;
    }
    /** @rva 0x16FCB10 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByBreak);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16FC8C0 slot 21  public override bool CanAddTo(BattleUnit unit) { } */
    CanAddTo(unit: BattleUnit): boolean {
        return this.IsTarget(unit); // same code (IL2CPP folded CanAddTo, IsTarget and b__13_1 onto 0x16FC8C0)
    }
    /** @rva 0x16FC8C0  private bool <GetAIFilteredTargets>b__13_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__13_1(unit: BattleUnit): boolean {
        return this.IsTarget(unit);
    }
}
