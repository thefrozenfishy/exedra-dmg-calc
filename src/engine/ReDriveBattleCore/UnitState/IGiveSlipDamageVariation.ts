// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal, IEnumerable } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.IGiveSlipDamageVariation  (TypeDefIndex 725, public interface) ----
export interface IGiveSlipDamageVariation {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract bool IsTarget(UnitStateBase state); */
    IsTarget(state: UnitStateBase): boolean;
    /** @rva -1 slot 2  public abstract Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue); */
    GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal;
    /** @rva 0x16D1F60 slot 3  public virtual IEnumerable<BattleUnit> UnitFilterWithMaxSlipDamage(IEnumerable<BattleUnit> candidateUnits) { } */
    UnitFilterWithMaxSlipDamage(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit>;
}
