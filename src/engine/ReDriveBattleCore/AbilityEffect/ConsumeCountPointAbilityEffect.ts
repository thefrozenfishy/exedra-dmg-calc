// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CountUnitState } from "../UnitState/CountUnitState";
import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { CountPointVariationAbilityEffectBase } from "./CountPointVariationAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.ConsumeCountPointAbilityEffect  (TypeDefIndex 1169, public class) ----
export class ConsumeCountPointAbilityEffect extends CountPointVariationAbilityEffectBase {
    /** 0x60 protected int consumePoint */
    consumePoint: int = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1912D70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.consumePoint = info._EffectValue1;
        return this;
    }
    /** @rva 0x1912D60 slot 8  protected override int GetModifyCountPoint() { } */
    GetModifyCountPoint(): int { return -this.consumePoint; }
    /** @rva 0x1912B30 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__4_0
        if (list.length > 0) list = list.filter(unit => { // <>c.b__4_1
            if (!unit._Condition._StateList.some(s => s instanceof CountUnitState)) return false;
            return unit._Condition._CountPoint > 0;
        });
        return list;
    }
}
