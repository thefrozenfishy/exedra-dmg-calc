// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { SoloRaidGameDirector } from "../SoloRaidGameDirector";
import { GainSoloRaidBuffPointNotice } from "../GainSoloRaidBuffPointNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.GainSoloRaidBuffPointAbilityEffect  (TypeDefIndex 1192, public class) ----
export class GainSoloRaidBuffPointAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int gainPoint */
    gainPoint: int = 0;
    /** 0x68 protected string IconName */
    IconName: string = null!;
    /** @rva 0x18F3950  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.gainPoint = info._EffectValue1;
        this.IconName = info._SkillButtonIcon;
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva 0x18F35F0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        if (!(gameDirector instanceof SoloRaidGameDirector)) return bundle;
        let point = 0;
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            point += this.gainPoint;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        if (point === 0) return bundle;
        gameDirector.soloRaidBuffReferee.AddPoint(point);
        const notice = new GainSoloRaidBuffPointNotice().ctor$string_int_int_AbilitySourceType(this.IconName, point, gameDirector.soloRaidBuffReferee.currentSeasonBuffPoint, this._AbilitySource);
        bundle._GainSoloRaidBuffPointNoticeList.push(notice);
        return bundle;
    }
}
