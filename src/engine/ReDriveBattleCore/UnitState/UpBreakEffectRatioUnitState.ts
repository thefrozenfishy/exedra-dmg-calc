// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpBreakEffectUnitStateBase } from "./UpBreakEffectUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpBreakEffectRatioUnitState  (TypeDefIndex 760, public class) ----
export class UpBreakEffectRatioUnitState extends UpBreakEffectUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("UpBreakEffectRatioUnitState.get_UpRatio", 0x15BBF20); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpBreakEffectRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpBreakEffectRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E1000 slot 30  public override Decimal GetBreakEffectVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetBreakEffectVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpBreakEffectRatioUnitState.GetBreakEffectVariationValue", 0x16E1000); }
}
