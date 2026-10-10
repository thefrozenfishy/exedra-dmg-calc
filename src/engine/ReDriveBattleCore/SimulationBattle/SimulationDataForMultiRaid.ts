// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";

// ---- ReDriveBattleCore.SimulationBattle.SimulationDataForMultiRaid  (TypeDefIndex 820, public class) ----
export class SimulationDataForMultiRaid {
    /** 0x10 private List<int> <BonusPassiveSkillMstIds>k__BackingField */
    _BonusPassiveSkillMstIds: List<int> = null!;
    /** 0x18 private int <RoundLimit>k__BackingField */
    _RoundLimit: int = 0;
    get BonusPassiveSkillMstIds(): List<int> { return this.get_BonusPassiveSkillMstIds(); }
    set BonusPassiveSkillMstIds(v: List<int>) { this.set_BonusPassiveSkillMstIds(v); }
    get RoundLimit(): int { return this.get_RoundLimit(); }
    set RoundLimit(v: int) { this.set_RoundLimit(v); }
    /** @rva 0x730C50  public List<int> get_BonusPassiveSkillMstIds() { } */
    get_BonusPassiveSkillMstIds(): List<int> { return this._BonusPassiveSkillMstIds; /* auto-property */ }
    /** @rva 0x730C60  public void set_BonusPassiveSkillMstIds(List<int> value) { } */
    set_BonusPassiveSkillMstIds(value: List<int>): void { this._BonusPassiveSkillMstIds = value; /* auto-property */ }
    /** @rva 0x763820  public int get_RoundLimit() { } */
    get_RoundLimit(): int { return this._RoundLimit; /* auto-property */ }
    /** @rva 0x8A2240  public void set_RoundLimit(int value) { } */
    set_RoundLimit(value: int): void { this._RoundLimit = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
