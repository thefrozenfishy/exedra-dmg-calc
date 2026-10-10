// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { JudgeResultRefereeBase } from "./JudgeResultRefereeBase";
import type { JudgeResultType } from "./JudgeResultType";

// ---- ReDriveBattleCore.QuestJudgeResultReferee  (TypeDefIndex 423, public class) ----
export class QuestJudgeResultReferee extends JudgeResultRefereeBase {
    /** 0x18 private int mainTargetQuestEnemyAppearanceMstId */
    mainTargetQuestEnemyAppearanceMstId: int = 0;
    /** 0x1C private JudgeResultType judgeResultType */
    judgeResultType: JudgeResultType = 0 as JudgeResultType;
    /** 0x20 private int judgeResultValue */
    judgeResultValue: int = 0;
    /** 0x24 private int victoryRound */
    victoryRound: int = 0;
    get HasVictoryRound(): boolean { return this.get_HasVictoryRound(); }
    /** @rva 0xC2A210 slot 4  public override int get_RoundLimit() { } */
    get_RoundLimit(): int { return 100; /* asm: mov eax, 0x64; ret */ }
    /** @rva 0x14A47E0  public bool get_HasVictoryRound() { } */
    get_HasVictoryRound(): boolean { return notPorted("QuestJudgeResultReferee.get_HasVictoryRound", 0x14A47E0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x14A46C0  public void .ctor(int stageMstId, int victoryRound = 0) { } */
    ctor$int_int(stageMstId: int, victoryRound?: int /* = 0 */): this { return notPorted("QuestJudgeResultReferee..ctor", 0x14A46C0); }
    /** @rva 0x14A4550  public void SetJudgeResultType(JudgeResultType newJudgeResultType, int newJudgeResultValue) { } */
    SetJudgeResultType(newJudgeResultType: JudgeResultType, newJudgeResultValue: int): void {
        this.judgeResultType = newJudgeResultType;
        this.judgeResultValue = newJudgeResultValue;
    }
    /** @rva 0x14A44C0 slot 5  public override void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void { return notPorted("QuestJudgeResultReferee.CheckMainTargetEnemyDead", 0x14A44C0); }
    /** @rva 0x14A4560  public void SetWaveMainTarget(int stageMstId, int currentWave) { } */
    SetWaveMainTarget(stageMstId: int, currentWave: int): void { return notPorted("QuestJudgeResultReferee.SetWaveMainTarget", 0x14A4560); }
    /** @rva 0x14A4410 slot 6  public override void CheckBattleFinishBeforeAct(int nextActRound) { } */
    CheckBattleFinishBeforeAct(nextActRound: int): void { return notPorted("QuestJudgeResultReferee.CheckBattleFinishBeforeAct", 0x14A4410); }
    /** @rva 0x14A44A0  public void CheckJudgeResultType(JudgeResultType checkJudgeResultType, int checkJudgeResultValue) { } */
    CheckJudgeResultType(checkJudgeResultType: JudgeResultType, checkJudgeResultValue: int): void { return notPorted("QuestJudgeResultReferee.CheckJudgeResultType", 0x14A44A0); }
    /** @rva 0x14A42B0  public void CheckBattleFinishAfterActWithHpLink(int linkHp, List<BattleUnit> activeUnitList) { } */
    CheckBattleFinishAfterActWithHpLink(linkHp: int, activeUnitList: List<BattleUnit>): void { return notPorted("QuestJudgeResultReferee.CheckBattleFinishAfterActWithHpLink", 0x14A42B0); }
}
