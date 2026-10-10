// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { StartTimingAct } from "../Act/StartTimingAct";
import { ActReferee } from "../Act/ActReferee";
import { NormalAttack } from "../NormalAttack";
import { ActiveSkill } from "../ActiveSkill";
import { AIActionEffectHistory } from "./AIActionEffectHistory";
import { newGuidKey, notPorted, orderBy, orderByKeys, randomNext, ref, removeAll } from "../../runtime";
import type { Dictionary, HashSet, IEnumerable, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";

import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { ActBase } from "../Act/ActBase";

import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AutoType } from "../AutoType";
import type { BattleConditionUtils_ConditionCheckDataBundle } from "../BattleCondition/BattleConditionUtils";
import type { BattleUnit, BattleUnit_TeamType } from "../BattleUnit";
import type { EnemyConditionAndActionController_EnemyStartConditionTimingType } from "../EnemyConditionAndActionController";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { SpecialAttack_CompositionType } from "../SpecialAttack";

// ---- ReDriveBattleCore.AI.UnitBrain  (TypeDefIndex 1099, public class) ----
export class UnitBrain {
    /** 0x10 private AIActionEffectHistory actionEffectHistory */
    actionEffectHistory: AIActionEffectHistory = null!;
    /** 0x18 private Dictionary<AbilityEffectBase, List<BattleUnit>> aiFilteredTargetsDictionary */
    aiFilteredTargetsDictionary: Dictionary<AbilityEffectBase, List<BattleUnit>> = null!;
    /** 0x0 private static readonly int InvalidSkillMstId */
    static InvalidSkillMstId: int = 0;
    /** @rva 0x17F2EA0  public ValueTuple<int, int> TargetingUnits(int teamAttackTargetId, BattleUnit unit, ActiveSkillBase skill, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList) { } */
    TargetingUnits(teamAttackTargetId: int, unit: BattleUnit, skill: ActiveSkillBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): any /* ValueTuple<int, int> */ {
        let attackTargetId = 0;
        let friendTargetId = 0;
        if (skill != null) {
            const effects = orderBy(skill.GetAbilityEffectList(), e => e.DetailMstId); // <>c.b__2_0
            const opponentEffect = effects.find(e => e.TargetSide === 1) ?? null; // <>c.b__2_1
            if (opponentEffect != null) {
                if (this.aiFilteredTargetsDictionary.has(opponentEffect)) opponentUnitList = this.aiFilteredTargetsDictionary.get(opponentEffect)!;
                attackTargetId = opponentEffect.SelectTargetInAIAction(unit, opponentUnitList);
            }
            const friendEffect = effects.find(e => e.TargetSide === 0) ?? null; // <>c.b__2_2
            if (friendEffect != null) {
                if (this.aiFilteredTargetsDictionary.has(friendEffect)) friendUnitList = this.aiFilteredTargetsDictionary.get(friendEffect)!;
                friendTargetId = friendEffect.SelectTargetInAIAction(unit, friendUnitList);
            }
            if (attackTargetId === 0) attackTargetId = teamAttackTargetId;
        }
        return [attackTargetId, friendTargetId];
    }
    /** @rva 0x17F1040  public void AddAppliedEffectTypes(List<string> appliedSkillEffectTypes, BattleUnit.TeamType teamType) { } */
    AddAppliedEffectTypes(appliedSkillEffectTypes: List<string>, teamType: BattleUnit_TeamType): void {
        const set = teamType === 0 ? this.actionEffectHistory.allyActionEffectTypes : this.actionEffectHistory.enemyActionEffectTypes;
        if (appliedSkillEffectTypes == null) return;
        for (const type of appliedSkillEffectTypes) set.add(type);
    }
    /** @rva 0x17F1680  public HashSet<string> GetAppliedEffectTypes(BattleUnit.TeamType teamType) { } */
    GetAppliedEffectTypes(teamType: BattleUnit_TeamType): HashSet<string> {
        if (teamType === 0) return this.actionEffectHistory.allyActionEffectTypes;
        return this.actionEffectHistory.enemyActionEffectTypes;
    }
    /** @rva 0x17F2D80  private bool ShouldUseSpecialAttack(BattleUnit actUnit, List<BattleUnit> allyUnitList, List<BattleUnit> enemyUnitList, GameDirectorBase gameDirector) { } */
    ShouldUseSpecialAttack(actUnit: BattleUnit, allyUnitList: List<BattleUnit>, enemyUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): boolean {
        if (actUnit.SpecialAttack == null || !actUnit.IsSpecialAttackPointMax() || actUnit.IsDead) return false;
        const condition = actUnit.Condition;
        if (condition.CanNotUseSkill || condition.CanNotUseSpecialAttack) return false;
        if (actUnit.BreakPoint.IsBreak) return false;
        const isAlly = actUnit.Team === 0;
        return this.ShouldUseSkillBase(actUnit, actUnit.SpecialAttack, isAlly ? enemyUnitList : allyUnitList, isAlly ? allyUnitList : enemyUnitList, 2 as SkillType, gameDirector);
    }
    /** @rva 0x17F19E0  private BattleUnit GetSpecialAttackPriorityUnit(IEnumerable<BattleUnit> specialAttackUsableUnitList) { } */
    GetSpecialAttackPriorityUnit(specialAttackUsableUnitList: IEnumerable<BattleUnit>): BattleUnit {
        return orderByKeys(specialAttackUsableUnitList, [
            [unit => unit.Team !== 0, false], // <>c.b__7_0
            [unit => UnitBrain.$GetSpecialAttackPriorityUnit$g__GetPriority_7_3(unit.SpecialAttack.GetComposition()), true], // <>c.b__7_1
            [() => newGuidKey(), false], // <>c.b__7_2
        ])[0] ?? null!;
    }
    /** @rva 0x17F16B0  public BattleUnit GetAutoSpecialAttackUseUnit(AutoType autoType, ActBase currentAct, List<BattleUnit> allyUnitList, List<BattleUnit> enemyUnitList, GameDirectorBase gameDirector) { } */
    GetAutoSpecialAttackUseUnit(autoType: AutoType, currentAct: ActBase, allyUnitList: List<BattleUnit>, enemyUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): BattleUnit {
        // <>c__DisplayClass8_0 { this, allyUnitList, enemyUnitList, gameDirector, currentAct }
        let candidates: List<BattleUnit>;
        if (autoType === 2) candidates = [...new Set([...allyUnitList, ...enemyUnitList])].filter(x => !x.IsDead); // Union, <>c.b__8_0
        else candidates = enemyUnitList.filter(x => !x.IsDead); // <>c.b__8_1
        candidates = candidates
            .filter(unit => { // DisplayClass8_0.b__2 (ShouldUseSpecialAttack inlined)
                if (unit.SpecialAttack == null || !unit.IsSpecialAttackPointMax() || unit.IsDead) return false;
                if (unit.Condition.CanNotUseSkill || unit.Condition.CanNotUseSpecialAttack) return false;
                if (unit.BreakPoint.IsBreak) return false;
                const isAlly = unit.Team === 0;
                return this.ShouldUseSkillBase(unit, unit.SpecialAttack, isAlly ? enemyUnitList : allyUnitList, isAlly ? allyUnitList : enemyUnitList, 2 as SkillType, gameDirector);
            })
            .filter(unit => ActReferee.CanBeInterruptedByAutoSpecialAttack(currentAct, unit.Team)); // DisplayClass8_0.b__3
        return orderByKeys(candidates, [
            [unit => unit.Team !== 0, false], // <>c.b__7_0
            [unit => UnitBrain.$GetSpecialAttackPriorityUnit$g__GetPriority_7_3(unit.SpecialAttack.GetComposition()), true], // <>c.b__7_1
            [() => newGuidKey(), false], // <>c.b__7_2
        ])[0] ?? null!; // GetSpecialAttackPriorityUnit inlined
    }
    /** @rva 0x17F1060  public ActiveSkillBase AutoSelectActiveSkillOrNormalAttack(BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, BattleUnit actUnit, GameDirectorBase gameDirector, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList) { } */
    AutoSelectActiveSkillOrNormalAttack(conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, actUnit: BattleUnit, gameDirector: GameDirectorBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): ActiveSkillBase {
        if (actUnit == null) return null!;
        if (actUnit.IsDead) return null!;
        if (actUnit.Condition.CanNotAction) return null!;
        if (actUnit.BreakPoint.IsBreak) return null!;
        let activeSkills: ActiveSkill[] = actUnit.ActiveSkills;
        const switched = ref<ActiveSkill>(null!);
        const switchState = ref<any>(null);
        if (actUnit.IsSwitchingActiveSkill<ActiveSkill>(ActiveSkill, switched, switchState)) activeSkills = [switched.v];
        if (actUnit.Condition.CanNotUseSkill || activeSkills.length === 0) {
            if (!actUnit.isCharacter) return null!;
            return actUnit.NormalAttack;
        }
        if (actUnit.IsEnemy) {
            const action = actUnit.EnemyConditionAndActionController.GetAction(conditionCheckDataBundle, 1); // <>c__DisplayClass9_0
            const skillMstId = action != null ? action : UnitBrain.InvalidSkillMstId;
            const chosen = activeSkills.find(skill => skill.Id === skillMstId) ?? null; // DisplayClass9_0.b__0
            if (chosen != null) return chosen;
        }
        const usable: ActiveSkill[] = [];
        for (let i = 0; i < activeSkills.length; i++) {
            const skill = activeSkills[i];
            const sp = gameDirector.spReferee.GetSp(actUnit.Team);
            if (skill.ConsumeSP <= sp) {
                // ShouldUseActiveSkill inlined
                if (!(skill instanceof ActiveSkill) || skill.HpGaugeValue < 1 || skill.HpGaugeValue === actUnit.CurrentHpGaugeCount) {
                    if (this.ShouldUseSkillBase(actUnit, skill, opponentUnitList, friendUnitList, 1 as SkillType, gameDirector)) usable.push(skill);
                }
            }
        }
        const picked: ActiveSkill = !actUnit.isCharacter
            ? this.RandomSelectActiveSkill(usable)
            : (orderByKeys(usable, [[skill => skill.ConsumeSP, true]])[0] ?? null!); // <>c.b__9_1 (OrderByDescending)
        if (picked != null) return picked;
        if (!actUnit.isCharacter) return null!;
        let normal: ActiveSkillBase = actUnit.NormalAttack;
        const switchedNormal = ref<NormalAttack>(null!);
        if (actUnit.IsSwitchingActiveSkill<NormalAttack>(NormalAttack, switchedNormal, switchState)) normal = switchedNormal.v;
        if (this.ShouldUseSkillBase(actUnit, normal, opponentUnitList, friendUnitList, 3 as SkillType, gameDirector)) return normal;
        return null!;
    }
    /** @rva 0x17F2950  private bool ShouldUseActiveSkill(BattleUnit actUnit, GameDirectorBase gameDirector, ActiveSkillBase activeSkill, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList) { } */
    ShouldUseActiveSkill(actUnit: BattleUnit, gameDirector: GameDirectorBase, activeSkill: ActiveSkillBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): boolean {
        const sp = gameDirector.spReferee.GetSp(actUnit.Team);
        if (activeSkill.ConsumeSP > sp) return false;
        if (!(activeSkill instanceof ActiveSkill) || activeSkill.HpGaugeValue < 1 || activeSkill.HpGaugeValue === actUnit.CurrentHpGaugeCount) {
            return this.ShouldUseSkillBase(actUnit, activeSkill, opponentUnitList, friendUnitList, 1 as SkillType, gameDirector);
        }
        return false;
    }
    /** @rva 0x17F2A60  private bool ShouldUseSkillBase(BattleUnit actUnit, ActiveSkillBase activeSkillBase, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList, SkillType skillType, GameDirectorBase gameDiretor) { } */
    ShouldUseSkillBase(actUnit: BattleUnit, activeSkillBase: ActiveSkillBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>, skillType: SkillType, gameDiretor: GameDirectorBase): boolean {
        // <>c__DisplayClass11_0 { firstEffect }
        if (activeSkillBase == null) return false;
        const effects = orderBy(activeSkillBase.GetAbilityEffectList(), e => e.DetailMstId); // <>c.b__11_0, ToList
        const first = effects[0] ?? null;
        if (first == null) throw new TypeError("NullReferenceException");
        const targets = first.GetAIFilteredTargets(actUnit, first.TargetSide === 1 ? opponentUnitList : friendUnitList, skillType, gameDiretor);
        this.aiFilteredTargetsDictionary.set(first, targets);
        const second = effects.find(e => e.TargetSide !== first.TargetSide) ?? null; // DisplayClass11_0.b__1
        if (second != null) {
            const targets2 = second.GetAIFilteredTargets(actUnit, second.TargetSide === 1 ? opponentUnitList : friendUnitList, skillType, gameDiretor);
            this.aiFilteredTargetsDictionary.set(second, targets2);
        }
        if (targets == null) throw new TypeError("ArgumentNullException: source");
        return targets.length > 0;
    }
    /** @rva 0x17F1630  public void ClearAIFilteredTargetsDictionary() { } */
    ClearAIFilteredTargetsDictionary(): void {
        this.aiFilteredTargetsDictionary.clear();
    }
    /** @rva 0x17F1CB0  private ActiveSkill RandomSelectActiveSkill(List<ActiveSkill> activeSkillList) { } */
    RandomSelectActiveSkill(activeSkillList: List<ActiveSkill>): ActiveSkill {
        const list = activeSkillList.filter(skill => skill.WeightValue >= 0); // <>c.b__13_0
        const total = list.reduce((s, skill) => s + skill.WeightValue, 0); // <>c.b__13_1 (Sum, int)
        if (total >= 1) {
            const roll = randomNext(total); // new Random().Next(total)
            let acc = 0;
            for (const skill of list) {
                acc = acc + skill.WeightValue;
                if (roll < acc) return skill;
            }
        }
        return orderByKeys(list, [[() => newGuidKey(), false]])[0] ?? null!; // <>c.b__13_2
    }
    /** @rva 0x17F27D0  public void SetEnabledActiveEnemyUnitsStartConditionTimingAction(List<BattleUnit> enemyUnitList, EnemyConditionAndActionController.EnemyStartConditionTimingType timingType) { } */
    SetEnabledActiveEnemyUnitsStartConditionTimingAction(enemyUnitList: List<BattleUnit>, timingType: EnemyConditionAndActionController_EnemyStartConditionTimingType): void {
        if (enemyUnitList == null) return;
        for (const unit of enemyUnitList) {
            if (unit.IsDead) continue;
            if (unit.Condition.CanNotAction) continue;
            if (unit.BreakPoint.IsBreak) continue;
            if (unit.EnemyConditionAndActionController != null) unit.EnemyConditionAndActionController.SetEnabledActiveStartConditionTimingAction(timingType);
        }
    }
    /** @rva 0x17F2120  public bool RegisterEnemyUnitsStartConditionTimingAction(List<BattleUnit> enemyUnitList, ActReferee actReferee) { } */
    RegisterEnemyUnitsStartConditionTimingAction(enemyUnitList: List<BattleUnit>, actReferee: ActReferee): boolean {
        // <>c__DisplayClass15_0 { actReferee }; RemoveStartTimingActForNotUnit inlined (DisplayClass16_0)
        removeAll(actReferee.actList, act => UnitBrain$ShouldRemove(enemyUnitList, act));
        const units = orderByKeys(enemyUnitList.filter(unit => !unit.IsDead && unit.EnemyConditionAndActionController.HasAnyCanActivateStartConditionTimingAction()), [ // <>c.b__15_0
            [unit => unit.IsMainTargetEnemy(), true], // <>c.b__15_1
            [unit => unit.TurnGauge.GaugeValue, false], // <>c.b__15_2
            [unit => unit.TurnGauge.TurnOrderPriority, true], // <>c.b__15_3
            [unit => unit.Id, false], // <>c.b__15_4
        ]);
        if (!(units.length > 0)) return false;
        const a = UnitBrain.$RegisterEnemyUnitsStartConditionTimingAction$g__RegisterActs_15_5(units, 1 as EnemyConditionAndActionController_EnemyStartConditionTimingType, actReferee);
        const b = UnitBrain.$RegisterEnemyUnitsStartConditionTimingAction$g__RegisterActs_15_5(units, 2 as EnemyConditionAndActionController_EnemyStartConditionTimingType, actReferee);
        return b || a;
    }
    /** @rva 0x17F26F0  private void RemoveStartTimingActForNotUnit(List<BattleUnit> enemyUnitList, ActReferee actReferee) { } */
    RemoveStartTimingActForNotUnit(enemyUnitList: List<BattleUnit>, actReferee: ActReferee): void {
        removeAll(actReferee.actList, act => UnitBrain$ShouldRemove(enemyUnitList, act)); // List.RemoveAll(<>c__DisplayClass16_0.<RemoveStartTimingActForNotUnit>g__ShouldRemove|0)
    }
    /** @rva 0x17F3760  public void .ctor() { } */
    ctor(): this {
        const history = new AIActionEffectHistory();
        history.allyActionEffectTypes = new Set();
        history.enemyActionEffectTypes = new Set();
        this.actionEffectHistory = history;
        this.aiFilteredTargetsDictionary = new Map();
        return this;
    }
    /** @rva 0x17F32A0  internal static int <GetSpecialAttackPriorityUnit>g__GetPriority|7_3(SpecialAttack.CompositionType composition) { } */
    static $GetSpecialAttackPriorityUnit$g__GetPriority_7_3(composition: SpecialAttack_CompositionType): int {
        switch (composition) {
            case 1: return 1;
            case 2: return 2;
            case 3: return 3;
            default: return 0;
        }
    }
    /** @rva 0x17F32D0  internal static bool <RegisterEnemyUnitsStartConditionTimingAction>g__RegisterActs|15_5(List<BattleUnit> units, EnemyConditionAndActionController.EnemyStartConditionTimingType timingType, ref UnitBrain.<>c__DisplayClass15_0 ) { } */
    static $RegisterEnemyUnitsStartConditionTimingAction$g__RegisterActs_15_5(units: List<BattleUnit>, timingType: EnemyConditionAndActionController_EnemyStartConditionTimingType, actReferee: ActReferee): boolean {
        let registered = false;
        for (const unit of units) { // <>c__DisplayClass15_1 { unit }
            for (const action of unit.EnemyConditionAndActionController.GetCanActivateStartConditionTimingActionList(timingType)) { // DisplayClass15_2 { action, dc15_1 }
                if (actReferee.actList.some(act => act instanceof StartTimingAct && act.actUnitId === unit.Id && act.skillMstId === action.SkillMstId)) continue; // b__6
                const act = new StartTimingAct().ctor();
                act.skillMstId = action.SkillMstId;
                act.actUnitId = unit.Id;
                act.actUnitTeam = unit.Team;
                actReferee.AddAct$ActBase(act);
                unit.EnemyConditionAndActionController.RegisterStartConditionTimingAction(action.StartConditionTimingType, action.SkillMstId);
                registered = true;
            }
        }
        return registered;
    }
}

/** <>c__DisplayClass16_0.<RemoveStartTimingActForNotUnit>g__ShouldRemove|0 (closure over enemyUnitList) */
function UnitBrain$ShouldRemove(enemyUnitList: List<BattleUnit>, act: ActBase): boolean {
    if (!(act instanceof StartTimingAct)) return false;
    return (enemyUnitList.find(u => u.Id === act.actUnitId) ?? null) == null; // DisplayClass16_1.b__1
}