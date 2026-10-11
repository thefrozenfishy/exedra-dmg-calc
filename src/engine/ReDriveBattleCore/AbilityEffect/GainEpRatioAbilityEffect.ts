// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { GainEpAbilityEffectBase } from "./GainEpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.GainEpRatioAbilityEffect  (TypeDefIndex 1187, public class) ----
export class GainEpRatioAbilityEffect extends GainEpAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18F20E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.effectValue = info._EffectValue1;
        return this;
    }
    /** @rva 0x18F35C0 slot 8  public override float GetGainPoint(BattleUnit targetUnit) { } */
    GetGainPoint(targetUnit: BattleUnit): float {
        return f32(f32(this.effectValue * targetUnit._MaxEP) / 1000);
    }
}
