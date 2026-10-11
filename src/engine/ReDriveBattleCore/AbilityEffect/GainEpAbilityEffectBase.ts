// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { BpCharger } from "../BpCharger";
import { EpCharger } from "../EpCharger";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, float, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.GainEpAbilityEffectBase  (TypeDefIndex 1185, public abstract class) ----
export abstract class GainEpAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected float gainPoint */
    gainPoint: float = 0;
    /** 0x64 protected readonly int effectValue */
    effectValue: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18F20E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.effectValue = info._EffectValue1;
        return this;
    }
    /** @rva -1 slot 8  public abstract float GetGainPoint(BattleUnit targetUnit); */
    abstract GetGainPoint(targetUnit: BattleUnit): float;
    /** @rva 0x18F3300 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            this.gainPoint = this.GetGainPoint(targetUnit);
            EpCharger.ChargeByEpAbilityEffect(this.gainPoint, targetUnit);
            BpCharger.ChargeByEpAbilityEffect(targetUnit);
            affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByOneState(targetUnitId, "eff_cmn_act_buff_appear_001"));
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x18F2B80 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__6_0
        if (list.length > 0) {
            if (this._EffectRange === -1) list = [userUnit];
            list = list.filter(u => (u._MaxEP > 0 && u._EP < u._MaxEP) || (u._MaxBP >= 1 && u._BP < u._MaxBP)); // <>c.b__6_1
        }
        return list;
    }
    /** @rva 0x18F2E20 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__7_0
        const bpUnits = candidateUnits.filter(u => u._MaxBP > 0); // <>c.b__7_1
        const epUnits = candidateUnits.filter(u => u._MaxEP > 0); // <>c.b__7_2
        let unit: BattleUnit;
        if (bpUnits.length === 0) {
            const funcList = [AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker, AISkillTargetSelector.UnitFilterWithMinEp];
            unit = AISkillTargetSelector.SelectTargetUnitInOrder(epUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        } else {
            const funcList = [AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker, AISkillTargetSelector.UnitFilterWithMinBp];
            unit = AISkillTargetSelector.SelectTargetUnitInOrder(bpUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        }
        if (unit != null) return unit._Id;
        return 0;
    }
}
