// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.SkillDetailMstModel  (TypeDefIndex 894, public class) ----
export class SkillDetailMstModel extends MstModelBase<any /* SkillDetailMstRecord */> {
    get SkillDetailMstId(): int { return this.get_SkillDetailMstId(); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    get AbilityEffectType(): string { return this.get_AbilityEffectType(); }
    get Element(): int { return this.get_Element(); }
    get Turn(): int { return this.get_Turn(); }
    get RemainCount(): int { return this.get_RemainCount(); }
    get Range(): int { return this.get_Range(); }
    get Probability(): int { return this.get_Probability(); }
    get IsFixedProbability(): boolean { return this.get_IsFixedProbability(); }
    get Value1(): int { return this.get_Value1(); }
    get Value2(): int { return this.get_Value2(); }
    get Value3(): int { return this.get_Value3(); }
    get Value4(): int { return this.get_Value4(); }
    get Value5(): int { return this.get_Value5(); }
    get Description(): string { return this.get_Description(); }
    get DescriptionType(): int { return this.get_DescriptionType(); }
    get Role(): int { return this.get_Role(); }
    get StartConditionSetIdCsv(): string { return this.get_StartConditionSetIdCsv(); }
    get ActiveConditionSetIdCsv(): string { return this.get_ActiveConditionSetIdCsv(); }
    /** @rva 0x16D7F20  public void .ctor(SkillDetailMstRecord record) { } */
    ctor$SkillDetailMstRecord(record: any /* SkillDetailMstRecord */): this { return notPorted("SkillDetailMstModel..ctor", 0x16D7F20); }
    /** @rva 0x901770  public int get_SkillDetailMstId() { } */
    get_SkillDetailMstId(): int { return notPorted("SkillDetailMstModel.get_SkillDetailMstId", 0x901770); }
    /** @rva 0x901790  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return notPorted("SkillDetailMstModel.get_SkillMstId", 0x901790); }
    /** @rva 0x85E540  public string get_AbilityEffectType() { } */
    get_AbilityEffectType(): string { return notPorted("SkillDetailMstModel.get_AbilityEffectType", 0x85E540); }
    /** @rva 0xA0E810  public int get_Element() { } */
    get_Element(): int { return notPorted("SkillDetailMstModel.get_Element", 0xA0E810); }
    /** @rva 0x16CBED0  public int get_Turn() { } */
    get_Turn(): int { return notPorted("SkillDetailMstModel.get_Turn", 0x16CBED0); }
    /** @rva 0x16D31F0  public int get_RemainCount() { } */
    get_RemainCount(): int { return notPorted("SkillDetailMstModel.get_RemainCount", 0x16D31F0); }
    /** @rva 0x16D7FB0  public int get_Range() { } */
    get_Range(): int { return notPorted("SkillDetailMstModel.get_Range", 0x16D7FB0); }
    /** @rva 0x9019A0  public int get_Probability() { } */
    get_Probability(): int { return notPorted("SkillDetailMstModel.get_Probability", 0x9019A0); }
    /** @rva 0x16D7F90  public bool get_IsFixedProbability() { } */
    get_IsFixedProbability(): boolean { return notPorted("SkillDetailMstModel.get_IsFixedProbability", 0x16D7F90); }
    /** @rva 0xA0D840  public int get_Value1() { } */
    get_Value1(): int { return notPorted("SkillDetailMstModel.get_Value1", 0xA0D840); }
    /** @rva 0xA0E7D0  public int get_Value2() { } */
    get_Value2(): int { return notPorted("SkillDetailMstModel.get_Value2", 0xA0E7D0); }
    /** @rva 0xA0E790  public int get_Value3() { } */
    get_Value3(): int { return notPorted("SkillDetailMstModel.get_Value3", 0xA0E790); }
    /** @rva 0xA0E7B0  public int get_Value4() { } */
    get_Value4(): int { return notPorted("SkillDetailMstModel.get_Value4", 0xA0E7B0); }
    /** @rva 0x901940  public int get_Value5() { } */
    get_Value5(): int { return notPorted("SkillDetailMstModel.get_Value5", 0x901940); }
    /** @rva 0x16D7F70  public string get_Description() { } */
    get_Description(): string { return notPorted("SkillDetailMstModel.get_Description", 0x16D7F70); }
    /** @rva 0x16D0B20  public int get_DescriptionType() { } */
    get_DescriptionType(): int { return notPorted("SkillDetailMstModel.get_DescriptionType", 0x16D0B20); }
    /** @rva 0x901960  public int get_Role() { } */
    get_Role(): int { return notPorted("SkillDetailMstModel.get_Role", 0x901960); }
    /** @rva 0x16D3210  public string get_StartConditionSetIdCsv() { } */
    get_StartConditionSetIdCsv(): string { return notPorted("SkillDetailMstModel.get_StartConditionSetIdCsv", 0x16D3210); }
    /** @rva 0x16D31D0  public string get_ActiveConditionSetIdCsv() { } */
    get_ActiveConditionSetIdCsv(): string { return notPorted("SkillDetailMstModel.get_ActiveConditionSetIdCsv", 0x16D31D0); }
}
