// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CommandBeginTurn } from "./Command/CommandBeginTurn";
import { TurnOrderUnitInfo } from "./TurnOrderUnitInfo";
import { TurnActOrderUnitInfo } from "./TurnActOrderUnitInfo";
import { SoloRaidGameDirector } from "./SoloRaidGameDirector";
import { EnemyAppearanceGameDirectorBase } from "./EnemyAppearanceGameDirectorBase";
import { SpecialAttackAct } from "./Act/SpecialAttackAct";
import { ActReferee } from "./Act/ActReferee";
import { TurnReferee } from "./TurnReferee";
import { f32, notPorted } from "../runtime";
import type { List, int, float } from "../runtime";
import type { ActBase } from "./Act/ActBase";

import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";

// ---- ReDriveBattleCore.TurnActSystem  (TypeDefIndex 467, public class) ----
export class TurnActSystem {
    /** 0x10 public TurnReferee turnReferee */
    turnReferee: TurnReferee = null!;
    /** 0x18 public ActReferee actReferee */
    actReferee: ActReferee = null!;
    /** 0x20 private int <NextInfoId>k__BackingField */
    _NextInfoId: int = 0;
    get CurrentAct(): ActBase { return this.get_CurrentAct(); }
    get NextInfoId(): int { return this.get_NextInfoId(); }
    set NextInfoId(v: int) { this.set_NextInfoId(v); }
    /** @rva 0x7F0A70  public ActBase get_CurrentAct() { } */
    get_CurrentAct(): ActBase {
        return this.actReferee.currentAct;
    }
    /** @rva 0x75ED70  public int get_NextInfoId() { } */
    get_NextInfoId(): int { return this._NextInfoId; /* auto-property */ }
    /** @rva 0x8A2230  public void set_NextInfoId(int value) { } */
    set_NextInfoId(value: int): void { this._NextInfoId = value; /* auto-property */ }
    /** @rva 0x15D0CE0  public void ClearAct() { } */
    ClearAct(): void {
        this.actReferee.Clear();
    }
    /** @rva 0x15D10A0  public void Forward(List<BattleUnit> battleUnitList, GameDirectorBase gameDirector) { } */
    Forward(battleUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): void {
        if (this.actReferee.ShiftNextAct()) return;
        // queue empty: start the next unit's turn
        const currentWave = gameDirector.TurnTransition();
        const turnUnit = battleUnitList.find(u => u.Id === this.turnReferee.CurrentTurnUnitId); // First(b__9_0)
        if (turnUnit === undefined) throw new Error("Sequence contains no matching element");
        const combo = turnUnit.Condition.GetMaximumActionNumComboUnitState(turnUnit);
        if (combo == null || combo.actionNum < 2) this.actReferee.AddDefaultUnitTurnActs(turnUnit);
        else this.actReferee.AddComboUnitTurnActs(turnUnit, combo.actionNum);
        this.actReferee.ShiftNextAct();
        if (gameDirector instanceof EnemyAppearanceGameDirectorBase) {
            gameDirector.unitBrain.RegisterEnemyUnitsStartConditionTimingAction(battleUnitList.filter(u => u.IsEnemy), this.actReferee); // b__9_1
        }
        const orderInfo = this.CreateTurnActUnitOrderInfo(battleUnitList, gameDirector);
        const round = TurnReferee.CalculateCurrentRound(this.turnReferee.elapsedActionTime);
        gameDirector.StoreCommand(new CommandBeginTurn().ctor$BattleUnit_TurnActOrderUnitInfo_int_int_float(
            turnUnit, orderInfo, round, currentWave, this.turnReferee.deltaActionTime));
    }
    /** @rva 0x15D1440  public void RegisterUnitSpecialAttack(BattleUnit unit) { } */
    RegisterUnitSpecialAttack(unit: BattleUnit): void {
        const act = new SpecialAttackAct().ctor();
        act.actUnitId = unit.Id;
        act.actUnitTeam = unit.Team;
        this.actReferee.AddAct$SpecialAttackAct(act); // inlined in the game
    }
    /** @rva 0x15D14D0  public void UpdateTurnActOrder(List<BattleUnit> activeUnitList) { } */
    UpdateTurnActOrder(activeUnitList: List<BattleUnit>): void {
        this.turnReferee.UpdateTurnOrder(activeUnitList);
        this.actReferee.UpdateActOrder(activeUnitList); // inlined in the game
    }
    /** @rva 0x15D0D00  public TurnActOrderUnitInfo CreateTurnActUnitOrderInfo(List<BattleUnit> activeUnitList, GameDirectorBase gameDirector) { } */
    CreateTurnActUnitOrderInfo(activeUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): TurnActOrderUnitInfo {
        let seasonBuffGauge: float = 0;
        if (gameDirector instanceof SoloRaidGameDirector) seasonBuffGauge = gameDirector.soloRaidBuffReferee.activeCurrentSeasonBuffTurnGaugeValue;
        const info = new TurnActOrderUnitInfo().ctor();
        info._InfoId = this._NextInfoId++;
        info._CurrentTurnUnitId = this.turnReferee.CurrentTurnUnitId;
        info._TurnOrderUnitInfoList = TurnReferee.SortByTurnOrder(activeUnitList).map(u => new TurnOrderUnitInfo().ctor$BattleUnit(u));
        info._ActOrderUnitInfoList = this.actReferee.GetActOrderUnitInfoList();
        info._NextRound = TurnReferee.CalculateCurrentRound(this.turnReferee.elapsedActionTime) + 1;
        info._GaugeValueToNextRound = this.turnReferee.GetGaugeValueToNextRound(); // inlined in the game
        info._ActiveCurrentSeasonBuffTurnGaugeValue = seasonBuffGauge;
        return info;
    }
    /** @rva 0x730170  public void AddActOnSkillEnd(GameDirectorBase gameDirector, BattleUnit attackUnit, BattleUnit mainTargetUnit, ActiveSkillBase activeSkill, AffectedUnitNoticeBundle noticeBundle) { } */
    AddActOnSkillEnd(gameDirector: GameDirectorBase, attackUnit: BattleUnit, mainTargetUnit: BattleUnit, activeSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle): void { /* asm: ret 0 */ }
    /** @rva 0x15D1520  public void .ctor() { } */
    ctor(): this {
        this.turnReferee = new TurnReferee().ctor();
        this.actReferee = new ActReferee().ctor();
        this._NextInfoId = 1;
        return this;
    }
    /** @rva 0xA03110  private bool <Forward>b__9_0(BattleUnit u) { } */
    $Forward$b__9_0(u: BattleUnit): boolean { return u._Id === this.turnReferee.get_CurrentTurnUnitId(); }
}
