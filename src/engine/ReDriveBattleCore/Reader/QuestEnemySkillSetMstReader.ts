// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { QuestEnemySkillSetMstModel } from "../Model/QuestEnemySkillSetMstModel";
import type { QuestEnemySkillSetMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemySkillSetMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.QuestEnemySkillSetMstReader  (TypeDefIndex 863, public class) ----
export class QuestEnemySkillSetMstReader extends BattleMstReaderBase<QuestEnemySkillSetMstModel, QuestEnemySkillSetMstRecord, int> {
    /** @rva 0x16D5750  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
