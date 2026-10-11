// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

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
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18ED6B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.consumePoint = info._EffectValue1;
        return this;
    }
    /** @rva 0x18ED6A0 slot 8  protected override int GetModifyCountPoint() { } */
    GetModifyCountPoint(): int { return notPorted("ConsumeCountPointAbilityEffect.GetModifyCountPoint", 0x18ED6A0); }
    /** @rva 0x18ED470 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("ConsumeCountPointAbilityEffect.GetAIFilteredTargets", 0x18ED470); }
}
