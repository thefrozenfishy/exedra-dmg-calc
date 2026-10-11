// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
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
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("GainSoloRaidBuffPointAbilityEffect.Triggering", 0x18F35F0); }
}
