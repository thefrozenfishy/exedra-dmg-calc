// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import { QuestJudgeResultReferee } from "./QuestJudgeResultReferee";

// ---- ReDriveBattleCore.MultiRaidJudgeResultReferee  (TypeDefIndex 427, public class) ----
export class MultiRaidJudgeResultReferee extends QuestJudgeResultReferee {
    /** 0x28 private int roundLimit */
    roundLimit: int = 0;
    /** 0x30 private DateTimeOffset endTime */
    endTime: any /* DateTimeOffset */ = null!;
    /** @rva 0x7637A0 slot 4  public override int get_RoundLimit() { } */
    get_RoundLimit(): int { return this.roundLimit; /* asm: mov eax, dword ptr [rcx + 0x28]; ret */ }
    /** @rva 0x14A1980  public void .ctor(int questStageMstId, int roundLimit, DateTimeOffset endTime) { } */
    ctor$int_int_DateTimeOffset(questStageMstId: int, roundLimit: int, endTime: any /* DateTimeOffset */): this { return notPorted("MultiRaidJudgeResultReferee..ctor", 0x14A1980); }
    /** @rva 0x14A18B0 slot 8  public override void CheckBattleFinishByTimeLimit(DateTimeOffset currentTime) { } */
    CheckBattleFinishByTimeLimit(currentTime: any /* DateTimeOffset */): void { return notPorted("MultiRaidJudgeResultReferee.CheckBattleFinishByTimeLimit", 0x14A18B0); }
    /** @rva 0x14A1960  public void ForceSetBattleFinishByTimeLimit() { } */
    ForceSetBattleFinishByTimeLimit(): void { return notPorted("MultiRaidJudgeResultReferee.ForceSetBattleFinishByTimeLimit", 0x14A1960); }
}
