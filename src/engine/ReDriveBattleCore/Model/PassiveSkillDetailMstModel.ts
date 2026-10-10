// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { ProcessTiming } from "../BattleCondition/ProcessTiming";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.PassiveSkillDetailMstModel  (TypeDefIndex 885, public class) ----
export class PassiveSkillDetailMstModel extends MstModelBase<any /* PassiveSkillDetailMstRecord */> {
    get PassiveSkillDetailMstId(): int { return this.get_PassiveSkillDetailMstId(); }
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get AbilityEffectType(): string { return this.get_AbilityEffectType(); }
    get Value1(): int { return this.get_Value1(); }
    get Value2(): int { return this.get_Value2(); }
    get Value3(): int { return this.get_Value3(); }
    get Element(): int { return this.get_Element(); }
    get Role(): int { return this.get_Role(); }
    get Turn(): int { return this.get_Turn(); }
    get RemainCount(): int { return this.get_RemainCount(); }
    get Range(): int { return this.get_Range(); }
    get Probability(): int { return this.get_Probability(); }
    get IsFixedProbability(): boolean { return this.get_IsFixedProbability(); }
    get StartTimings(): List<ProcessTiming> { return this.get_StartTimings(); }
    get StartConditionSetIdCsv(): string { return this.get_StartConditionSetIdCsv(); }
    get ActiveConditionSetIdCsv(): string { return this.get_ActiveConditionSetIdCsv(); }
    get Description(): string { return this.get_Description(); }
    get DescriptionType(): int { return this.get_DescriptionType(); }
    /** @rva 0x16D3180  public void .ctor(PassiveSkillDetailMstRecord record) { } */
    ctor$PassiveSkillDetailMstRecord(record: any /* PassiveSkillDetailMstRecord */): this { return notPorted("PassiveSkillDetailMstModel..ctor", 0x16D3180); }
    /** @rva 0x901770  public int get_PassiveSkillDetailMstId() { } */
    get_PassiveSkillDetailMstId(): int { return notPorted("PassiveSkillDetailMstModel.get_PassiveSkillDetailMstId", 0x901770); }
    /** @rva 0x901790  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return notPorted("PassiveSkillDetailMstModel.get_PassiveSkillMstId", 0x901790); }
    /** @rva 0x85E540  public string get_AbilityEffectType() { } */
    get_AbilityEffectType(): string { return notPorted("PassiveSkillDetailMstModel.get_AbilityEffectType", 0x85E540); }
    /** @rva 0xA0D840  public int get_Value1() { } */
    get_Value1(): int { return notPorted("PassiveSkillDetailMstModel.get_Value1", 0xA0D840); }
    /** @rva 0xA0E7D0  public int get_Value2() { } */
    get_Value2(): int { return notPorted("PassiveSkillDetailMstModel.get_Value2", 0xA0E7D0); }
    /** @rva 0xA0E790  public int get_Value3() { } */
    get_Value3(): int { return notPorted("PassiveSkillDetailMstModel.get_Value3", 0xA0E790); }
    /** @rva 0xA0E7B0  public int get_Element() { } */
    get_Element(): int { return notPorted("PassiveSkillDetailMstModel.get_Element", 0xA0E7B0); }
    /** @rva 0x16CBED0  public int get_Role() { } */
    get_Role(): int { return notPorted("PassiveSkillDetailMstModel.get_Role", 0x16CBED0); }
    /** @rva 0x901940  public int get_Turn() { } */
    get_Turn(): int { return notPorted("PassiveSkillDetailMstModel.get_Turn", 0x901940); }
    /** @rva 0xA0E810  public int get_RemainCount() { } */
    get_RemainCount(): int { return notPorted("PassiveSkillDetailMstModel.get_RemainCount", 0xA0E810); }
    /** @rva 0x16D31F0  public int get_Range() { } */
    get_Range(): int { return notPorted("PassiveSkillDetailMstModel.get_Range", 0x16D31F0); }
    /** @rva 0x901960  public int get_Probability() { } */
    get_Probability(): int { return notPorted("PassiveSkillDetailMstModel.get_Probability", 0x901960); }
    /** @rva 0x9017C0  public bool get_IsFixedProbability() { } */
    get_IsFixedProbability(): boolean { return notPorted("PassiveSkillDetailMstModel.get_IsFixedProbability", 0x9017C0); }
    /** @rva 0x16D3230  public List<ProcessTiming> get_StartTimings() { } */
    get_StartTimings(): List<ProcessTiming> { return notPorted("PassiveSkillDetailMstModel.get_StartTimings", 0x16D3230); }
    /** @rva 0x16D3210  public string get_StartConditionSetIdCsv() { } */
    get_StartConditionSetIdCsv(): string { return notPorted("PassiveSkillDetailMstModel.get_StartConditionSetIdCsv", 0x16D3210); }
    /** @rva 0x16D31D0  public string get_ActiveConditionSetIdCsv() { } */
    get_ActiveConditionSetIdCsv(): string { return notPorted("PassiveSkillDetailMstModel.get_ActiveConditionSetIdCsv", 0x16D31D0); }
    /** @rva 0x7F9C00  public string get_Description() { } */
    get_Description(): string { return notPorted("PassiveSkillDetailMstModel.get_Description", 0x7F9C00); }
    /** @rva 0x16CBE90  public int get_DescriptionType() { } */
    get_DescriptionType(): int { return notPorted("PassiveSkillDetailMstModel.get_DescriptionType", 0x16CBE90); }
}
