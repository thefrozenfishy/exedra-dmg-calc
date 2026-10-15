// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { EnemyMstModel } from "../Model/EnemyMstModel";
import type { EnemyMstRecord } from "../../Network/Definition/QuestOutGame/EnemyMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.EnemyMstReader  (TypeDefIndex 853, public class) ----
export class EnemyMstReader extends BattleMstReaderBase<EnemyMstModel, EnemyMstRecord, int> {
    /** @rva 0x16FB9D0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
