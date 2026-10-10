// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";
import type { ElementType } from "../../Network/Definition/Battle/ElementType";
import type { AbnormalEffectParryRate } from "../AbnormalEffectParryRate";
import type { ElementAimDamageRate } from "../ElementAimDamageRate";
import type { ElementDamageRate } from "../ElementDamageRate";
import type { ElementResistRate } from "../ElementResistRate";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.QuestEnemyAppearanceMstModel  (TypeDefIndex 888, public class) ----
export class QuestEnemyAppearanceMstModel extends MstModelBase<any /* QuestEnemyAppearanceMstRecord */> {
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    get QuestStageMstId(): int { return this.get_QuestStageMstId(); }
    get Wave(): int { return this.get_Wave(); }
    get EnemyMstId(): int { return this.get_EnemyMstId(); }
    get EnemySkillSetId(): int { return this.get_EnemySkillSetId(); }
    get EnemyConditionSkillSetId(): int { return this.get_EnemyConditionSkillSetId(); }
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    get IsMainTargetEnemy(): boolean { return this.get_IsMainTargetEnemy(); }
    get HP(): int { return this.get_HP(); }
    get ATK(): int { return this.get_ATK(); }
    get DEF(): int { return this.get_DEF(); }
    get Speed(): int { return this.get_Speed(); }
    get CriticalRate(): int { return this.get_CriticalRate(); }
    get CriticalDamageRate(): int { return this.get_CriticalDamageRate(); }
    get HealRate(): int { return this.get_HealRate(); }
    get EffectHitRate(): int { return this.get_EffectHitRate(); }
    get EffectParryRate(): int { return this.get_EffectParryRate(); }
    get HPGaugeCount(): int { return this.get_HPGaugeCount(); }
    get StartHPGaugeCount(): int { return this.get_StartHPGaugeCount(); }
    get ModeChangeEffectTxt(): string { return this.get_ModeChangeEffectTxt(); }
    get LinkHpWeight(): int { return this.get_LinkHpWeight(); }
    get IsSkipDeathMotion(): boolean { return this.get_IsSkipDeathMotion(); }
    get ElementDamageRates(): ElementDamageRate[] { return this.get_ElementDamageRates(); }
    get ElementResistRates(): ElementResistRate[] { return this.get_ElementResistRates(); }
    get ElementAimDamageRates(): ElementAimDamageRate[] { return this.get_ElementAimDamageRates(); }
    get WeakElements(): ElementType[] { return this.get_WeakElements(); }
    get AbnormalEffectParryRates(): AbnormalEffectParryRate[] { return this.get_AbnormalEffectParryRates(); }
    get BreakMstId(): int { return this.get_BreakMstId(); }
    get ConditionType(): int { return this.get_ConditionType(); }
    get ConditionValue(): int { return this.get_ConditionValue(); }
    get SummonId(): int { return this.get_SummonId(); }
    get IsBattleStartMember(): boolean { return this.get_IsBattleStartMember(); }
    /** @rva 0x16D3E20  public void .ctor(QuestEnemyAppearanceMstRecord record) { } */
    ctor$QuestEnemyAppearanceMstRecord(record: any /* QuestEnemyAppearanceMstRecord */): this { return notPorted("QuestEnemyAppearanceMstModel..ctor", 0x16D3E20); }
    /** @rva 0x901770  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_QuestEnemyAppearanceMstId", 0x901770); }
    /** @rva 0x901790  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_QuestStageMstId", 0x901790); }
    /** @rva 0x902C70  public int get_Wave() { } */
    get_Wave(): int { return notPorted("QuestEnemyAppearanceMstModel.get_Wave", 0x902C70); }
    /** @rva 0x902C50  public int get_EnemyMstId() { } */
    get_EnemyMstId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_EnemyMstId", 0x902C50); }
    /** @rva 0xA0D840  public int get_EnemySkillSetId() { } */
    get_EnemySkillSetId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_EnemySkillSetId", 0xA0D840); }
    /** @rva 0xA0E7D0  public int get_EnemyConditionSkillSetId() { } */
    get_EnemyConditionSkillSetId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_EnemyConditionSkillSetId", 0xA0E7D0); }
    /** @rva 0xA0E790  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_PassiveSkillMstId", 0xA0E790); }
    /** @rva 0x9017C0  public bool get_IsMainTargetEnemy() { } */
    get_IsMainTargetEnemy(): boolean { return notPorted("QuestEnemyAppearanceMstModel.get_IsMainTargetEnemy", 0x9017C0); }
    /** @rva 0x9019A0  public int get_HP() { } */
    get_HP(): int { return notPorted("QuestEnemyAppearanceMstModel.get_HP", 0x9019A0); }
    /** @rva 0x901980  public int get_ATK() { } */
    get_ATK(): int { return notPorted("QuestEnemyAppearanceMstModel.get_ATK", 0x901980); }
    /** @rva 0x16CBE90  public int get_DEF() { } */
    get_DEF(): int { return notPorted("QuestEnemyAppearanceMstModel.get_DEF", 0x16CBE90); }
    /** @rva 0x16D0B00  public int get_Speed() { } */
    get_Speed(): int { return notPorted("QuestEnemyAppearanceMstModel.get_Speed", 0x16D0B00); }
    /** @rva 0x16D0B20  public int get_CriticalRate() { } */
    get_CriticalRate(): int { return notPorted("QuestEnemyAppearanceMstModel.get_CriticalRate", 0x16D0B20); }
    /** @rva 0x16D4340  public int get_CriticalDamageRate() { } */
    get_CriticalDamageRate(): int { return notPorted("QuestEnemyAppearanceMstModel.get_CriticalDamageRate", 0x16D4340); }
    /** @rva 0x16D4DE0  public int get_HealRate() { } */
    get_HealRate(): int { return notPorted("QuestEnemyAppearanceMstModel.get_HealRate", 0x16D4DE0); }
    /** @rva 0x16D4360  public int get_EffectHitRate() { } */
    get_EffectHitRate(): int { return notPorted("QuestEnemyAppearanceMstModel.get_EffectHitRate", 0x16D4360); }
    /** @rva 0x16D4380  public int get_EffectParryRate() { } */
    get_EffectParryRate(): int { return notPorted("QuestEnemyAppearanceMstModel.get_EffectParryRate", 0x16D4380); }
    /** @rva 0x16D4DC0  public int get_HPGaugeCount() { } */
    get_HPGaugeCount(): int { return notPorted("QuestEnemyAppearanceMstModel.get_HPGaugeCount", 0x16D4DC0); }
    /** @rva 0x16D4E90  public int get_StartHPGaugeCount() { } */
    get_StartHPGaugeCount(): int { return notPorted("QuestEnemyAppearanceMstModel.get_StartHPGaugeCount", 0x16D4E90); }
    /** @rva 0x16D4E70  public string get_ModeChangeEffectTxt() { } */
    get_ModeChangeEffectTxt(): string { return notPorted("QuestEnemyAppearanceMstModel.get_ModeChangeEffectTxt", 0x16D4E70); }
    /** @rva 0x16D4E50  public int get_LinkHpWeight() { } */
    get_LinkHpWeight(): int { return notPorted("QuestEnemyAppearanceMstModel.get_LinkHpWeight", 0x16D4E50); }
    /** @rva 0x16D4E30  public bool get_IsSkipDeathMotion() { } */
    get_IsSkipDeathMotion(): boolean { return notPorted("QuestEnemyAppearanceMstModel.get_IsSkipDeathMotion", 0x16D4E30); }
    /** @rva 0x16D4700  public ElementDamageRate[] get_ElementDamageRates() { } */
    get_ElementDamageRates(): ElementDamageRate[] { return notPorted("QuestEnemyAppearanceMstModel.get_ElementDamageRates", 0x16D4700); }
    /** @rva 0x16D4A60  public ElementResistRate[] get_ElementResistRates() { } */
    get_ElementResistRates(): ElementResistRate[] { return notPorted("QuestEnemyAppearanceMstModel.get_ElementResistRates", 0x16D4A60); }
    /** @rva 0x16D43A0  public ElementAimDamageRate[] get_ElementAimDamageRates() { } */
    get_ElementAimDamageRates(): ElementAimDamageRate[] { return notPorted("QuestEnemyAppearanceMstModel.get_ElementAimDamageRates", 0x16D43A0); }
    /** @rva 0x16D4ED0  public ElementType[] get_WeakElements() { } */
    get_WeakElements(): ElementType[] { return notPorted("QuestEnemyAppearanceMstModel.get_WeakElements", 0x16D4ED0); }
    /** @rva 0x16D3E70  public AbnormalEffectParryRate[] get_AbnormalEffectParryRates() { } */
    get_AbnormalEffectParryRates(): AbnormalEffectParryRate[] { return notPorted("QuestEnemyAppearanceMstModel.get_AbnormalEffectParryRates", 0x16D3E70); }
    /** @rva 0x16D42E0  public int get_BreakMstId() { } */
    get_BreakMstId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_BreakMstId", 0x16D42E0); }
    /** @rva 0x16D4300  public int get_ConditionType() { } */
    get_ConditionType(): int { return notPorted("QuestEnemyAppearanceMstModel.get_ConditionType", 0x16D4300); }
    /** @rva 0x16D4320  public int get_ConditionValue() { } */
    get_ConditionValue(): int { return notPorted("QuestEnemyAppearanceMstModel.get_ConditionValue", 0x16D4320); }
    /** @rva 0x16D4EB0  public int get_SummonId() { } */
    get_SummonId(): int { return notPorted("QuestEnemyAppearanceMstModel.get_SummonId", 0x16D4EB0); }
    /** @rva 0x16D4E00  public bool get_IsBattleStartMember() { } */
    get_IsBattleStartMember(): boolean { return notPorted("QuestEnemyAppearanceMstModel.get_IsBattleStartMember", 0x16D4E00); }
    /** @rva 0x16D3B60  public static IEnumerable<QuestEnemyAppearanceMstModel> Sort(IEnumerable<QuestEnemyAppearanceMstModel> mstList) { } */
    static Sort(mstList: IEnumerable<QuestEnemyAppearanceMstModel>): IEnumerable<QuestEnemyAppearanceMstModel> { return notPorted("QuestEnemyAppearanceMstModel.Sort", 0x16D3B60); }
}
