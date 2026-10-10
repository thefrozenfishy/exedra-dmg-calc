// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, IEnumerable, List, float, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.SlowAbilityEffect  (TypeDefIndex 1226, public class) ----
export class SlowAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int slowRate */
    slowRate: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("SlowAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18ED6B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("SlowAbilityEffect..ctor", 0x18ED6B0); }
    /** @rva 0x1900F80 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("SlowAbilityEffect.Triggering", 0x1900F80); }
    /** @rva 0x1900B20  public float GetResultGaugeValue(float gaugeValue, float speed) { } */
    GetResultGaugeValue(gaugeValue: float, speed: float): float { return notPorted("SlowAbilityEffect.GetResultGaugeValue", 0x1900B20); }
    /** @rva 0x1900BE0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("SlowAbilityEffect.SelectTargetInAIAction", 0x1900BE0); }
    /** @rva 0x1901290  internal static IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterWithFirstTurnOrder|5_1(IEnumerable<BattleUnit> candidateUnits) { } */
    static $SelectTargetInAIAction$g__UnitFilterWithFirstTurnOrder_5_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("SlowAbilityEffect.<SelectTargetInAIAction>g__UnitFilterWithFirstTurnOrder|5_1", 0x1901290); }
}
