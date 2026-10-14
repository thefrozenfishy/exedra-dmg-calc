// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { ActOrderUnitInfo } from "../ActOrderUnitInfo";
import { ReActionTurnUnitAct } from "./ReActionTurnUnitAct";
import { AdditionalSkillAct } from "./AdditionalSkillAct";
import { AdditionalTurnUnitAct } from "./AdditionalTurnUnitAct";
import { SkillDecisionActBase } from "./SkillDecisionActBase";
import { SpecialAttackAct } from "./SpecialAttackAct";
import { ComboTurnUnitAct } from "./ComboTurnUnitAct";
import { TurnEndAct } from "./TurnEndAct";
import { TurnUnitAct } from "./TurnUnitAct";
import { TurnBeginAct } from "./TurnBeginAct";
import { ActBase_Define } from "./ActBase";
import { notPorted, orderByNewGuid, removeAll } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { ActBase } from "./ActBase";

import type { BattleUnit, BattleUnit_TeamType } from "../BattleUnit";

// ---- ReDriveBattleCore.Act.ActReferee  (TypeDefIndex 1126, public class) ----
export class ActReferee {
    /** 0x10 public ActBase currentAct */
    currentAct: ActBase = null!;
    /** 0x18 public List<ActBase> actList */
    actList: List<ActBase> = null!;
    /** 0x20 public List<ActBase> turnActHistory */
    turnActHistory: List<ActBase> = null!;
    /** 0x28 private int lastActId */
    lastActId: int = 0;
    /** @rva 0x18E91A0  public void Clear() { } */
    Clear(): void {
        this.actList.length = 0;
        this.turnActHistory.length = 0;
        this.currentAct = null!;
    }
    /** @rva 0x18E99F0  public bool ShiftNextAct() { } */
    ShiftNextAct(): boolean {
        if (this.currentAct != null) {
            this.turnActHistory.push(this.currentAct);
            this.currentAct = null!;
        }
        if (this.actList.length === 0) return false;
        this.currentAct = this.actList[0];
        this.actList.splice(0, 1);
        return true;
    }
    /** @rva 0x18E8DF0  public void AddDefaultUnitTurnActs(BattleUnit turnUnit) { } */
    AddDefaultUnitTurnActs(turnUnit: BattleUnit): void {
        const begin = new TurnBeginAct().ctor();
        begin.actUnitId = turnUnit.Id;
        begin.actUnitTeam = turnUnit.Team;
        begin.id = this.GetNewActId();
        this.AddActToListAndSort(begin);
        const unitAct = new TurnUnitAct().ctor();
        unitAct.actUnitId = turnUnit.Id;
        unitAct.actUnitTeam = turnUnit.Team;
        unitAct.id = this.GetNewActId();
        this.AddActToListAndSort(unitAct);
        const end = new TurnEndAct().ctor();
        end.actUnitId = turnUnit.Id;
        end.actUnitTeam = turnUnit.Team;
        end.id = this.GetNewActId();
        this.AddActToListAndSort(end);
    }
    /** @rva 0x18E8C80  public void AddComboUnitTurnActs(BattleUnit turnUnit, int actionNum) { } */
    AddComboUnitTurnActs(turnUnit: BattleUnit, actionNum: int): void {
        const begin = new TurnBeginAct().ctor();
        begin.actUnitId = turnUnit.Id;
        begin.actUnitTeam = turnUnit.Team;
        begin.id = this.GetNewActId();
        this.AddActToListAndSort(begin);
        for (let step = 1; step <= actionNum; step++) {
            const combo = new ComboTurnUnitAct().ctor();
            combo.actUnitId = turnUnit.Id;
            combo.actUnitTeam = turnUnit.Team;
            combo.ActionStep = step;
            combo.id = this.GetNewActId();
            this.AddActToListAndSort(combo);
        }
        const end = new TurnEndAct().ctor();
        end.actUnitId = turnUnit.Id;
        end.actUnitTeam = turnUnit.Team;
        end.id = this.GetNewActId();
        this.AddActToListAndSort(end);
    }
    /** @rva 0x18E8BD0  public void AddAct(SpecialAttackAct act) { } */
    AddAct$SpecialAttackAct(act: SpecialAttackAct): void {
        act.id = this.GetNewActId();
        // an interruptible current act goes back to the front of its priority group; the ultimate runs now
        if (ActReferee.CanBeInterruptedBySpecialAttackAct(this.currentAct, act.actUnitTeam)) {
            this.AddActToListAndSort(this.currentAct, true);
            this.currentAct = act;
            return;
        }
        this.AddActToListAndSort(act);
    }
    /** @rva 0x18E8C50  public void AddAct(ActBase act) { } */
    AddAct$ActBase(act: ActBase): void {
        act.id = this.GetNewActId();
        this.AddActToListAndSort(act);
    }
    /** @rva 0x18E9600  public bool RemoveUnitSpecialAttackAct(int unitId) { } */
    RemoveUnitSpecialAttackAct(unitId: int): boolean {
        if (this.currentAct instanceof SpecialAttackAct && this.currentAct.actUnitId === unitId) {
            this.currentAct = null!;
            return true;
        }
        return removeAll(this.actList, act => act instanceof SpecialAttackAct && act.actUnitId === unitId) > 0;
    }
    /** @rva 0x18E9AD0  public void UpdateActOrder(List<BattleUnit> activeUnitList) { } */
    UpdateActOrder(activeUnitList: List<BattleUnit>): void {
        // <UpdateActOrder>b__0 0x1903c70: drop acts of units that left, ultimates whose gauge is no longer full,
        // and additional skills aimed at a unit that left
        removeAll(this.actList, act => {
            const unit = activeUnitList.find(u => u.Id === act.actUnitId) ?? null;
            if (unit == null) return true;
            if (act instanceof SpecialAttackAct && !unit.IsSpecialAttackPointMax()) return true;
            const additional = act instanceof AdditionalSkillAct ? act : null;
            if (additional != null && additional.targetUnitId > 0 && !activeUnitList.some(u => u.Id === additional.targetUnitId)) return true;
            return false;
        });
    }
    /** @rva 0x18E9240  public List<ActOrderUnitInfo> GetActOrderUnitInfoList() { } */
    GetActOrderUnitInfoList(): List<ActOrderUnitInfo> {
        return [this.currentAct, ...this.actList].map(act => new ActOrderUnitInfo().ctor$ActBase(act));
    }
    /** @rva 0x18E93B0  public List<ActBase> GetTurnActList() { } */
    GetTurnActList(): List<ActBase> {
        const list = [...this.turnActHistory];
        list.push(this.currentAct);
        list.push(...this.actList);
        return list;
    }
    /** @rva 0x18E89F0  private void AddActToListAndSort(ActBase newAct, bool isAddAtFrontIfSamePriority = False) { } */
    AddActToListAndSort(newAct: ActBase, isAddAtFrontIfSamePriority: boolean = false): void {
        if (this.actList.length === 0) {
            this.actList.push(newAct);
            return;
        }
        const specialAttackAct = newAct instanceof SpecialAttackAct ? newAct : null;
        const priority = newAct.Priority;
        let index = 0;
        // list is kept in descending priority; a new act goes after the acts of the same priority unless it is an
        // ultimate that may interrupt that act, or isAddAtFrontIfSamePriority
        while (index < this.actList.length) {
            const act = this.actList[index];
            if (act.Priority <= priority && (act.Priority < priority
                || (specialAttackAct != null && ActReferee.CanBeInterruptedBySpecialAttackAct(act, newAct.actUnitTeam))
                || isAddAtFrontIfSamePriority)) break;
            index++;
        }
        this.actList.splice(index, 0, newAct);
    }
    /** @rva 0x18E9040  private static bool CanBeInterruptedBySpecialAttackAct(ActBase checkAct, BattleUnit.TeamType specialAttackUnitTeam) { } */
    static CanBeInterruptedBySpecialAttackAct(checkAct: ActBase, specialAttackUnitTeam: BattleUnit_TeamType): boolean {
        if (!(checkAct instanceof SkillDecisionActBase) || checkAct.IsDecided) return false;
        if (!checkAct.IsCanInterrupt) return false;
        if (checkAct instanceof AdditionalTurnUnitAct) return false;
        if (!(checkAct instanceof TurnUnitAct) || checkAct.actUnitTeam === specialAttackUnitTeam) return true;
        if (checkAct instanceof ComboTurnUnitAct) return checkAct.ActionStep > 1;
        return false;
    }
    /** @rva 0x18E93A0  private int GetNewActId() { } */
    GetNewActId(): int {
        return ++this.lastActId;
    }
    /** @rva 0x18E94C0  public bool IsUnitSpecialAttackActRegistered(int unitId) { } */
    IsUnitSpecialAttackActRegistered(unitId: int): boolean {
        if (this.currentAct instanceof SpecialAttackAct && this.currentAct.actUnitId === unitId) return true;
        return this.actList.some(act => act instanceof SpecialAttackAct && act.actUnitId === unitId);
    }
    /** @rva 0x18E8F30  public static bool CanBeInterruptedByAutoSpecialAttack(ActBase checkAct, BattleUnit.TeamType specialAttackUnitTeam) { } */
    static CanBeInterruptedByAutoSpecialAttack(checkAct: ActBase, specialAttackUnitTeam: BattleUnit_TeamType): boolean {
        if (checkAct.Priority < ActBase_Define.DefaultPriority) return true;
        if (checkAct instanceof TurnUnitAct && checkAct.actUnitTeam === specialAttackUnitTeam) return true;
        return checkAct instanceof ReActionTurnUnitAct;
    }
    /** @rva -1  public bool HasUnitTargetActAllTime<TAct>(int unitId) { } */
    HasUnitTargetActAllTime<TAct>(TAct$: abstract new (...args: any[]) => TAct, unitId: int): boolean {
        // IsUnitTargetAct<TAct>(currentAct, unitId) inlined in the game
        if (ActReferee.IsUnitTargetAct(TAct$, this.currentAct, unitId)) return true;
        return this.actList.some(act => ActReferee.IsUnitTargetAct(TAct$, act, unitId)) // <>c__DisplayClass19_0.b__0
            || this.turnActHistory.some(act => ActReferee.IsUnitTargetAct(TAct$, act, unitId)); // b__1
    }
    /** @rva -1  private static bool IsUnitTargetAct<TAct>(ActBase actBase, int unitId) { } */
    static IsUnitTargetAct<TAct>(TAct$: abstract new (...args: any[]) => TAct, actBase: ActBase, unitId: int): boolean {
        // `actBase is TAct t && t.actUnitId == unitId` (the game compares actUnitId at 0x14)
        if (!(actBase instanceof TAct$)) return false;
        return actBase.actUnitId === unitId;
    }
    /** @rva 0x18E9740  public void SetRandomTarget(List<BattleUnit> targetUnitList, Dictionary<int, BattleUnit> battleUnitDic) { } */
    SetRandomTarget(targetUnitList: List<BattleUnit>, battleUnitDic: Dictionary<int, BattleUnit>): void {
        for (const act of this.actList) {
            const unit = battleUnitDic.get(act.targetUnitId);
            if (unit === undefined || unit.IsDead) {
                act.targetUnitId = orderByNewGuid(targetUnitList, "target", [act])[0].Id; // OrderBy(_ => Guid.NewGuid()).First()
            }
        }
    }
    /** @rva 0x18E9BB0  public void .ctor() { } */
    ctor(): this {
        this.actList = [];
        this.turnActHistory = [];
        return this;
    }
}
