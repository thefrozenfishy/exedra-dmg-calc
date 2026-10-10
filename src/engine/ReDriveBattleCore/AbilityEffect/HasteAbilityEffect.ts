// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, IEnumerable, List, float, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.HasteAbilityEffect  (TypeDefIndex 1224, public class) ----
export class HasteAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int hasteRate */
    hasteRate: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("HasteAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18ED430  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("HasteAbilityEffect..ctor", 0x18ED430); }
    /** @rva 0x18F4840 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("HasteAbilityEffect.Triggering", 0x18F4840); }
    /** @rva 0x18F43E0  public float GetResultGaugeValue(float gaugeValue, float speed) { } */
    GetResultGaugeValue(gaugeValue: float, speed: float): float { return notPorted("HasteAbilityEffect.GetResultGaugeValue", 0x18F43E0); }
    /** @rva 0x18F4140 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("HasteAbilityEffect.GetAIFilteredTargets", 0x18F4140); }
    /** @rva 0x18F44A0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("HasteAbilityEffect.SelectTargetInAIAction", 0x18F44A0); }
    /** @rva 0x18F4B50  internal static IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterWithLastTurnOrder|6_1(IEnumerable<BattleUnit> candidateUnits) { } */
    static $SelectTargetInAIAction$g__UnitFilterWithLastTurnOrder_6_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("HasteAbilityEffect.<SelectTargetInAIAction>g__UnitFilterWithLastTurnOrder|6_1", 0x18F4B50); }
}
