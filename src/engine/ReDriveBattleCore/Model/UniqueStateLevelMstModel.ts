// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.UniqueStateLevelMstModel  (TypeDefIndex 899, public class) ----
export class UniqueStateLevelMstModel extends MstModelBase<any /* UniqueStateLevelMstRecord */> {
    get UniqueStateLevelMstId(): int { return this.get_UniqueStateLevelMstId(); }
    get GroupId(): int { return this.get_GroupId(); }
    get Level(): int { return this.get_Level(); }
    get ConditionCount(): int { return this.get_ConditionCount(); }
    /** @rva 0x16DEBB0  public void .ctor(UniqueStateLevelMstRecord record) { } */
    ctor$UniqueStateLevelMstRecord(record: any /* UniqueStateLevelMstRecord */): this { return notPorted("UniqueStateLevelMstModel..ctor", 0x16DEBB0); }
    /** @rva 0x901770  public int get_UniqueStateLevelMstId() { } */
    get_UniqueStateLevelMstId(): int { return notPorted("UniqueStateLevelMstModel.get_UniqueStateLevelMstId", 0x901770); }
    /** @rva 0x901790  public int get_GroupId() { } */
    get_GroupId(): int { return notPorted("UniqueStateLevelMstModel.get_GroupId", 0x901790); }
    /** @rva 0x902C70  public int get_Level() { } */
    get_Level(): int { return notPorted("UniqueStateLevelMstModel.get_Level", 0x902C70); }
    /** @rva 0x902C50  public int get_ConditionCount() { } */
    get_ConditionCount(): int { return notPorted("UniqueStateLevelMstModel.get_ConditionCount", 0x902C50); }
}
