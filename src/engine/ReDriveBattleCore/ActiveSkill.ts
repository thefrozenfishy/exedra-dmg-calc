// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { StepUpSkillHandler } from "./StepUpSkillHandler";
import { BpCharger } from "./BpCharger";
import { EpCharger } from "./EpCharger";
import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";
import type { SkillMstModel } from "./Model/SkillMstModel";

// ---- ReDriveBattleCore.ActiveSkill  (TypeDefIndex 285, public class) ----
export class ActiveSkill extends ActiveSkillBase {
    /** 0x38 private int <WeightValue>k__BackingField */
    _WeightValue: int = 0;
    /** 0x3C private int <HpGaugeValue>k__BackingField */
    _HpGaugeValue: int = 0;
    get WeightValue(): int { return this.get_WeightValue(); }
    set WeightValue(v: int) { this.set_WeightValue(v); }
    get HpGaugeValue(): int { return this.get_HpGaugeValue(); }
    set HpGaugeValue(v: int) { this.set_HpGaugeValue(v); }
    /** @rva 0x75EDA0  public int get_WeightValue() { } */
    get_WeightValue(): int { return this._WeightValue; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_WeightValue(int value) { } */
    set_WeightValue(value: int): void { this._WeightValue = value; /* auto-property */ }
    /** @rva 0x8F3EF0  public int get_HpGaugeValue() { } */
    get_HpGaugeValue(): int { return this._HpGaugeValue; /* auto-property */ }
    /** @rva 0x901820  public void set_HpGaugeValue(int value) { } */
    set_HpGaugeValue(value: int): void { this._HpGaugeValue = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1386ED0  public void .ctor(int skillMstId) { } */
    ctor$int(skillMstId: int): this { super.ctor$int(skillMstId); return this; }
    /** @rva 0x1386B90  public void .ctor(int id, int uniqueId, int level, string name, int consumeSP) { } */
    ctor$int_int_int_string_int(id: int, uniqueId: int, level: int, name: string, consumeSP: int): this { super.ctor$int_int_int_string_int(id, uniqueId, level, name, consumeSP); return this; }
    /** @rva 0x1386EA0  public void .ctor(SkillMstModel skillMst, List<SkillDetailMstModel> skillDetailMstList, int weightValue = 0, int hpGaugeValue = 0) { } */
    ctor$SkillMstModel_ListSkillDetailMstModel_int_int(skillMst: SkillMstModel, skillDetailMstList: List<SkillDetailMstModel>, weightValue: int = 0, hpGaugeValue: int = 0): this {
        super.ctor$SkillMstModel_ListSkillDetailMstModel(skillMst, skillDetailMstList);
        this._HpGaugeValue = hpGaugeValue;
        this._WeightValue = weightValue;
        return this;
    }
    /** @rva 0x1386D30 slot 4  public override AffectedUnitNoticeBundle Execute(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId, bool isForcedAct = False) { } */
    Execute(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int, isForcedAct: boolean = false): AffectedUnitNoticeBundle {
        if (userUnit.Condition.CanNotUseSkill) return null!;
        if (userUnit.BreakPoint.IsBreak) return null!;
        const spReferee = gameDirector.spReferee;
        // 3.21.0: a stepped-up skill costs its own SP plus 1 per step
        const consumeSp = StepUpSkillHandler.CalcStepUpTotalConsumeSp(this.ConsumeSP, StepUpSkillHandler.GetActiveStepUpLevel(userUnit, this.Id));
        if (spReferee.GetSp(userUnit.Team) < consumeSp) return null!;
        EpCharger.ChargeByActiveSkill(userUnit);
        BpCharger.ChargeByActiveSkill(userUnit);
        spReferee.AddSp(userUnit.Team, -consumeSp);
        return this.Triggering(gameDirector, attackTargetId, userUnit, selectFriendUnitId);
    }
}
