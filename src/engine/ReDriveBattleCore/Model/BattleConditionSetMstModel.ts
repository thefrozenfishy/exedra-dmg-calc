// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.BattleConditionSetMstModel  (TypeDefIndex 878, public class) ----
export class BattleConditionSetMstModel extends MstModelBase<any /* BattleConditionSetMstRecord */> {
    get Id(): int { return this.get_Id(); }
    get Description(): string { return this.get_Description(); }
    get BattleConditionMstIdCsv(): string { return this.get_BattleConditionMstIdCsv(); }
    /** @rva 0x16CBFC0  public void .ctor(BattleConditionSetMstRecord record) { } */
    ctor$BattleConditionSetMstRecord(record: any /* BattleConditionSetMstRecord */): this { return notPorted("BattleConditionSetMstModel..ctor", 0x16CBFC0); }
    /** @rva 0x901770  public int get_Id() { } */
    get_Id(): int { return notPorted("BattleConditionSetMstModel.get_Id", 0x901770); }
    /** @rva 0x85E540  public string get_Description() { } */
    get_Description(): string { return notPorted("BattleConditionSetMstModel.get_Description", 0x85E540); }
    /** @rva 0x9017E0  public string get_BattleConditionMstIdCsv() { } */
    get_BattleConditionMstIdCsv(): string { return notPorted("BattleConditionSetMstModel.get_BattleConditionMstIdCsv", 0x9017E0); }
}
