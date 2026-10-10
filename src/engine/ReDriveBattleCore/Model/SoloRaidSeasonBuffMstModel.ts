// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.SoloRaidSeasonBuffMstModel  (TypeDefIndex 897, public class) ----
export class SoloRaidSeasonBuffMstModel extends MstModelBase<any /* SoloRaidSeasonBuffMstRecord */> {
    get SoloRaidSeasonBuffMstId(): int { return this.get_SoloRaidSeasonBuffMstId(); }
    get GroupId(): int { return this.get_GroupId(); }
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get EnhancedPassiveSkillMstId(): int { return this.get_EnhancedPassiveSkillMstId(); }
    get MaxBuffPoint(): int { return this.get_MaxBuffPoint(); }
    get MaxBuffPointOnEnhanced(): int { return this.get_MaxBuffPointOnEnhanced(); }
    get BuffPointChargePassiveSkillMstId(): int { return this.get_BuffPointChargePassiveSkillMstId(); }
    get EnhancedSkillTurnGaugeValue(): int { return this.get_EnhancedSkillTurnGaugeValue(); }
    /** @rva 0x16D8750  public void .ctor(SoloRaidSeasonBuffMstRecord record) { } */
    ctor$SoloRaidSeasonBuffMstRecord(record: any /* SoloRaidSeasonBuffMstRecord */): this { return notPorted("SoloRaidSeasonBuffMstModel..ctor", 0x16D8750); }
    /** @rva 0x901770  public int get_SoloRaidSeasonBuffMstId() { } */
    get_SoloRaidSeasonBuffMstId(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_SoloRaidSeasonBuffMstId", 0x901770); }
    /** @rva 0x901790  public int get_GroupId() { } */
    get_GroupId(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_GroupId", 0x901790); }
    /** @rva 0x902C70  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_PassiveSkillMstId", 0x902C70); }
    /** @rva 0x902C50  public int get_EnhancedPassiveSkillMstId() { } */
    get_EnhancedPassiveSkillMstId(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_EnhancedPassiveSkillMstId", 0x902C50); }
    /** @rva 0xA0D840  public int get_MaxBuffPoint() { } */
    get_MaxBuffPoint(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_MaxBuffPoint", 0xA0D840); }
    /** @rva 0xA0E7D0  public int get_MaxBuffPointOnEnhanced() { } */
    get_MaxBuffPointOnEnhanced(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_MaxBuffPointOnEnhanced", 0xA0E7D0); }
    /** @rva 0xA0E790  public int get_BuffPointChargePassiveSkillMstId() { } */
    get_BuffPointChargePassiveSkillMstId(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_BuffPointChargePassiveSkillMstId", 0xA0E790); }
    /** @rva 0xA0E7B0  public int get_EnhancedSkillTurnGaugeValue() { } */
    get_EnhancedSkillTurnGaugeValue(): int { return notPorted("SoloRaidSeasonBuffMstModel.get_EnhancedSkillTurnGaugeValue", 0xA0E7B0); }
}
