// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted, trunc } from "../../runtime";
import type { int } from "../../runtime";
import { LoseEpAbilityEffectBase } from "./LoseEpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.LoseEpRatioAbilityEffect  (TypeDefIndex 1191, public class) ----
export class LoseEpRatioAbilityEffect extends LoseEpAbilityEffectBase {
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192ADF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.effectValue = info._EffectValue1;
        return this;
    }
    /** @rva 0x192B600 slot 8  public override int GetLosePoint(BattleUnit targetUnit) { } */
    GetLosePoint(targetUnit: BattleUnit): int {
        return trunc(f32(f32(this.effectValue * targetUnit._MaxEP) / 1000));
    }
}
