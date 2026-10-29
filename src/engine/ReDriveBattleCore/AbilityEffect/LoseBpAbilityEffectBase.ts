// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.LoseBpAbilityEffectBase  (TypeDefIndex 1147, public abstract class) ----
export abstract class LoseBpAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected int losePoint */
    losePoint: int = 0;
    /** 0x64 protected readonly int effectValue */
    effectValue: int = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x191A980  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.effectValue = info._EffectValue1;
        return this;
    }
    /** @rva -1 slot 8  public abstract int GetLosePoint(BattleUnit targetUnit); */
    abstract GetLosePoint(targetUnit: BattleUnit): int;
    /** @rva 0x191A720 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            this.losePoint = this.GetLosePoint(targetUnit);
            targetUnit.AddBP(-this.losePoint);
            affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByOneState(targetUnitId, "eff_cmn_act_debuff_appear_001"));
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x191A1B0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__6_0
        if (list.length > 0) {
            list = list.filter(u => u._MaxBP > 0).filter(u => u._BP > 0); // <>c.b__6_1, b__6_2
        }
        return list;
    }
    /** @rva 0x191A4A0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__7_0
        const funcList = [AISkillTargetSelector.UnitFilterByBreak];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
}
