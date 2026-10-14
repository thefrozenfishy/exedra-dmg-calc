// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IBattleStartTriggerPriority_Define } from "../IBattleStartTriggerPriority";
import { notPorted } from "../../runtime";
import type { float, int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { IBattleStartTriggerPriority } from "../IBattleStartTriggerPriority";
import type { IEffectValueVariation } from "./IEffectValueVariation";
import { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.EffectValueVariationUnitStateBase  (TypeDefIndex 623, public abstract class) ----
export abstract class EffectValueVariationUnitStateBase extends UnitStateBase {  // implements IEffectValueVariation, IBattleStartTriggerPriority
    static readonly __interfaces: readonly string[] = ['IEffectValueVariation', 'IBattleStartTriggerPriority'];
    get IBattleStartTriggerPriority$Priority(): int { return this.get_IBattleStartTriggerPriority$Priority(); }
    /** @rva 0x15BF350 slot 26  private int ReDriveBattleCore.IBattleStartTriggerPriority.get_Priority() { } */
    get_IBattleStartTriggerPriority$Priority(): int { return IBattleStartTriggerPriority_Define.EffectValueVariationUnitStatePriority; }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B3AA0  protected void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva -1 slot 27  public abstract float GetEffectValueVariationRate(UnitStateBase targetState); */
    abstract GetEffectValueVariationRate(targetState: UnitStateBase): float;
}
