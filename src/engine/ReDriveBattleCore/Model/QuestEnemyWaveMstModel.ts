// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { LinkHpType } from "../../Network/Definition/QuestOutGame/LinkHpType";
import { MstModelBase } from "./MstModelBase";
import type { QuestEnemyWaveMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemyWaveMstRecord";

// ---- ReDriveBattleCore.Model.QuestEnemyWaveMstModel  (TypeDefIndex 891, public class) ----
export class QuestEnemyWaveMstModel extends MstModelBase<QuestEnemyWaveMstRecord> {
    get QuestEnemyWaveMstId(): int { return this.get_QuestEnemyWaveMstId(); }
    get QuestStageMstId(): int { return this.get_QuestStageMstId(); }
    get Wave(): int { return this.get_Wave(); }
    get LinkHpType(): LinkHpType { return this.get_LinkHpType(); }
    get LinkHpName(): string { return this.get_LinkHpName(); }
    get StagePrefabName(): string { return this.get_StagePrefabName(); }
    get DioramaBackGroundMstId(): int { return this.get_DioramaBackGroundMstId(); }
    get EnemyTipsText(): string { return this.get_EnemyTipsText(); }
    /** @rva 0x16D5790  public void .ctor(QuestEnemyWaveMstRecord record) { } */
    ctor$QuestEnemyWaveMstRecord(record: QuestEnemyWaveMstRecord): this { return notPorted("QuestEnemyWaveMstModel..ctor", 0x16D5790); }
    /** @rva 0x901770  public int get_QuestEnemyWaveMstId() { } */
    get_QuestEnemyWaveMstId(): int { return this.record.questEnemyWaveMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return this.record.questStageMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902C70  public int get_Wave() { } */
    get_Wave(): int { return this.record.wave; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902C50  public LinkHpType get_LinkHpType() { } */
    get_LinkHpType(): LinkHpType { return this.record.linkHpType as LinkHpType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0x9017E0  public string get_LinkHpName() { } */
    get_LinkHpName(): string { return this.record.linkHpName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x116EC30  public string get_StagePrefabName() { } */
    get_StagePrefabName(): string { return this.record.stagePrefabName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x116ec46; mov rax, qword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x901940  public int get_DioramaBackGroundMstId() { } */
    get_DioramaBackGroundMstId(): int { return this.record.dioramaBackGroundMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901955; mov eax, dword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x901750  public string get_EnemyTipsText() { } */
    get_EnemyTipsText(): string { return this.record.enemyTipsText; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901766; mov rax, qword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
}
