// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { ReceiveSlipDamageUnitStateBase } from "../UnitState/ReceiveSlipDamageUnitStateBase";
import { BattleDamageCalculator } from "../BattleDamageCalculator";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { DamageCategory } from "../DamageCategory";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.ImmSlipDmgAbilityEffect  (TypeDefIndex 1180, public class) ----
export class ImmSlipDmgAbilityEffect extends DamageAbilityEffectBase {
    /** @rva 0x7421D0 slot 9  protected override DamageBaseType get_DamageBaseType() { } */
    get_DamageBaseType(): DamageBaseType { return 0 as DamageBaseType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xD8FC50 slot 13  public override DamageCategory get_DamageCategory() { } */
    get_DamageCategory(): DamageCategory { return 4 as DamageCategory; /* asm: mov eax, 4; ret */ }
    /** @rva 0x1926190  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1926180  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x192A2F0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        const attackSkill = userUnit._SkillSet.GetSkill(this.skillMstId);
        if (attackSkill == null) return bundle;
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            let notice = BattleDamageCalculator.GetSlipDamageResult(targetUnit, gameDirector.get_battleUnitDic(), gameDirector.get_BattleType(), null!, true);
            if (notice == null) {
                notice = new AffectedUnitNotice().ctor$int(targetUnitId);
            } else {
                userUnit.Attack(targetUnit, notice.GetTotalDamageValue(true), gameDirector);
                notice._IsDead = targetUnit.get_IsDead();
            }
            notice._IsVisibleOnAttack = true;
            bundle.Add(notice);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
    /** @rva 0x192A0C0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__7_0
        if (list.length > 0) list = list.filter(unit => unit._Condition._StateList.some(state => state instanceof ReceiveSlipDamageUnitStateBase)); // b__7_1, b__7_2
        return list;
    }
}
