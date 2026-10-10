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
import type { QuestEnemyAppearanceMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";

// ---- ReDriveBattleCore.Model.QuestEnemyAppearanceMstModel  (TypeDefIndex 888, public class) ----
export class QuestEnemyAppearanceMstModel extends MstModelBase<QuestEnemyAppearanceMstRecord> {
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
    ctor$QuestEnemyAppearanceMstRecord(record: QuestEnemyAppearanceMstRecord): this { return notPorted("QuestEnemyAppearanceMstModel..ctor", 0x16D3E20); }
    /** @rva 0x901770  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this.record.questEnemyAppearanceMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return this.record.questStageMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902C70  public int get_Wave() { } */
    get_Wave(): int { return this.record.wave; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902C50  public int get_EnemyMstId() { } */
    get_EnemyMstId(): int { return this.record.enemyMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0xA0D840  public int get_EnemySkillSetId() { } */
    get_EnemySkillSetId(): int { return this.record.enemySkillSetId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E7D0  public int get_EnemyConditionSkillSetId() { } */
    get_EnemyConditionSkillSetId(): int { return this.record.enemyConditionSkillSetId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E790  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return this.record.passiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x9017C0  public bool get_IsMainTargetEnemy() { } */
    get_IsMainTargetEnemy(): boolean { return this.record.isMainTargetEnemy; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017d6; movzx eax, byte ptr [rax + 0x44]; add rsp, 0x28; ret */ }
    /** @rva 0x9019A0  public int get_HP() { } */
    get_HP(): int { return this.record.hp; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9019b5; mov eax, dword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0x901980  public int get_ATK() { } */
    get_ATK(): int { return this.record.atk; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901995; mov eax, dword ptr [rax + 0x4c]; add rsp, 0x28; ret */ }
    /** @rva 0x16CBE90  public int get_DEF() { } */
    get_DEF(): int { return this.record.def; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbea5; mov eax, dword ptr [rax + 0x50]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0B00  public int get_Speed() { } */
    get_Speed(): int { return this.record.speed; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b15; mov eax, dword ptr [rax + 0x54]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0B20  public int get_CriticalRate() { } */
    get_CriticalRate(): int { return this.record.criticalRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b35; mov eax, dword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4340  public int get_CriticalDamageRate() { } */
    get_CriticalDamageRate(): int { return this.record.criticalDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4355; mov eax, dword ptr [rax + 0x5c]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4DE0  public int get_HealRate() { } */
    get_HealRate(): int { return this.record.healRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4df5; mov eax, dword ptr [rax + 0x60]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4360  public int get_EffectHitRate() { } */
    get_EffectHitRate(): int { return this.record.effectHitRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4375; mov eax, dword ptr [rax + 0x64]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4380  public int get_EffectParryRate() { } */
    get_EffectParryRate(): int { return this.record.effectParryRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4395; mov eax, dword ptr [rax + 0x68]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4DC0  public int get_HPGaugeCount() { } */
    get_HPGaugeCount(): int { return this.record.hpGaugeCount; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4dd8; mov eax, dword ptr [rax + 0xe0]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4E90  public int get_StartHPGaugeCount() { } */
    get_StartHPGaugeCount(): int { return this.record.startHpGaugeCount; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4ea8; mov eax, dword ptr [rax + 0xe4]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4E70  public string get_ModeChangeEffectTxt() { } */
    get_ModeChangeEffectTxt(): string { return this.record.modeChangeEffectTxt; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4e89; mov rax, qword ptr [rax + 0xe8]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4E50  public int get_LinkHpWeight() { } */
    get_LinkHpWeight(): int { return this.record.linkHpWeight; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4e68; mov eax, dword ptr [rax + 0xf0]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4E30  public bool get_IsSkipDeathMotion() { } */
    get_IsSkipDeathMotion(): boolean { return this.record.isSkipDeathMotion; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4e49; movzx eax, byte ptr [rax + 0xf4]; add rsp, 0x28; ret */ }
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
    get_BreakMstId(): int { return this.record.breakMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d42f8; mov eax, dword ptr [rax + 0xd0]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4300  public int get_ConditionType() { } */
    get_ConditionType(): int { return this.record.conditionType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4318; mov eax, dword ptr [rax + 0xd4]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4320  public int get_ConditionValue() { } */
    get_ConditionValue(): int { return this.record.conditionValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4338; mov eax, dword ptr [rax + 0xd8]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4EB0  public int get_SummonId() { } */
    get_SummonId(): int { return this.record.summonId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4ec8; mov eax, dword ptr [rax + 0xdc]; add rsp, 0x28; ret */ }
    /** @rva 0x16D4E00  public bool get_IsBattleStartMember() { } */
    get_IsBattleStartMember(): boolean { return notPorted("QuestEnemyAppearanceMstModel.get_IsBattleStartMember", 0x16D4E00); }
    /** @rva 0x16D3B60  public static IEnumerable<QuestEnemyAppearanceMstModel> Sort(IEnumerable<QuestEnemyAppearanceMstModel> mstList) { } */
    static Sort(mstList: IEnumerable<QuestEnemyAppearanceMstModel>): IEnumerable<QuestEnemyAppearanceMstModel> { return notPorted("QuestEnemyAppearanceMstModel.Sort", 0x16D3B60); }
}
