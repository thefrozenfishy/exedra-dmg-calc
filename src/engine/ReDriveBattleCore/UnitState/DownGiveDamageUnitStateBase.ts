// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DamageWorseUnitStateBase } from "./DamageWorseUnitStateBase";
import type { IGiveDamageVariation } from "./IGiveDamageVariation";

// ---- ReDriveBattleCore.UnitState.DownGiveDamageUnitStateBase  (TypeDefIndex 572, public abstract class) ----
export abstract class DownGiveDamageUnitStateBase extends DamageWorseUnitStateBase {  // implements IGiveDamageVariation
    static readonly __interfaces: readonly string[] = ['IGiveDamageVariation'];
    /** @rva 0x15BAA80 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownGiveDamageUnitStateBase.get_IconName", 0x15BAA80); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownGiveDamageUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownGiveDamageUnitStateBase..ctor", 0x15B5240); }
    /** @rva 0x15BA790 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownGiveDamageUnitStateBase.GetUnitFilterFuncOrder", 0x15BA790); }
}
