// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.SoloRaidPartyBuffMstModel  (TypeDefIndex 896, public class) ----
export class SoloRaidPartyBuffMstModel extends MstModelBase<any /* SoloRaidPartyBuffMstRecord */> {
    get SoloRaidPartyBuffMstId(): int { return this.get_SoloRaidPartyBuffMstId(); }
    get GroupId(): int { return this.get_GroupId(); }
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get BuffPointChargePassiveSkillMstId(): int { return this.get_BuffPointChargePassiveSkillMstId(); }
    /** @rva 0x16D86C0  public void .ctor(SoloRaidPartyBuffMstRecord record) { } */
    ctor$SoloRaidPartyBuffMstRecord(record: any /* SoloRaidPartyBuffMstRecord */): this { return notPorted("SoloRaidPartyBuffMstModel..ctor", 0x16D86C0); }
    /** @rva 0x901770  public int get_SoloRaidPartyBuffMstId() { } */
    get_SoloRaidPartyBuffMstId(): int { return notPorted("SoloRaidPartyBuffMstModel.get_SoloRaidPartyBuffMstId", 0x901770); }
    /** @rva 0x901790  public int get_GroupId() { } */
    get_GroupId(): int { return notPorted("SoloRaidPartyBuffMstModel.get_GroupId", 0x901790); }
    /** @rva 0x902C70  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return notPorted("SoloRaidPartyBuffMstModel.get_PassiveSkillMstId", 0x902C70); }
    /** @rva 0x902C50  public int get_BuffPointChargePassiveSkillMstId() { } */
    get_BuffPointChargePassiveSkillMstId(): int { return notPorted("SoloRaidPartyBuffMstModel.get_BuffPointChargePassiveSkillMstId", 0x902C50); }
}
