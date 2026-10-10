// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectBase_TargetSideType } from "../AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { INeutralState } from "./INeutralState";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.CountUnitState  (TypeDefIndex 559, public class) ----
export class CountUnitState extends UnitStateBase {  // implements INeutralState, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['INeutralState', 'IStateIconNumberDisplayable'];
    /** 0x88 protected int countPoint */
    countPoint: int = 0;
    get INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return this.get_INeutralState$TargetSide(); }
    get IStateIconNumberDisplayable$StateIconNumber(): int { return this.get_IStateIconNumberDisplayable$StateIconNumber(); }
    get IStateIconNumberDisplayable$IsShowZeroIfZero(): boolean { return this.get_IStateIconNumberDisplayable$IsShowZeroIfZero(); }
    get DontRemoveOnPassiveSkillUserLeaveBattle(): boolean { return this.get_DontRemoveOnPassiveSkillUserLeaveBattle(); }
    get CountPoint(): int { return this.get_CountPoint(); }
    get MaxCountPoint(): int { return this.get_MaxCountPoint(); }
    /** @rva 0x7E1AD0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 2 as UnitStateBase_DirectionType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x15B7150 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("CountUnitState.get_IconName", 0x15B7150); }
    /** @rva 0x76F830 slot 9  public override bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x15B7140 slot 8  public override int get_IconPriority() { } */
    get_IconPriority(): int { return 50; /* asm: mov eax, 0x32; ret */ }
    /** @rva 0x76F830 slot 11  public override bool get_ShowStateDetailAttachedByPassiveSkill() { } */
    get_ShowStateDetailAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x15B7140 slot 10  public override int get_DetailDisplayPriority() { } */
    get_DetailDisplayPriority(): int { return 50; /* asm: mov eax, 0x32; ret */ }
    /** @rva 0x76F830 slot 12  public override bool get_IsDontShowAddStateFlip() { } */
    get_IsDontShowAddStateFlip(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x759B30 slot 25  private AbilityEffectBase.TargetSideType ReDriveBattleCore.UnitState.INeutralState.get_TargetSide() { } */
    get_INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return 1 as AbilityEffectBase_TargetSideType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x902530 slot 28  private int ReDriveBattleCore.UnitState.IStateIconNumberDisplayable.get_StateIconNumber() { } */
    get_IStateIconNumberDisplayable$StateIconNumber(): int { return this.countPoint; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x76F830 slot 29  private bool ReDriveBattleCore.UnitState.IStateIconNumberDisplayable.get_IsShowZeroIfZero() { } */
    get_IStateIconNumberDisplayable$IsShowZeroIfZero(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 26  public bool get_DontRemoveOnPassiveSkillUserLeaveBattle() { } */
    get_DontRemoveOnPassiveSkillUserLeaveBattle(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 20  public override bool get_ShouldRemoveStateByHolderDeath() { } */
    get_ShouldRemoveStateByHolderDeath(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x902530  public int get_CountPoint() { } */
    get_CountPoint(): int { return this.countPoint; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15B7180  public int get_MaxCountPoint() { } */
    get_MaxCountPoint(): int { return 20; /* asm: mov eax, 0x14; ret */ }
    /** @rva 0x15B3A90  public void .ctor() { } */
    ctor(): this { return notPorted("CountUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B3AA0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("CountUnitState..ctor", 0x15B3AA0); }
    /** @rva 0x15B70B0 slot 18  public override void OnAddedToCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnAddedToCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void { return notPorted("CountUnitState.OnAddedToCondition", 0x15B70B0); }
    /** @rva 0x15B70E0 slot 19  public override void OnRemovingFromCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnRemovingFromCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void { return notPorted("CountUnitState.OnRemovingFromCondition", 0x15B70E0); }
    /** @rva 0x15B6CB0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("CountUnitState.GetAIFilteredTargets", 0x15B6CB0); }
    /** @rva 0x15B6EE0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("CountUnitState.GetUnitFilterFuncOrder", 0x15B6EE0); }
    /** @rva 0x15B6C40 slot 21  public override bool CanAddTo(BattleUnit unit) { } */
    CanAddTo(unit: BattleUnit): boolean { return notPorted("CountUnitState.CanAddTo", 0x15B6C40); }
    /** @rva 0x15B7110 slot 27  public void RefreshStateIconNumber(BattleUnit unit) { } */
    RefreshStateIconNumber(unit: BattleUnit): void { return notPorted("CountUnitState.RefreshStateIconNumber", 0x15B7110); }
}
