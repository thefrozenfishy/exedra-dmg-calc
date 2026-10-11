// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.AbilityEffect.ZoneAbilityEffectBase  (TypeDefIndex 1228, public abstract class) ----
export abstract class ZoneAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected int zoneUnitStatePatternId */
    zoneUnitStatePatternId: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x19000A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.zoneUnitStatePatternId = info._EffectValue1;
        return this;
    }
    /** @rva 0x1905A80 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void { return notPorted("ZoneAbilityEffectBase.SelectTargets", 0x1905A80); }
    /** @rva 0x1905840  protected bool CanRemoveZone(BattleUnit targetUnit, int targetPatternId = 0) { } */
    CanRemoveZone(targetUnit: BattleUnit, targetPatternId?: int /* = 0 */): boolean { return notPorted("ZoneAbilityEffectBase.CanRemoveZone", 0x1905840); }
    /** @rva 0x19058C0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("ZoneAbilityEffectBase.SelectTargetInAIAction", 0x19058C0); }
}
