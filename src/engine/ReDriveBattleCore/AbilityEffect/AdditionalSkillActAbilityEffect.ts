// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { AdditionalSkillActAbilityEffectBase } from "./AdditionalSkillActAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { ActBase_Define } from "../Act/ActBase";
import { AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType } from "./AdditionalSkillActAbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalSkillActAbilityEffect  (TypeDefIndex 1136, public class) ----
export class AdditionalSkillActAbilityEffect extends AdditionalSkillActAbilityEffectBase {
    /** @rva 0x1920A70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.priority = ActBase_Define.AdditionalSkillDefaultPriority;
        super.ctor$AbilityEffectInfo(info);
        this.skillMstId = info._EffectValue1;
        this.additionalSkillTargetType = info._EffectValue2 as AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType;
        return this;
    }
}
