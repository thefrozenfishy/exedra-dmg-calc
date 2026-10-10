// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { MstModelBase } from "./MstModelBase";
import type { QuestEnemyModeChangeMstRecord } from "../../Network/Definition/QuestOutGame/QuestEnemyModeChangeMstRecord";

// ---- ReDriveBattleCore.Model.QuestEnemyModeChangeMstModel  (TypeDefIndex 889, public class) ----
export class QuestEnemyModeChangeMstModel extends MstModelBase<QuestEnemyModeChangeMstRecord> {
    get QuestEnemyModeChangeMstId(): int { return this.get_QuestEnemyModeChangeMstId(); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    get Step(): int { return this.get_Step(); }
    get Type(): int { return this.get_Type(); }
    get ThresholdValue(): int { return this.get_ThresholdValue(); }
    /** @rva 0x16D5670  public void .ctor(QuestEnemyModeChangeMstRecord record) { } */
    ctor$QuestEnemyModeChangeMstRecord(record: QuestEnemyModeChangeMstRecord): this { return notPorted("QuestEnemyModeChangeMstModel..ctor", 0x16D5670); }
    /** @rva 0x901770  public int get_QuestEnemyModeChangeMstId() { } */
    get_QuestEnemyModeChangeMstId(): int { return this.record.questEnemyModeChangeMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this.record.questEnemyAppearanceMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x902C70  public int get_Step() { } */
    get_Step(): int { return this.record.step; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c85; mov eax, dword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902C50  public int get_Type() { } */
    get_Type(): int { return this.record.type; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x902c65; mov eax, dword ptr [rax + 0x1c]; add rsp, 0x28; ret */ }
    /** @rva 0xA0D840  public int get_ThresholdValue() { } */
    get_ThresholdValue(): int { return this.record.thresholdValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x16D5560  public static string GetModeChangeAssetName(int questEnemyAppearanceMstId, int step) { } */
    static GetModeChangeAssetName(questEnemyAppearanceMstId: int, step: int): string { return notPorted("QuestEnemyModeChangeMstModel.GetModeChangeAssetName", 0x16D5560); }
}
