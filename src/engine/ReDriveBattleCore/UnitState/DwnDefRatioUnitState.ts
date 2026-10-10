// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownDefenseUnitStateBase } from "./DownDefenseUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnDefRatioUnitState  (TypeDefIndex 597, public class) ----
export class DwnDefRatioUnitState extends DownDefenseUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15BBF20  public float get_DownRatio() { } */
    get_DownRatio(): float { return notPorted("DwnDefRatioUnitState.get_DownRatio", 0x15BBF20); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnDefRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnDefRatioUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BCC90 slot 30  public override Decimal GetDefVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetDefVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("DwnDefRatioUnitState.GetDefVariationValue", 0x15BCC90); }
}
