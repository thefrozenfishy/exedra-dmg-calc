// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AdditionalSkillActAbilityEffectBase } from "./AdditionalSkillActAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { ActBase_Define } from "../Act/ActBase";
import { AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType } from "./AdditionalSkillActAbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalCountdownZeroSkillActAbilityEffect  (TypeDefIndex 1140, public class) ----
export class AdditionalCountdownZeroSkillActAbilityEffect extends AdditionalSkillActAbilityEffectBase {
    /** @rva 0x18EA2F0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.priority = ActBase_Define.AdditionalSkillDefaultPriority;
        super.ctor$AbilityEffectInfo(info);
        this.skillMstId = info._EffectValue1;
        this.additionalSkillTargetType = info._EffectValue2 as AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType;
        this.priority = ActBase_Define.CountdownAdditionalSkillActPriority;
        return this;
    }
    /** @rva 0x18EA100 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("AdditionalCountdownZeroSkillActAbilityEffect.Triggering", 0x18EA100); }
}
