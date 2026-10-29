// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { TurnUnitAct } from "./TurnUnitAct";

// ---- ReDriveBattleCore.Act.ComboTurnUnitAct  (TypeDefIndex 1107, public class) ----
export class ComboTurnUnitAct extends TurnUnitAct {
    /** 0x38 private int <ActionStep>k__BackingField */
    _ActionStep: int = 0;
    get ActionStep(): int { return this.get_ActionStep(); }
    set ActionStep(v: int) { this.set_ActionStep(v); }
    /** @rva 0x75EDA0  public int get_ActionStep() { } */
    get_ActionStep(): int { return this._ActionStep; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_ActionStep(int value) { } */
    set_ActionStep(value: int): void { this._ActionStep = value; /* auto-property */ }
    /** @rva 0x190AA40  public void .ctor() { } */
    ctor(): this { return super.ctor(); /* folded: ActBase..ctor */ }
}
