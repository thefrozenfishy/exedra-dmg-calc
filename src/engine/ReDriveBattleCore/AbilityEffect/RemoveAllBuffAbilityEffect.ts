// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { RemoveStateAbilityEffectBase } from "./RemoveStateAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.RemoveAllBuffAbilityEffect  (TypeDefIndex 1203, public class) ----
export class RemoveAllBuffAbilityEffect extends RemoveStateAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("RemoveAllBuffAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18FF6C0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RemoveAllBuffAbilityEffect..ctor", 0x18FF6C0); }
    /** @rva 0x18FEBB0 slot 8  public override bool IsRemovable(UnitStateBase state) { } */
    IsRemovable(state: UnitStateBase): boolean { return notPorted("RemoveAllBuffAbilityEffect.IsRemovable", 0x18FEBB0); }
    /** @rva 0x18FE9A0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("RemoveAllBuffAbilityEffect.GetAIFilteredTargets", 0x18FE9A0); }
    /** @rva 0x18FEC10 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("RemoveAllBuffAbilityEffect.SelectTargetInAIAction", 0x18FEC10); }
    /** @rva 0x18FEFF0  private bool <GetAIFilteredTargets>b__3_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__3_1(unit: BattleUnit): boolean { return notPorted("RemoveAllBuffAbilityEffect.<GetAIFilteredTargets>b__3_1", 0x18FEFF0); }
    /** @rva 0x18FF0A0  private bool <GetAIFilteredTargets>b__3_2(UnitStateBase state) { } */
    $GetAIFilteredTargets$b__3_2(state: UnitStateBase): boolean { return notPorted("RemoveAllBuffAbilityEffect.<GetAIFilteredTargets>b__3_2", 0x18FF0A0); }
    /** @rva 0x18FF510  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByUpAtk|4_0(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterByUpAtk_4_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>g__UnitFilterByUpAtk|4_0", 0x18FF510); }
    /** @rva 0x18FF0C0  private bool <SelectTargetInAIAction>b__4_3(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__4_3(unit: BattleUnit): boolean { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>b__4_3", 0x18FF0C0); }
    /** @rva 0x18FF170  private bool <SelectTargetInAIAction>b__4_4(UnitStateBase state) { } */
    $SelectTargetInAIAction$b__4_4(state: UnitStateBase): boolean { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>b__4_4", 0x18FF170); }
    /** @rva 0x18FF5A0  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByUpDef|4_1(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterByUpDef_4_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>g__UnitFilterByUpDef|4_1", 0x18FF5A0); }
    /** @rva 0x18FF230  private bool <SelectTargetInAIAction>b__4_5(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__4_5(unit: BattleUnit): boolean { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>b__4_5", 0x18FF230); }
    /** @rva 0x18FF2E0  private bool <SelectTargetInAIAction>b__4_6(UnitStateBase state) { } */
    $SelectTargetInAIAction$b__4_6(state: UnitStateBase): boolean { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>b__4_6", 0x18FF2E0); }
    /** @rva 0x18FF630  private IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterByUpParam|4_2(IEnumerable<BattleUnit> candidateUnits) { } */
    $SelectTargetInAIAction$g__UnitFilterByUpParam_4_2(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>g__UnitFilterByUpParam|4_2", 0x18FF630); }
    /** @rva 0x18FF3A0  private bool <SelectTargetInAIAction>b__4_7(BattleUnit unit) { } */
    $SelectTargetInAIAction$b__4_7(unit: BattleUnit): boolean { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>b__4_7", 0x18FF3A0); }
    /** @rva 0x18FF450  private bool <SelectTargetInAIAction>b__4_8(UnitStateBase state) { } */
    $SelectTargetInAIAction$b__4_8(state: UnitStateBase): boolean { return notPorted("RemoveAllBuffAbilityEffect.<SelectTargetInAIAction>b__4_8", 0x18FF450); }
}
