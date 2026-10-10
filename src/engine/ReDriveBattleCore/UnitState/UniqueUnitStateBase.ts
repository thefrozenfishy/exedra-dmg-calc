// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IRemoveByUserUnitDeath } from "./IRemoveByUserUnitDeath";
import { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueUnitStateBase  (TypeDefIndex 665, public abstract class) ----
export abstract class UniqueUnitStateBase extends UnitStateBase {  // implements IRemoveByUserUnitDeath
    static readonly __interfaces: readonly string[] = ['IRemoveByUserUnitDeath'];
    /** 0x88 private string iconName */
    iconName: string = null!;
    /** 0x90 private int <UniqueStatePatternMstId>k__BackingField */
    _UniqueStatePatternMstId: int = 0;
    get UniqueStatePatternMstId(): int { return this.get_UniqueStatePatternMstId(); }
    set UniqueStatePatternMstId(v: int) { this.set_UniqueStatePatternMstId(v); }
    /** @rva 0x76F830 slot 9  public override bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x16DF3A0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UniqueUnitStateBase.get_IconName", 0x16DF3A0); }
    /** @rva 0x16DEE90  private string GetIconName() { } */
    GetIconName(): string { return notPorted("UniqueUnitStateBase.GetIconName", 0x16DEE90); }
    /** @rva 0x902980  public int get_UniqueStatePatternMstId() { } */
    get_UniqueStatePatternMstId(): int { return this._UniqueStatePatternMstId; /* auto-property */ }
    /** @rva 0x9029B0  public void set_UniqueStatePatternMstId(int value) { } */
    set_UniqueStatePatternMstId(value: int): void { this._UniqueStatePatternMstId = value; /* auto-property */ }
    /** @rva 0x16DF310  protected void .ctor() { } */
    ctor(): this { return notPorted("UniqueUnitStateBase..ctor", 0x16DF310); }
    /** @rva 0x16DE100  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UniqueUnitStateBase..ctor", 0x16DE100); }
    /** @rva 0x16DECD0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("UniqueUnitStateBase.GetAIFilteredTargets", 0x16DECD0); }
    /** @rva 0x16DEFF0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UniqueUnitStateBase.GetUnitFilterFuncOrder", 0x16DEFF0); }
    /** @rva 0x16DF1C0  private bool <GetAIFilteredTargets>b__12_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__12_1(unit: BattleUnit): boolean { return notPorted("UniqueUnitStateBase.<GetAIFilteredTargets>b__12_1", 0x16DF1C0); }
}
