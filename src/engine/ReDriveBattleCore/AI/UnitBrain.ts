// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, HashSet, IEnumerable, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AIActionEffectHistory } from "./AIActionEffectHistory";
import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { ActBase } from "../Act/ActBase";
import type { ActReferee } from "../Act/ActReferee";
import type { ActiveSkill } from "../ActiveSkill";
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
    TargetingUnits(teamAttackTargetId: int, unit: BattleUnit, skill: ActiveSkillBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): any /* ValueTuple<int, int> */ { return notPorted("UnitBrain.TargetingUnits", 0x17F2EA0); }
    /** @rva 0x17F1040  public void AddAppliedEffectTypes(List<string> appliedSkillEffectTypes, BattleUnit.TeamType teamType) { } */
    AddAppliedEffectTypes(appliedSkillEffectTypes: List<string>, teamType: BattleUnit_TeamType): void { return notPorted("UnitBrain.AddAppliedEffectTypes", 0x17F1040); }
    /** @rva 0x17F1680  public HashSet<string> GetAppliedEffectTypes(BattleUnit.TeamType teamType) { } */
    GetAppliedEffectTypes(teamType: BattleUnit_TeamType): HashSet<string> { return notPorted("UnitBrain.GetAppliedEffectTypes", 0x17F1680); }
    /** @rva 0x17F2D80  private bool ShouldUseSpecialAttack(BattleUnit actUnit, List<BattleUnit> allyUnitList, List<BattleUnit> enemyUnitList, GameDirectorBase gameDirector) { } */
    ShouldUseSpecialAttack(actUnit: BattleUnit, allyUnitList: List<BattleUnit>, enemyUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): boolean { return notPorted("UnitBrain.ShouldUseSpecialAttack", 0x17F2D80); }
    /** @rva 0x17F19E0  private BattleUnit GetSpecialAttackPriorityUnit(IEnumerable<BattleUnit> specialAttackUsableUnitList) { } */
    GetSpecialAttackPriorityUnit(specialAttackUsableUnitList: IEnumerable<BattleUnit>): BattleUnit { return notPorted("UnitBrain.GetSpecialAttackPriorityUnit", 0x17F19E0); }
    /** @rva 0x17F16B0  public BattleUnit GetAutoSpecialAttackUseUnit(AutoType autoType, ActBase currentAct, List<BattleUnit> allyUnitList, List<BattleUnit> enemyUnitList, GameDirectorBase gameDirector) { } */
    GetAutoSpecialAttackUseUnit(autoType: AutoType, currentAct: ActBase, allyUnitList: List<BattleUnit>, enemyUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): BattleUnit { return notPorted("UnitBrain.GetAutoSpecialAttackUseUnit", 0x17F16B0); }
    /** @rva 0x17F1060  public ActiveSkillBase AutoSelectActiveSkillOrNormalAttack(BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, BattleUnit actUnit, GameDirectorBase gameDirector, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList) { } */
    AutoSelectActiveSkillOrNormalAttack(conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, actUnit: BattleUnit, gameDirector: GameDirectorBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): ActiveSkillBase { return notPorted("UnitBrain.AutoSelectActiveSkillOrNormalAttack", 0x17F1060); }
    /** @rva 0x17F2950  private bool ShouldUseActiveSkill(BattleUnit actUnit, GameDirectorBase gameDirector, ActiveSkillBase activeSkill, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList) { } */
    ShouldUseActiveSkill(actUnit: BattleUnit, gameDirector: GameDirectorBase, activeSkill: ActiveSkillBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): boolean { return notPorted("UnitBrain.ShouldUseActiveSkill", 0x17F2950); }
    /** @rva 0x17F2A60  private bool ShouldUseSkillBase(BattleUnit actUnit, ActiveSkillBase activeSkillBase, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList, SkillType skillType, GameDirectorBase gameDiretor) { } */
    ShouldUseSkillBase(actUnit: BattleUnit, activeSkillBase: ActiveSkillBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>, skillType: SkillType, gameDiretor: GameDirectorBase): boolean { return notPorted("UnitBrain.ShouldUseSkillBase", 0x17F2A60); }
    /** @rva 0x17F1630  public void ClearAIFilteredTargetsDictionary() { } */
    ClearAIFilteredTargetsDictionary(): void { return notPorted("UnitBrain.ClearAIFilteredTargetsDictionary", 0x17F1630); }
    /** @rva 0x17F1CB0  private ActiveSkill RandomSelectActiveSkill(List<ActiveSkill> activeSkillList) { } */
    RandomSelectActiveSkill(activeSkillList: List<ActiveSkill>): ActiveSkill { return notPorted("UnitBrain.RandomSelectActiveSkill", 0x17F1CB0); }
    /** @rva 0x17F27D0  public void SetEnabledActiveEnemyUnitsStartConditionTimingAction(List<BattleUnit> enemyUnitList, EnemyConditionAndActionController.EnemyStartConditionTimingType timingType) { } */
    SetEnabledActiveEnemyUnitsStartConditionTimingAction(enemyUnitList: List<BattleUnit>, timingType: EnemyConditionAndActionController_EnemyStartConditionTimingType): void { return notPorted("UnitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction", 0x17F27D0); }
    /** @rva 0x17F2120  public bool RegisterEnemyUnitsStartConditionTimingAction(List<BattleUnit> enemyUnitList, ActReferee actReferee) { } */
    RegisterEnemyUnitsStartConditionTimingAction(enemyUnitList: List<BattleUnit>, actReferee: ActReferee): boolean { return notPorted("UnitBrain.RegisterEnemyUnitsStartConditionTimingAction", 0x17F2120); }
    /** @rva 0x17F26F0  private void RemoveStartTimingActForNotUnit(List<BattleUnit> enemyUnitList, ActReferee actReferee) { } */
    RemoveStartTimingActForNotUnit(enemyUnitList: List<BattleUnit>, actReferee: ActReferee): void { return notPorted("UnitBrain.RemoveStartTimingActForNotUnit", 0x17F26F0); }
    /** @rva 0x17F3760  public void .ctor() { } */
    ctor(): this { return notPorted("UnitBrain..ctor", 0x17F3760); }
    /** @rva 0x17F32A0  internal static int <GetSpecialAttackPriorityUnit>g__GetPriority|7_3(SpecialAttack.CompositionType composition) { } */
    static $GetSpecialAttackPriorityUnit$g__GetPriority_7_3(composition: SpecialAttack_CompositionType): int { return notPorted("UnitBrain.<GetSpecialAttackPriorityUnit>g__GetPriority|7_3", 0x17F32A0); }
    /** @rva 0x17F32D0  internal static bool <RegisterEnemyUnitsStartConditionTimingAction>g__RegisterActs|15_5(List<BattleUnit> units, EnemyConditionAndActionController.EnemyStartConditionTimingType timingType, ref UnitBrain.<>c__DisplayClass15_0 ) { } */
    static $RegisterEnemyUnitsStartConditionTimingAction$g__RegisterActs_15_5(units: List<BattleUnit>, timingType: EnemyConditionAndActionController_EnemyStartConditionTimingType, UnitBrain$c__DisplayClass15_0: any /*  */): boolean { return notPorted("UnitBrain.<RegisterEnemyUnitsStartConditionTimingAction>g__RegisterActs|15_5", 0x17F32D0); }
}
