// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { CompareContent } from "../BattleCondition/CompareContent";
import type { CompareOperator } from "../BattleCondition/CompareOperator";
import type { CompareTarget } from "../BattleCondition/CompareTarget";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.BattleConditionMstModel  (TypeDefIndex 877, public class) ----
export class BattleConditionMstModel extends MstModelBase<any /* BattleConditionMstRecord */> {
    get Id(): int { return this.get_Id(); }
    get Description(): string { return this.get_Description(); }
    get CompareTarget(): CompareTarget { return this.get_CompareTarget(); }
    get CompareContent(): CompareContent { return this.get_CompareContent(); }
    get CompareOperator(): CompareOperator { return this.get_CompareOperator(); }
    get CompareValue(): string { return this.get_CompareValue(); }
    /** @rva 0x16CBF30  public void .ctor(BattleConditionMstRecord record) { } */
    ctor$BattleConditionMstRecord(record: any /* BattleConditionMstRecord */): this { return notPorted("BattleConditionMstModel..ctor", 0x16CBF30); }
    /** @rva 0x901770  public int get_Id() { } */
    get_Id(): int { return notPorted("BattleConditionMstModel.get_Id", 0x901770); }
    /** @rva 0x85E540  public string get_Description() { } */
    get_Description(): string { return notPorted("BattleConditionMstModel.get_Description", 0x85E540); }
    /** @rva 0xA0D840  public CompareTarget get_CompareTarget() { } */
    get_CompareTarget(): CompareTarget { return notPorted("BattleConditionMstModel.get_CompareTarget", 0xA0D840); }
    /** @rva 0xA0E7D0  public CompareContent get_CompareContent() { } */
    get_CompareContent(): CompareContent { return notPorted("BattleConditionMstModel.get_CompareContent", 0xA0E7D0); }
    /** @rva 0xA0E790  public CompareOperator get_CompareOperator() { } */
    get_CompareOperator(): CompareOperator { return notPorted("BattleConditionMstModel.get_CompareOperator", 0xA0E790); }
    /** @rva 0x7F9BC0  public string get_CompareValue() { } */
    get_CompareValue(): string { return notPorted("BattleConditionMstModel.get_CompareValue", 0x7F9BC0); }
}
