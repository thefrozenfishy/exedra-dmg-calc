// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { VortexUnitStateBase } from "../UnitState/VortexUnitStateBase";
import { BleedUnitStateBase } from "../UnitState/BleedUnitStateBase";
import { CurseUnitStateBase } from "../UnitState/CurseUnitStateBase";
import { StunUnitState } from "../UnitState/StunUnitState";
import { PoisonUnitStateBase } from "../UnitState/PoisonUnitStateBase";
import { WeaknessUnitState } from "../UnitState/WeaknessUnitState";
import { BurnUnitStateBase } from "../UnitState/BurnUnitStateBase";
import { AbnormalEffectParryRate$1 } from "../AbnormalEffectParryRate";
import { ElementAimDamageRate } from "../ElementAimDamageRate";
import { ElementResistRate } from "../ElementResistRate";
import { ElementDamageRate } from "../ElementDamageRate";
import { ElementType } from "../../Network/Definition/Battle/ElementType";
import { enumIsDefined, listInsert, notPorted, trunc } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";

import type { AbnormalEffectParryRate } from "../AbnormalEffectParryRate";

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
    /** @rva 0x16FDD00  public void .ctor(QuestEnemyAppearanceMstRecord record) { } */
    ctor$QuestEnemyAppearanceMstRecord(record: QuestEnemyAppearanceMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x901380  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this.record.questEnemyAppearanceMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x9013A0  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return this.record.questStageMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x9013C0  public int get_Wave() { } */
    get_Wave(): int { return this.record.wave; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x901360  public int get_EnemyMstId() { } */
    get_EnemyMstId(): int { return this.record.enemyMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0xA06180  public int get_EnemySkillSetId() { } */
    get_EnemySkillSetId(): int { return this.record.enemySkillSetId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA066A0  public int get_EnemyConditionSkillSetId() { } */
    get_EnemyConditionSkillSetId(): int { return this.record.enemyConditionSkillSetId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0xA06660  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return this.record.passiveSkillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0xA063E0  public bool get_IsMainTargetEnemy() { } */
    get_IsMainTargetEnemy(): boolean { return this.record.isMainTargetEnemy; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017d6; movzx eax, byte ptr [rax + 0x44]; add rsp, 0x28; ret */ }
    /** @rva 0xA06560  public int get_HP() { } */
    get_HP(): int { return this.record.hp; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9019b5; mov eax, dword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0xA06540  public int get_ATK() { } */
    get_ATK(): int { return this.record.atk; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901995; mov eax, dword ptr [rax + 0x4c]; add rsp, 0x28; ret */ }
    /** @rva 0x16F5980  public int get_DEF() { } */
    get_DEF(): int { return this.record.def; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbea5; mov eax, dword ptr [rax + 0x50]; add rsp, 0x28; ret */ }
    /** @rva 0x16FB990  public int get_Speed() { } */
    get_Speed(): int { return this.record.speed; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b15; mov eax, dword ptr [rax + 0x54]; add rsp, 0x28; ret */ }
    /** @rva 0x16FB9B0  public int get_CriticalRate() { } */
    get_CriticalRate(): int { return this.record.criticalRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b35; mov eax, dword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE220  public int get_CriticalDamageRate() { } */
    get_CriticalDamageRate(): int { return this.record.criticalDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4355; mov eax, dword ptr [rax + 0x5c]; add rsp, 0x28; ret */ }
    /** @rva 0x16FECC0  public int get_HealRate() { } */
    get_HealRate(): int { return this.record.healRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4df5; mov eax, dword ptr [rax + 0x60]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE240  public int get_EffectHitRate() { } */
    get_EffectHitRate(): int { return this.record.effectHitRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4375; mov eax, dword ptr [rax + 0x64]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE260  public int get_EffectParryRate() { } */
    get_EffectParryRate(): int { return this.record.effectParryRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4395; mov eax, dword ptr [rax + 0x68]; add rsp, 0x28; ret */ }
    /** @rva 0x16FECA0  public int get_HPGaugeCount() { } */
    get_HPGaugeCount(): int { return this.record.hpGaugeCount; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4dd8; mov eax, dword ptr [rax + 0xe0]; add rsp, 0x28; ret */ }
    /** @rva 0x16FED70  public int get_StartHPGaugeCount() { } */
    get_StartHPGaugeCount(): int { return this.record.startHpGaugeCount; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4ea8; mov eax, dword ptr [rax + 0xe4]; add rsp, 0x28; ret */ }
    /** @rva 0x16FED50  public string get_ModeChangeEffectTxt() { } */
    get_ModeChangeEffectTxt(): string { return this.record.modeChangeEffectTxt; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4e89; mov rax, qword ptr [rax + 0xe8]; add rsp, 0x28; ret */ }
    /** @rva 0x16FED30  public int get_LinkHpWeight() { } */
    get_LinkHpWeight(): int { return this.record.linkHpWeight; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4e68; mov eax, dword ptr [rax + 0xf0]; add rsp, 0x28; ret */ }
    /** @rva 0x16FED10  public bool get_IsSkipDeathMotion() { } */
    get_IsSkipDeathMotion(): boolean { return this.record.isSkipDeathMotion; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4e49; movzx eax, byte ptr [rax + 0xf4]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE5E0  public ElementDamageRate[] get_ElementDamageRates() { } */
    get_ElementDamageRates(): ElementDamageRate[] {
        const r = this.record;
        return [
            new ElementDamageRate().ctor$ElementType_int(ElementType.Fire, r.fireDamageRate),
            new ElementDamageRate().ctor$ElementType_int(ElementType.Aqua, r.aquaDamageRate),
            new ElementDamageRate().ctor$ElementType_int(ElementType.Forest, r.forestDamageRate),
            new ElementDamageRate().ctor$ElementType_int(ElementType.Light, r.lightDamageRate),
            new ElementDamageRate().ctor$ElementType_int(ElementType.Dark, r.darkDamageRate),
            new ElementDamageRate().ctor$ElementType_int(ElementType.Neutral, r.neutralDamageRate),
        ];
    }
    /** @rva 0x16FE940  public ElementResistRate[] get_ElementResistRates() { } */
    get_ElementResistRates(): ElementResistRate[] {
        const r = this.record;
        return [
            new ElementResistRate().ctor$ElementType_int(ElementType.Fire, r.fireResistRate),
            new ElementResistRate().ctor$ElementType_int(ElementType.Aqua, r.aquaResistRate),
            new ElementResistRate().ctor$ElementType_int(ElementType.Forest, r.forestResistRate),
            new ElementResistRate().ctor$ElementType_int(ElementType.Light, r.lightResistRate),
            new ElementResistRate().ctor$ElementType_int(ElementType.Dark, r.darkResistRate),
            new ElementResistRate().ctor$ElementType_int(ElementType.Neutral, r.neutralResistRate),
        ];
    }
    /** @rva 0x16FE280  public ElementAimDamageRate[] get_ElementAimDamageRates() { } */
    get_ElementAimDamageRates(): ElementAimDamageRate[] {
        const r = this.record;
        return [
            new ElementAimDamageRate().ctor$ElementType_int(ElementType.Fire, r.fireAimDamageRate),
            new ElementAimDamageRate().ctor$ElementType_int(ElementType.Aqua, r.aquaAimDamageRate),
            new ElementAimDamageRate().ctor$ElementType_int(ElementType.Forest, r.forestAimDamageRate),
            new ElementAimDamageRate().ctor$ElementType_int(ElementType.Light, r.lightAimDamageRate),
            new ElementAimDamageRate().ctor$ElementType_int(ElementType.Dark, r.darkAimDamageRate),
            new ElementAimDamageRate().ctor$ElementType_int(ElementType.Neutral, r.neutralAimDamageRate),
        ];
    }
    /** @rva 0x16FEDB0  public ElementType[] get_WeakElements() { } */
    get_WeakElements(): ElementType[] {
        const r = this.record;
        return [r.weakElement1, r.weakElement2, r.weakElement3, r.weakElement4, r.weakElement5, r.weakElement6]
            .filter(ele => enumIsDefined(ElementType, ele)) // <get_WeakElements>b__52_0: Enum.IsDefined(typeof(ElementType), ele)
            .map(ele => ele as ElementType);                // <get_WeakElements>b__52_1
    }
    /** @rva 0x16FDD50  public AbnormalEffectParryRate[] get_AbnormalEffectParryRates() { } */
    get_AbnormalEffectParryRates(): AbnormalEffectParryRate[] {
        const r = this.record;
        return [
            new AbnormalEffectParryRate$1(BurnUnitStateBase).ctor$int(r.burnParryRate),
            new AbnormalEffectParryRate$1(WeaknessUnitState).ctor$int(r.weaknessParryRate),
            new AbnormalEffectParryRate$1(PoisonUnitStateBase).ctor$int(r.poisonParryRate),
            new AbnormalEffectParryRate$1(StunUnitState).ctor$int(r.stunParryRate),
            new AbnormalEffectParryRate$1(CurseUnitStateBase).ctor$int(r.curseParryRate),
            new AbnormalEffectParryRate$1(BleedUnitStateBase).ctor$int(r.bleedParryRate),
            new AbnormalEffectParryRate$1(VortexUnitStateBase).ctor$int(r.vortexParryRate),
        ];
    }
    /** @rva 0x16FE1C0  public int get_BreakMstId() { } */
    get_BreakMstId(): int { return this.record.breakMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d42f8; mov eax, dword ptr [rax + 0xd0]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE1E0  public int get_ConditionType() { } */
    get_ConditionType(): int { return this.record.conditionType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4318; mov eax, dword ptr [rax + 0xd4]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE200  public int get_ConditionValue() { } */
    get_ConditionValue(): int { return this.record.conditionValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4338; mov eax, dword ptr [rax + 0xd8]; add rsp, 0x28; ret */ }
    /** @rva 0x16FED90  public int get_SummonId() { } */
    get_SummonId(): int { return this.record.summonId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4ec8; mov eax, dword ptr [rax + 0xdc]; add rsp, 0x28; ret */ }
    /** @rva 0x16FECE0  public bool get_IsBattleStartMember() { } */
    get_IsBattleStartMember(): boolean { return this.record.conditionValue === 0; }
    /** @rva 0x16FDA40  public static IEnumerable<QuestEnemyAppearanceMstModel> Sort(IEnumerable<QuestEnemyAppearanceMstModel> mstList) { } */
    static Sort(mstList: IEnumerable<QuestEnemyAppearanceMstModel>): IEnumerable<QuestEnemyAppearanceMstModel> {
        const list: QuestEnemyAppearanceMstModel[] = [];
        const count = mstList.length;
        let mainTarget: QuestEnemyAppearanceMstModel | null = null;
        for (const mst of mstList) {
            if (!mst.record.isMainTargetEnemy) list.push(mst);
            else mainTarget = mst; // the last main target wins
        }
        if (mainTarget != null) listInsert(list, trunc(count / 2), mainTarget);
        return list;
    }
}
