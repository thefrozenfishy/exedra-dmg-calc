// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { List, int } from "../../runtime";
import { BattleMstReaderBase } from "../Reader/BattleMstReaderBase";
import { SkillMstModel } from "../Model/SkillMstModel";
import type { SkillMstRecord } from "../../Network/Definition/Skill/SkillMstRecord";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AbilityEffectBase_TargetSideType } from "../AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { ILvUp, ILvUp_LvUpType } from "./ILvUp";
import type { INeutralState } from "./INeutralState";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { UniqueLvUnitStateBase } from "./UniqueLvUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueElementDriveUnitState  (TypeDefIndex 702, public class) ----
// "Element Drive" (3.24.0, effect type UNIQUE_ELEMENT_DRIVE, replaces UNIQUE_ELEMENT_BREAK): a levelled state on an
// enemy that only the giver's Special Attacks of the matching element level up (+roleBonusExp on a role match, else +1).
export class UniqueElementDriveUnitState extends UniqueLvUnitStateBase {  // implements ILvUp, INeutralState, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['ILvUp', 'INeutralState', 'IRequiredStateForDecide'];
    /** 0xB0 private int roleBonusExp */
    roleBonusExp: int = 0;
    /** private const int DefaultGainExp */
    static readonly DefaultGainExp: int = 1;
    get INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return this.get_INeutralState$TargetSide(); }
    get INeutralState$DontRemoveOnPassiveSkillUserLeaveBattle(): boolean { return this.get_INeutralState$DontRemoveOnPassiveSkillUserLeaveBattle(); }
    get INeutralState$DontRemoveOnUserUnitDeath(): boolean { return this.get_INeutralState$DontRemoveOnUserUnitDeath(); }
    get TargetLvUpType(): ILvUp_LvUpType { return this.get_TargetLvUpType(); }
    /** @rva 0x7E7AD0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 2 as UnitStateBase_DirectionType; /* asm: mov eax, 2; ret (Neutral) */ }
    /** @rva 0x75FB30 slot 32  private AbilityEffectBase.TargetSideType ReDriveBattleCore.UnitState.INeutralState.get_TargetSide() { } */
    get_INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return 1 as AbilityEffectBase_TargetSideType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x775830 slot 33  private bool ReDriveBattleCore.UnitState.INeutralState.get_DontRemoveOnPassiveSkillUserLeaveBattle() { } */
    get_INeutralState$DontRemoveOnPassiveSkillUserLeaveBattle(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x775830 slot 34  private bool ReDriveBattleCore.UnitState.INeutralState.get_DontRemoveOnUserUnitDeath() { } */
    get_INeutralState$DontRemoveOnUserUnitDeath(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x1727030  protected void .ctor() { } */
    ctor(): this {
        super.ctor(); // UniqueLvUnitStateBase..ctor (same RVA)
        return this;
    }
    /** @rva 0x1727050  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info); // Lv = 1, iconName = "", UnitStateBase..ctor, pattern = EffectValue1, level group = EffectValue2 (inlined in the game)
        this.roleBonusExp = info._EffectValue3;
        return this;
    }
    /** @rva 0x7E7AD0 slot 30  public ILvUp.LvUpType get_TargetLvUpType() { } */
    get_TargetLvUpType(): ILvUp_LvUpType { return 2 as ILvUp_LvUpType; /* asm: mov eax, 2; ret (AfterActiveSkill) */ }
    /** @rva 0x1726ED0 slot 31  public void LvUpProcess(BattleUnit userUnit, BattleUnit targetUnit, int skillMstId) { } */
    LvUpProcess(userUnit: BattleUnit, targetUnit: BattleUnit, skillMstId: int): void {
        const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(skillMstId); // IBattleMstReader slot 0
        if (skillMst == null) return;
        if ((skillMst.Type as number) !== 2) return; // SpecialAttack only (record +0x30)
        if (!userUnit.IsMatch$TargetElementType(this._TargetElement)) return;
        let exp: int;
        if (!userUnit.IsMatch$TargetRoleType(this._TargetRole)) {
            exp = UniqueElementDriveUnitState.DefaultGainExp;
        } else {
            exp = this.roleBonusExp;
            if (exp < 1) return;
        }
        do { // the game's loop runs exp times (do/while on a positive count)
            this.TryCountUp();
            exp--;
        } while (exp !== 0);
    }
    /** @rva 0x1726B50 slot 21  public override bool CanAddTo(BattleUnit unit) { } */
    CanAddTo(unit: BattleUnit): boolean {
        // <>c__DisplayClass15_0 { unit }
        const states = unit.Condition.StateList.filter((s): s is UniqueElementDriveUnitState => s instanceof UniqueElementDriveUnitState) // OfType
            .filter(state => state.IsActive$BattleUnit(unit)); // <CanAddTo>b__0, ToList
        if (states.length === 0) return true; // !Any()
        return states[0]._UserUnitId === this._UserUnitId; // First()
    }
    /** @rva 0x1726CE0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        return targetUnitList
            .filter(unit => !unit.get_IsDead()) // <>c.b__16_0
            .filter(unit => !unit.Condition.StateList // <>c.b__16_1
                .filter((s): s is UniqueElementDriveUnitState => s instanceof UniqueElementDriveUnitState)
                .some(state => state.IsActive$BattleUnit(unit))); // <>c__DisplayClass16_0.b__2
    }
}
