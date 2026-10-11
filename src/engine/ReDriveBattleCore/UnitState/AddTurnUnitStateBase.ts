// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { IBattleStartTriggerPriority } from "../IBattleStartTriggerPriority";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { IBattleStartTriggerPriority_Define } from "../IBattleStartTriggerPriority";

// ---- ReDriveBattleCore.UnitState.AddTurnUnitStateBase  (TypeDefIndex 523, public abstract class) ----
export abstract class AddTurnUnitStateBase extends UnitStateBase {  // implements IBuff, IBattleStartTriggerPriority
    static readonly __interfaces: readonly string[] = ['IBuff', 'IBattleStartTriggerPriority'];
    /** 0x88 private int <AddTurnNum>k__BackingField */
    _AddTurnNum: int = 0;
    get AddTurnNum(): int { return this.get_AddTurnNum(); }
    set AddTurnNum(v: int) { this.set_AddTurnNum(v); }
    get IBattleStartTriggerPriority$Priority(): int { return this.get_IBattleStartTriggerPriority$Priority(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15B4660 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_time";
    }
    /** @rva 0x15B4630 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x902530  public int get_AddTurnNum() { } */
    get_AddTurnNum(): int { return this._AddTurnNum; /* auto-property */ }
    /** @rva 0x902570  public void set_AddTurnNum(int value) { } */
    set_AddTurnNum(value: int): void { this._AddTurnNum = value; /* auto-property */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B3FF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._AddTurnNum = info._EffectValue1;
        return this;
    }
    /** @rva -1 slot 26  public abstract void AddTurnTo(UnitStateBase targetUnitState); */
    abstract AddTurnTo(targetUnitState: UnitStateBase): void;
    /** @rva 0x15B45E0 slot 25  private int ReDriveBattleCore.IBattleStartTriggerPriority.get_Priority() { } */
    get_IBattleStartTriggerPriority$Priority(): int {
        return IBattleStartTriggerPriority_Define.AddTurnUnitStatePriority;
    }
}
