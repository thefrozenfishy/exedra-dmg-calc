// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.ResetUniqueBuffDebuffAbilityEffectBase  (TypeDefIndex 1207, public abstract class) ----
export abstract class ResetUniqueBuffDebuffAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected int uniqueStatePatternMstId */
    uniqueStatePatternMstId: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("ResetUniqueBuffDebuffAbilityEffectBase..ctor", 0x18EB3C0); }
    /** @rva 0x19000A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ResetUniqueBuffDebuffAbilityEffectBase..ctor", 0x19000A0); }
    /** @rva 0x1900190 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("ResetUniqueBuffDebuffAbilityEffectBase.Triggering", 0x1900190); }
    /** @rva -1 slot 8  public abstract bool IsRemovable(UnitStateBase state); */
    abstract IsRemovable(state: UnitStateBase): boolean;
    /** @rva 0x18FF0A0  private bool <Triggering>b__3_0(UnitStateBase state) { } */
    $Triggering$b__3_0(state: UnitStateBase): boolean { return notPorted("ResetUniqueBuffDebuffAbilityEffectBase.<Triggering>b__3_0", 0x18FF0A0); }
}
