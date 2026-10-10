// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { QuestEnemySkillSetMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemySkillSetMstRecord";

// ---- ReDriveBattleCore.Model.QuestEnemySkillSetMstModel  (TypeDefIndex 890, public class) ----
export class QuestEnemySkillSetMstModel extends MstModelBase<QuestEnemySkillSetMstRecord> {
    get QuestEnemySkillSetMstId(): int { return this.get_QuestEnemySkillSetMstId(); }
    get EnemySkillSetId(): int { return this.get_EnemySkillSetId(); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    get WeightValue(): int { return this.get_WeightValue(); }
    get HpGaugeValue(): int { return this.get_HpGaugeValue(); }
    get IsDescriptionHidden(): boolean { return this.get_IsDescriptionHidden(); }
    /** @rva 0x16D5700  public void .ctor(QuestEnemySkillSetMstRecord record) { } */
    ctor$QuestEnemySkillSetMstRecord(record: QuestEnemySkillSetMstRecord): this { return notPorted("QuestEnemySkillSetMstModel..ctor", 0x16D5700); }
    /** @rva 0x901770  public int get_QuestEnemySkillSetMstId() { } */
    get_QuestEnemySkillSetMstId(): int { return this.record.questEnemySkillSetMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_EnemySkillSetId() { } */
    get_EnemySkillSetId(): int { return this.record.enemySkillSetId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902C70  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this.record.skillMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902C50  public int get_WeightValue() { } */
    get_WeightValue(): int { return this.record.weightValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0xA0D840  public int get_HpGaugeValue() { } */
    get_HpGaugeValue(): int { return this.record.hpGaugeValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA11CE0  public bool get_IsDescriptionHidden() { } */
    get_IsDescriptionHidden(): boolean { return this.record.isDescriptionHidden; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa11cf6; movzx eax, byte ptr [rax + 0x24]; add rsp, 0x28; ret */ }
}
