// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { JudgeResultRefereeBase } from "./JudgeResultRefereeBase";
import type { JudgeResultType } from "./JudgeResultType";
import { ResultStatus } from "./ResultStatus";
import { BattleUnit_TeamType } from "./BattleUnit";

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
    get_HasVictoryRound(): boolean { return 0 < this.victoryRound; }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x14A46C0  public void .ctor(int stageMstId, int victoryRound = 0) { } */
    ctor$int_int(stageMstId: int, victoryRound?: int /* = 0 */): this {
        const main = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
            .GetModel(mst => mst.questStageMstId === stageMstId && mst.isMainTargetEnemy); // <>c__DisplayClass9_0.<.ctor>b__0
        if (main != null) this.mainTargetQuestEnemyAppearanceMstId = main.QuestEnemyAppearanceMstId;
        this.victoryRound = victoryRound ?? 0;
        return this;
    }
    /** @rva 0x14A4550  public void SetJudgeResultType(JudgeResultType newJudgeResultType, int newJudgeResultValue) { } */
    SetJudgeResultType(newJudgeResultType: JudgeResultType, newJudgeResultValue: int): void {
        this.judgeResultType = newJudgeResultType;
        this.judgeResultValue = newJudgeResultValue;
    }
    /** @rva 0x14A44C0 slot 5  public override void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void {
        if (deathUnit == null || this.mainTargetQuestEnemyAppearanceMstId === 0) return;
        const param = deathUnit.BattleParameter;
        if (param instanceof QuestEnemyAppearanceParameter && param.QuestEnemyAppearanceMstId === this.mainTargetQuestEnemyAppearanceMstId && this.result === ResultStatus.None) {
            this.result = ResultStatus.Winning;
        }
    }
    /** @rva 0x14A4560  public void SetWaveMainTarget(int stageMstId, int currentWave) { } */
    SetWaveMainTarget(stageMstId: int, currentWave: int): void {
        const list = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
            .GetModelList(mst => mst.questStageMstId === stageMstId && mst.isMainTargetEnemy && mst.wave === currentWave); // <>c__DisplayClass12_0.b__0
        if (list == null || !(list.length > 0)) {
            this.mainTargetQuestEnemyAppearanceMstId = 0;
            return;
        }
        this.mainTargetQuestEnemyAppearanceMstId = [...list][list.length - 1].QuestEnemyAppearanceMstId; // Last()
    }
    /** @rva 0x14A4410 slot 6  public override void CheckBattleFinishBeforeAct(int nextActRound) { } */
    CheckBattleFinishBeforeAct(nextActRound: int): void {
        if (this.victoryRound < 1 || nextActRound <= this.victoryRound) {
            if (this.get_RoundLimit() < 1) return;
            if (nextActRound <= this.get_RoundLimit()) return;
            if (this.result === ResultStatus.None) this.result = ResultStatus.Losing;
        } else if (this.result === ResultStatus.None) {
            this.result = ResultStatus.Winning;
        }
        this._BattleFinishByRoundLimit = true;
    }
    /** @rva 0x14A44A0  public void CheckJudgeResultType(JudgeResultType checkJudgeResultType, int checkJudgeResultValue) { } */
    CheckJudgeResultType(checkJudgeResultType: JudgeResultType, checkJudgeResultValue: int): void {
        if (checkJudgeResultType === this.judgeResultType && checkJudgeResultType === 1 && checkJudgeResultValue <= this.judgeResultValue && this.result === ResultStatus.None) {
            this.result = ResultStatus.Winning;
        }
    }
    /** @rva 0x14A42B0  public void CheckBattleFinishAfterActWithHpLink(int linkHp, List<BattleUnit> activeUnitList) { } */
    CheckBattleFinishAfterActWithHpLink(linkHp: int, activeUnitList: List<BattleUnit>): void {
        if (linkHp < 1) {
            if (this.result === ResultStatus.None) this.result = ResultStatus.Winning;
        } else if (!activeUnitList.some(unit => unit.Team === BattleUnit_TeamType.Ally) && this.result === ResultStatus.None) { // <>c.b__15_0
            this.result = ResultStatus.Losing;
        }
    }
}
