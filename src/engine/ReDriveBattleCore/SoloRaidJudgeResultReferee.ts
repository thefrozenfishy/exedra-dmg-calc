// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../runtime";
import type { ResultStatus } from "./ResultStatus";
import { QuestJudgeResultReferee } from "./QuestJudgeResultReferee";

/** System.DateTimeOffset, modelled as its UTC instant in milliseconds (fractional part = sub-millisecond ticks). */
export type DateTimeOffset = number;

// ---- ReDriveBattleCore.SoloRaidJudgeResultReferee  (TypeDefIndex 428, public class) ----
export class SoloRaidJudgeResultReferee extends QuestJudgeResultReferee {
    /** 0x28 private int roundLimit */
    roundLimit: int = 0;
    /** 0x30 private DateTimeOffset endTime */
    endTime: DateTimeOffset = 0;
    /** @rva 0x7637A0 slot 4  public override int get_RoundLimit() { } */
    get_RoundLimit(): int { return this.roundLimit; /* asm: mov eax, dword ptr [rcx + 0x28]; ret */ }
    /** @rva 0x14B21F0  public void .ctor(int questStageMstId, int roundLimit, DateTimeOffset endTime) { } */
    ctor$int_int_DateTimeOffset(questStageMstId: int, roundLimit: int, endTime: DateTimeOffset): this {
        super.ctor$int_int(questStageMstId, 0);
        this.roundLimit = roundLimit;
        this.endTime = endTime;
        return this;
    }
    /** @rva 0x14B92B0 slot 8  public override void CheckBattleFinishByTimeLimit(DateTimeOffset currentTime) { } */
    CheckBattleFinishByTimeLimit(currentTime: DateTimeOffset): void {
        const millisecond = Math.floor(currentTime) % 1000; // currentTime.Millisecond (UTC offsets are whole minutes)
        if (currentTime - millisecond > this.endTime) { // currentTime.AddMilliseconds(-Millisecond) > endTime
            if (this.result === 0) this.result = 2 as ResultStatus;
            this.BattleFinishByTimeLimit = true;
        }
    }
}
