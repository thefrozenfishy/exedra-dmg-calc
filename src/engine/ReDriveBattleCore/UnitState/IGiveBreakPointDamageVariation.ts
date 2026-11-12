// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal, IEnumerable } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AdditionType } from "./AdditionType";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.IGiveBreakPointDamageVariation  (TypeDefIndex 756, public interface) ----
export interface IGiveBreakPointDamageVariation extends IRequiredStateForDecide {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract Decimal GetDamageVariationValue(Decimal damageValue, Decimal processingValue); */
    GetDamageVariationValue(damageValue: Decimal, processingValue: Decimal): Decimal;
    /** @rva 0x1719EB0 slot 2  public virtual Decimal GetDamageVariationValue(Decimal damageValue, Decimal processingValue, IEnumerable<UnitStateBase> defenceUnitStates, SkillType skillType) { } */
    GetDamageVariationValue$4?(damageValue: Decimal, processingValue: Decimal, defenceUnitStates: IEnumerable<UnitStateBase>, skillType: SkillType): Decimal;
}

/**
 * Interface slot 2 call (default interface method, 3.24.0). A class that implements the 4-argument overload
 * (DriveUpBreakPointDamageUnitStateBase) answers itself; every other class gets the default body at 0x1719EB0,
 * which calls slot 1 (the 2-argument overload) and ignores defenceUnitStates / skillType.
 */
export function IGiveBreakPointDamageVariation$GetDamageVariationValue$4(self: IGiveBreakPointDamageVariation, damageValue: Decimal, processingValue: Decimal, defenceUnitStates: IEnumerable<UnitStateBase>, skillType: SkillType): Decimal {
    if (typeof self.GetDamageVariationValue$4 === "function") return self.GetDamageVariationValue$4(damageValue, processingValue, defenceUnitStates, skillType);
    return self.GetDamageVariationValue(damageValue, processingValue); // slot 1
}
