// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { UnableActionUnitStateBase } from "./UnableActionUnitStateBase";

// ---- ReDriveBattleCore.UnitState.StunUnitState  (TypeDefIndex 511, public class) ----
export class StunUnitState extends UnableActionUnitStateBase {
    /** @rva 0x15C0A70 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "stun";
    }
    /** @rva 0x15C0A40 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_statehit_004";
    }
    /** @rva 0x15C0A10 slot 14  public override string get_AlwaysVisualEffectName() { } */
    get_AlwaysVisualEffectName(): string {
        return "eff_cmn_act_state_stun_002";
    }
    /** @rva 0x15C0960  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C09B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15C0850 slot 19  public override void OnRemovingFromCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnRemovingFromCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void { return notPorted("StunUnitState.OnRemovingFromCondition", 0x15C0850); }
}

// ---- ReDriveBattleCore.UnitState.StunUnitState.Define  (TypeDefIndex 510, private static class) ----
export class StunUnitState_Define {
    /** 0x0 public static readonly int AddRepeatStunParryRate */
    static AddRepeatStunParryRate: int = 0;
    /** 0x4 public static readonly int MaxRepeatStunParryRate */
    static MaxRepeatStunParryRate: int = 0;
    /** @rva 0x15B8150  private static void .cctor() { } */
    static cctor(): void { return notPorted("StunUnitState_Define..cctor", 0x15B8150); }
}
