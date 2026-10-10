// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { AdditionalSkillActAbilityEffectBase } from "./AdditionalSkillActAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalSkillActAbilityEffect  (TypeDefIndex 1136, public class) ----
export class AdditionalSkillActAbilityEffect extends AdditionalSkillActAbilityEffectBase {
    /** @rva 0x18EB030  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("AdditionalSkillActAbilityEffect..ctor", 0x18EB030); }
}
