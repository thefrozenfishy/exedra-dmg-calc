// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.UniqueStatePatternMstModel  (TypeDefIndex 900, public class) ----
export class UniqueStatePatternMstModel extends MstModelBase<any /* UniqueStatePatternMstRecord */> {
    get UniqueStatePatternMstId(): int { return this.get_UniqueStatePatternMstId(); }
    get Name(): string { return this.get_Name(); }
    get StateFlipName(): string { return this.get_StateFlipName(); }
    get IconName(): string { return this.get_IconName(); }
    /** @rva 0x16DEC40  public void .ctor(UniqueStatePatternMstRecord record) { } */
    ctor$UniqueStatePatternMstRecord(record: any /* UniqueStatePatternMstRecord */): this { return notPorted("UniqueStatePatternMstModel..ctor", 0x16DEC40); }
    /** @rva 0x901770  public int get_UniqueStatePatternMstId() { } */
    get_UniqueStatePatternMstId(): int { return notPorted("UniqueStatePatternMstModel.get_UniqueStatePatternMstId", 0x901770); }
    /** @rva 0x85E540  public string get_Name() { } */
    get_Name(): string { return notPorted("UniqueStatePatternMstModel.get_Name", 0x85E540); }
    /** @rva 0x9017E0  public string get_StateFlipName() { } */
    get_StateFlipName(): string { return notPorted("UniqueStatePatternMstModel.get_StateFlipName", 0x9017E0); }
    /** @rva 0x116EC30  public string get_IconName() { } */
    get_IconName(): string { return notPorted("UniqueStatePatternMstModel.get_IconName", 0x116EC30); }
}
