// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { RegainUnitStateBase } from "./RegainUnitStateBase";

// ---- ReDriveBattleCore.UnitState.RegainAtkUnitState  (TypeDefIndex 653, public class) ----
export class RegainAtkUnitState extends RegainUnitStateBase {
    /** @rva 0x16E2240  public void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15C8940  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.recoveryRatio = info._EffectValue1;
        this.recoveryFixed = info._EffectValue2;
        return this;
    }
    /** @rva 0x16EABA0 slot 26  public override Decimal GetParameterValue(BattleUnit sourceUnit) { } */
    GetParameterValue(sourceUnit: BattleUnit): Decimal { return sourceUnit.GetProcessedAtkDecimal(); }
}
