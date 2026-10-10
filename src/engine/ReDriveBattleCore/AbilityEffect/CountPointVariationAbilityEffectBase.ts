// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.CountPointVariationAbilityEffectBase  (TypeDefIndex 1165, public abstract class) ----
export abstract class CountPointVariationAbilityEffectBase extends AbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("CountPointVariationAbilityEffectBase..ctor", 0x18EB3C0); }
    /** @rva 0x18EE3B0  protected void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("CountPointVariationAbilityEffectBase..ctor", 0x18EE3B0); }
    /** @rva -1 slot 8  protected abstract int GetModifyCountPoint(); */
    abstract GetModifyCountPoint(): int;
    /** @rva 0x18EE190 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("CountPointVariationAbilityEffectBase.Triggering", 0x18EE190); }
    /** @rva 0x18EDE80 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("CountPointVariationAbilityEffectBase.SelectTargetInAIAction", 0x18EDE80); }
}
