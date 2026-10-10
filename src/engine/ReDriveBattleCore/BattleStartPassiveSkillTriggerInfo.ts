// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.BattleStartPassiveSkillTriggerInfo  (TypeDefIndex 414, public struct) ----
export class BattleStartPassiveSkillTriggerInfo {
    /** 0x0 public BattleUnit userUnit */
    userUnit: BattleUnit = null!;
    /** 0x8 public int psMstId */
    psMstId: int = 0;
    /** 0x10 public BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle */
    conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle = null!;
    /** 0x18 public AbilityEffectBase abilityEffect */
    abilityEffect: AbilityEffectBase = null!;
    get TriggerPriority(): int { return this.get_TriggerPriority(); }
    /** @rva 0x1490480  public int get_TriggerPriority() { } */
    get_TriggerPriority(): int { return notPorted("BattleStartPassiveSkillTriggerInfo.get_TriggerPriority", 0x1490480); }
}
