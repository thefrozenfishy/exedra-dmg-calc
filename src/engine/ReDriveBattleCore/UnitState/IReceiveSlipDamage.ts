// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { float } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.UnitState.IReceiveSlipDamage  (TypeDefIndex 519, public interface) ----
export interface IReceiveSlipDamage {
    readonly AttackElement: TargetElementType;
    readonly SlipDamageVisualEffectName: string;
    readonly SkipDamageOnTurnBegin: boolean;
    /** @rva -1 slot 0  public abstract float GetSlipDamageValue(BattleUnit attackUnit, BattleUnit defenseUnit, BattleType battleType, bool isImmediately); */
    GetSlipDamageValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, battleType: BattleType, isImmediately: boolean): float;
}
