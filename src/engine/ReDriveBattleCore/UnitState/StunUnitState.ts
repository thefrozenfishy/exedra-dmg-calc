// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { QuestEnemyAppearanceParameter } from "../QuestEnemyAppearanceParameter";
import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { UnableActionUnitStateBase } from "./UnableActionUnitStateBase";

// ---- ReDriveBattleCore.UnitState.StunUnitState  (TypeDefIndex 511, public class) ----
export class StunUnitState extends UnableActionUnitStateBase {
    /** @rva 0x15E6340 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "stun";
    }
    /** @rva 0x15E6310 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_statehit_004";
    }
    /** @rva 0x15E62E0 slot 14  public override string get_AlwaysVisualEffectName() { } */
    get_AlwaysVisualEffectName(): string {
        return "eff_cmn_act_state_stun_002";
    }
    /** @rva 0x15E6230  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15E6280  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15E6120 slot 19  public override void OnRemovingFromCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnRemovingFromCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void {
        if (unit.get_Param() instanceof QuestEnemyAppearanceParameter) {
            const condition = unit._Condition;
            condition._RepeatStunParryRate = Math.min(StunUnitState_Define.AddRepeatStunParryRate + condition._RepeatStunParryRate, StunUnitState_Define.MaxRepeatStunParryRate);
        }
    }
}

// ---- ReDriveBattleCore.UnitState.StunUnitState.Define  (TypeDefIndex 510, private static class) ----
export class StunUnitState_Define {
    /** 0x0 public static readonly int AddRepeatStunParryRate */
    static AddRepeatStunParryRate: int = 0;
    /** 0x4 public static readonly int MaxRepeatStunParryRate */
    static MaxRepeatStunParryRate: int = 0;
    /** @rva 0x15DE460  private static void .cctor() { } */
    static cctor(): void {
        StunUnitState_Define.AddRepeatStunParryRate = 25;
        StunUnitState_Define.MaxRepeatStunParryRate = 80;
    }
}

StunUnitState_Define.cctor(); // C# static constructor