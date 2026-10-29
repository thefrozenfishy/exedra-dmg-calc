// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.StateIconData  (TypeDefIndex 480, public class) ----
export class StateIconData {
    /** 0x10 public string IconName */
    IconName: string = null!;
    /** 0x18 public int StateCount */
    StateCount: int = 0;
    /** 0x1C public int RemainingTurn */
    RemainingTurn: int = 0;
    /** 0x20 public int RemainCount */
    RemainCount: int = 0;
    /** 0x24 public int Priority */
    Priority: int = 0;
    /** 0x28 public bool IsShowStateCountZeroIfZero */
    IsShowStateCountZeroIfZero: boolean = false;
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x15CEEC0  public void .ctor(UnitStateBase state, int stateCount, bool isShowStateCountZeroIfZero) { } */
    ctor$UnitStateBase_int_bool(state: UnitStateBase, stateCount: int, isShowStateCountZeroIfZero: boolean): this {
        if (state == null) return this;
        this.IconName = state.get_IconName();
        this.StateCount = stateCount;
        this.RemainingTurn = state._RemainingTurn;
        this.RemainCount = state._RemainCount;
        this.Priority = state.get_IconPriority();
        this.IsShowStateCountZeroIfZero = isShowStateCountZeroIfZero;
        return this;
    }
}
