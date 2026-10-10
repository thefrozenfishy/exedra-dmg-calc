// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.RemoveStateAbilityEffectBase  (TypeDefIndex 1201, public abstract class) ----
export abstract class RemoveStateAbilityEffectBase extends AbilityEffectBase {
    /** protected const int RemoveAllNum */
    static readonly RemoveAllNum: int = 0;
    /** 0x60 protected int maxRemoveCount */
    maxRemoveCount: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("RemoveStateAbilityEffectBase..ctor", 0x18EB3C0); }
    /** @rva 0x19000A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RemoveStateAbilityEffectBase..ctor", 0x19000A0); }
    /** @rva 0x18FFC70 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("RemoveStateAbilityEffectBase.Triggering", 0x18FFC70); }
    /** @rva -1 slot 8  public abstract bool IsRemovable(UnitStateBase state); */
    abstract IsRemovable(state: UnitStateBase): boolean;
    /** @rva 0x18FF800 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("RemoveStateAbilityEffectBase.GetAIFilteredTargets", 0x18FF800); }
    /** @rva 0x18FFA40 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("RemoveStateAbilityEffectBase.SelectTargetInAIAction", 0x18FFA40); }
    /** @rva 0x18FF0A0  private bool <Triggering>b__4_0(UnitStateBase state) { } */
    $Triggering$b__4_0(state: UnitStateBase): boolean { return notPorted("RemoveStateAbilityEffectBase.<Triggering>b__4_0", 0x18FF0A0); }
    /** @rva 0x18FFFF0  private bool <GetAIFilteredTargets>b__6_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__6_1(unit: BattleUnit): boolean { return notPorted("RemoveStateAbilityEffectBase.<GetAIFilteredTargets>b__6_1", 0x18FFFF0); }
    /** @rva 0x18FF0A0  private bool <GetAIFilteredTargets>b__6_2(UnitStateBase state) { } */
    $GetAIFilteredTargets$b__6_2(state: UnitStateBase): boolean { return notPorted("RemoveStateAbilityEffectBase.<GetAIFilteredTargets>b__6_2", 0x18FF0A0); }
}
