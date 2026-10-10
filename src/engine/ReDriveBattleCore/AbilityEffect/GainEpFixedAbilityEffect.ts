// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { GainEpAbilityEffectBase } from "./GainEpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.AbilityEffect.GainEpFixedAbilityEffect  (TypeDefIndex 1186, public class) ----
export class GainEpFixedAbilityEffect extends GainEpAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("GainEpFixedAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18F20E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("GainEpFixedAbilityEffect..ctor", 0x18F20E0); }
    /** @rva 0x18F35B0 slot 8  public override float GetGainPoint(BattleUnit targetUnit) { } */
    GetGainPoint(targetUnit: BattleUnit): float { return notPorted("GainEpFixedAbilityEffect.GetGainPoint", 0x18F35B0); }
}
