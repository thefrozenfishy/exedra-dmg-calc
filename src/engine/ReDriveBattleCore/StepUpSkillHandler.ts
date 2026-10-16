// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { SwitchSkillUnitState } from "./UnitState/SwitchSkillUnitState";
import { dictGet, isImpl, ref } from "./../runtime";
import { BarrierUnitState } from "./UnitState/BarrierUnitState";
import { CharacterParameter } from "./CharacterParameter";
import { ActiveSkill } from "./ActiveSkill";
import { CommandStepUpSkill } from "./Command/CommandStepUpSkill";
import { StepUpSkillUnitState } from "./UnitState/StepUpSkillUnitState";
import { notPorted } from "../runtime";
import type { List, Ref, int } from "../runtime";

import { ActiveSkillBase } from "./ActiveSkillBase";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { StepUpSkillRequest } from "./Request/StepUpSkillRequest";
import type { SpReferee } from "./SpReferee";

// ---- ReDriveBattleCore.StepUpSkillHandler  (TypeDefIndex 473, public static class) ----
export class StepUpSkillHandler {
    /** @rva 0x15E4E00  public static void HandleRequest(GameDirectorBase gameDirector, StepUpSkillRequest request) { } */
    static HandleRequest(gameDirector: GameDirectorBase, request: StepUpSkillRequest): void {
        const unit = gameDirector.get_battleUnitDic().get(request.battleUnitId); // <>c__DisplayClass0_0.unit
        if (unit === undefined) return; // TryGetValue
        const stepUpStateList = StepUpSkillHandler.GetActiveStepUpStateList(unit);
        if (stepUpStateList.length === 0) {
            const sp = gameDirector.spReferee.GetSp(unit._Team);
            const cmd = new CommandStepUpSkill().ctor();
            cmd._UnitId = unit._Id; cmd._SkillMstId = 0; cmd._Sp = sp; cmd._IsSucceeded = false;
            cmd._StepLevel = 0; cmd._ExpectedConsumeSp = 0; cmd._CanStepUpFurther = false;
            gameDirector.StoreCommand(cmd);
            return;
        }
        const initial = StepUpSkillHandler.ResolveInitialActiveSkill(unit); // inlined in the game
        const initialSkillMstId = initial == null ? 0 : initial._Id;
        let currentStepLevel = 0;
        if (request.isCanceled) {
            // back to the plain skill: step 0, its own SP
            const consumeSp = initial == null ? 0 : initial._ConsumeSP;
            const canFurther = StepUpSkillHandler.TryEvaluateNextStepUp(unit, stepUpStateList, 0, gameDirector.spReferee, ref<int>(0), ref<int>(0));
            StepUpSkillHandler.EmitResult(gameDirector, unit, initialSkillMstId, true, 0, consumeSp, canFurther);
            return;
        }
        const currentSkillMstId = request.currentSkillMstId;
        let found = currentSkillMstId === initialSkillMstId;
        if (!found) {
            const s = stepUpStateList.find(s => s.GetSkillMstId$BattleUnit(unit) === currentSkillMstId) ?? null; // <>c__DisplayClass0_0.<HandleRequest>b__0
            if (s != null) { currentStepLevel = s.stepLevel; found = true; }
        }
        if (found) {
            const nextSkillMstId = ref<int>(0), expectedConsumeSp = ref<int>(0);
            if (StepUpSkillHandler.TryEvaluateNextStepUp(unit, stepUpStateList, currentStepLevel, gameDirector.spReferee, nextSkillMstId, expectedConsumeSp)) {
                const nextStepLevel = currentStepLevel + 1;
                const canFurther = StepUpSkillHandler.TryEvaluateNextStepUp(unit, stepUpStateList, nextStepLevel, gameDirector.spReferee, ref<int>(0), ref<int>(0));
                StepUpSkillHandler.EmitResult(gameDirector, unit, nextSkillMstId.v, true, nextStepLevel, expectedConsumeSp.v, canFurther);
                return;
            }
        }
        StepUpSkillHandler.EmitResult(gameDirector, unit, currentSkillMstId, false, 0, 0, false);
    }
    /** @rva 0x15E4900  public static int CalcStepUpTotalConsumeSp(int baseConsumeSp, int stepLevel) { } */
    static CalcStepUpTotalConsumeSp(baseConsumeSp: int, stepLevel: int): int {
        return baseConsumeSp + stepLevel;
    }
    /** @rva 0x15E4AB0  public static int GetActiveStepUpLevel(BattleUnit unit, int skillMstId) { } */
    static GetActiveStepUpLevel(unit: BattleUnit, skillMstId: int): int {
        if (unit == null || unit.Condition == null) return 0;
        const s = unit.Condition.StateList.filter(x => x instanceof StepUpSkillUnitState) as StepUpSkillUnitState[]; // OfType
        // Where(<>c__DisplayClass2_0.b__0: active and giving this skill).Select(<>c.b__2_1: stepLevel).FirstOrDefault()
        const hit = s.find(x => x.IsActive$BattleUnit(unit) && x.GetSkillMstId$BattleUnit(unit) === skillMstId);
        return hit === undefined ? 0 : hit.stepLevel;
    }
    /** @rva 0x15E4910  public static bool CanStepUpFromLevel(BattleUnit unit, int currentStepLevel, SpReferee spReferee) { } */
    static CanStepUpFromLevel(unit: BattleUnit, currentStepLevel: int, spReferee: SpReferee): boolean {
        const list = StepUpSkillHandler.GetActiveStepUpStateList(unit);
        if (list.length === 0) return false;
        return StepUpSkillHandler.TryEvaluateNextStepUp(unit, list, currentStepLevel, spReferee, ref<int>(0), ref<int>(0));
    }
    /** @rva 0x15E5C00  public static bool TrySelectStepUpActiveSkills(BattleUnit actUnit, GameDirectorBase gameDirector, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList, out ActiveSkill[] activeSkills) { } */
    static TrySelectStepUpActiveSkills(actUnit: BattleUnit, gameDirector: GameDirectorBase, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>, activeSkills: Ref<ActiveSkill[]>): boolean {
        activeSkills.v = null!;
        if (!StepUpSkillHandler.ShouldUseStepUpSkillByRole(actUnit, opponentUnitList, friendUnitList)) return false;
        const states = (actUnit.Condition.StateList.filter(x => x instanceof StepUpSkillUnitState) as StepUpSkillUnitState[])
            .filter(s => s.IsActive$BattleUnit(actUnit) && 0 < s.GetSkillMstId$BattleUnit(actUnit)); // <>c__DisplayClass4_0.b__0
        // the chain of steps 1, 2, 3... without gaps
        const ordered: List<StepUpSkillUnitState> = [];
        let level = 1; // <>c__DisplayClass4_1
        let s = states.find(x => x.stepLevel === level) ?? null; // b__1
        while (s != null) { ordered.push(s); level = level + 1; s = states.find(x => x.stepLevel === level) ?? null; }
        if (ordered.length === 0) return false;
        const sp = gameDirector.spReferee.GetSp(actUnit._Team);
        // highest affordable step first
        for (let i = ordered.length - 1; i >= 0; i--) {
            const st = ordered[i]; // <>c__DisplayClass4_2
            const stepUpSkills = actUnit._SkillSet == null ? null : actUnit._SkillSet._StepUpSkills;
            if (stepUpSkills == null) continue;
            const skill = (stepUpSkills.filter(x => x instanceof ActiveSkill) as ActiveSkill[]).find(x => x._Id === st.GetSkillMstId$BattleUnit(actUnit)) ?? null; // b__2
            if (skill == null) continue;
            if (sp < skill._ConsumeSP + st.stepLevel) continue;
            activeSkills.v = [skill];
            return true;
        }
        return false;
    }
    /** @rva 0x15E5260  private static bool ShouldUseStepUpSkillByRole(BattleUnit actUnit, List<BattleUnit> opponentUnitList, List<BattleUnit> friendUnitList) { } */
    static ShouldUseStepUpSkillByRole(actUnit: BattleUnit, opponentUnitList: List<BattleUnit>, friendUnitList: List<BattleUnit>): boolean {
        const p = actUnit.BattleParameter;
        if (!(p instanceof CharacterParameter)) return false;
        switch (p._Role as int) {
            case 1: // Attacker: an enemy is broken
                return opponentUnitList.some(u => !u.get_IsDead() && u._BreakPoint.maxPointValue >= 1 && u._BreakPoint.PointValue < 1); // <>c.b__5_0 (IsBreak inlined)
            case 2: // Breaker: an enemy is not broken yet
                return opponentUnitList.some(u => !u.get_IsDead() && !u._BreakPoint.get_IsBreak()); // <>c.b__5_1
            case 3: // Healer: an ally is under half HP
                return friendUnitList.some(u => !u.get_IsDead() && u._HP * 2 < u._MaxHP); // <>c.b__5_8
            case 4: // Buffer: one of its own buffs on an ally runs out this turn
                return friendUnitList.filter(u => !u.get_IsDead()).flatMap(u => u.Condition.StateList) // b__5_2, b__5_3
                    .some(s => isImpl(s, "IBuff") && s.UserUnitId === actUnit._Id && s.RemainingTurn === 1); // <>c__DisplayClass5_0.b__4
            case 5: // Debuffer: one of its own debuffs on an enemy runs out this turn
                return opponentUnitList.filter(u => !u.get_IsDead()).flatMap(u => u.Condition.StateList) // b__5_5, b__5_6
                    .some(s => isImpl(s, "IDebuff") && s.UserUnitId === actUnit._Id && s.RemainingTurn === 1); // b__7
            case 6: // Defender: an ally has no barrier
                return friendUnitList.some(u => !u.get_IsDead() && u.Condition.GetUnitStateList<BarrierUnitState>(BarrierUnitState).length === 0); // <>c.b__5_9
            default:
                return false;
        }
    }
    /** @rva 0x15E51C0  private static ActiveSkillBase ResolveInitialActiveSkill(BattleUnit unit) { } */
    static ResolveInitialActiveSkill(unit: BattleUnit): ActiveSkillBase {
        const skill = ref<ActiveSkillBase>(null!);
        const state = ref<SwitchSkillUnitState>(null!);
        if (unit.IsSwitchingActiveSkill<ActiveSkillBase>(ActiveSkillBase, skill, state)) return skill.v;
        if (unit._SkillSet != null && unit._SkillSet._ActiveSkills != null) return unit._SkillSet._ActiveSkills[0] ?? null!; // FirstOrDefault
        return null!;
    }
    /** @rva 0x15E4CE0  private static List<StepUpSkillUnitState> GetActiveStepUpStateList(BattleUnit unit) { } */
    static GetActiveStepUpStateList(unit: BattleUnit): List<StepUpSkillUnitState> {
        return unit.Condition.GetUnitStateList<StepUpSkillUnitState>(StepUpSkillUnitState)
            .filter(s => s.IsActive$BattleUnit(unit) && 0 < s.GetSkillMstId$BattleUnit(unit)); // <>c__DisplayClass7_0.b__0
    }
    /** @rva 0x15E5A20  private static bool TryEvaluateNextStepUp(BattleUnit unit, List<StepUpSkillUnitState> stepUpStateList, int currentStepLevel, SpReferee spReferee, out int nextSkillMstId, out int expectedConsumeSp) { } */
    static TryEvaluateNextStepUp(unit: BattleUnit, stepUpStateList: List<StepUpSkillUnitState>, currentStepLevel: int, spReferee: SpReferee, nextSkillMstId: Ref<int>, expectedConsumeSp: Ref<int>): boolean {
        nextSkillMstId.v = 0;
        expectedConsumeSp.v = 0;
        const nextStepLevel = currentStepLevel + 1; // <>c__DisplayClass8_0
        const s = stepUpStateList.find(x => x.stepLevel === nextStepLevel) ?? null; // b__0
        if (s == null) return false;
        const id = s.GetSkillMstId$BattleUnit(unit);
        if (!(0 < id)) return false;
        const stepUpSkills = unit._SkillSet == null ? null : unit._SkillSet._StepUpSkills;
        if (stepUpSkills == null) return false;
        const skill = stepUpSkills.find(x => x._Id === id) ?? null; // b__1
        if (skill == null) return false;
        // the stepped skill's own SP plus 1 per step
        const consumeSp = skill._ConsumeSP + nextStepLevel;
        if (consumeSp <= spReferee.GetSp(unit._Team)) {
            nextSkillMstId.v = id;
            expectedConsumeSp.v = consumeSp;
            return true;
        }
        return false;
    }
    /** @rva 0x15E49C0  private static void EmitResult(GameDirectorBase gameDirector, BattleUnit unit, int skillMstId, bool isSucceeded, int stepLevel, int expectedConsumeSp, bool canStepUpFurther) { } */
    static EmitResult(gameDirector: GameDirectorBase, unit: BattleUnit, skillMstId: int, isSucceeded: boolean, stepLevel: int, expectedConsumeSp: int, canStepUpFurther: boolean): void {
        const sp = gameDirector.spReferee.GetSp(unit._Team);
        const cmd = new CommandStepUpSkill().ctor();
        cmd._UnitId = unit._Id;
        cmd._StepLevel = stepLevel;
        cmd._ExpectedConsumeSp = expectedConsumeSp;
        cmd._SkillMstId = skillMstId;
        cmd._Sp = sp;
        cmd._IsSucceeded = isSucceeded;
        cmd._CanStepUpFurther = canStepUpFurther;
        gameDirector.StoreCommand(cmd);
    }
}
