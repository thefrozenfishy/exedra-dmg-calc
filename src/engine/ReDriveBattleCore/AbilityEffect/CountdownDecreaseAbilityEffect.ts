// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { SoloRaidGameDirector } from "../SoloRaidGameDirector";
import { CountdownStartUnitState } from "../UnitState/CountdownStartUnitState";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.CountdownDecreaseAbilityEffect  (TypeDefIndex 1163, public class) ----
export class CountdownDecreaseAbilityEffect extends AbilityEffectBase {
    /** @rva 0x18EB3B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x18EE3D0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        if (!userUnit._Condition._StateList.some(state => state instanceof CountdownStartUnitState)) return null!; // <>c.b__1_0
        const bundle = new AffectedUnitNoticeBundle().ctor();
        if (gameDirector instanceof SoloRaidGameDirector) gameDirector.DecreaseCountdown();
        return bundle;
    }
}
