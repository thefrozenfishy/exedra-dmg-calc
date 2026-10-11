// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.LoseEpAbilityEffectBase  (TypeDefIndex 1189, public abstract class) ----
export abstract class LoseEpAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected int losePoint */
    losePoint: int = 0;
    /** 0x64 protected readonly int effectValue */
    effectValue: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18F5990  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.effectValue = info._EffectValue1;
        return this;
    }
    /** @rva -1 slot 8  public abstract int GetLosePoint(BattleUnit targetUnit); */
    abstract GetLosePoint(targetUnit: BattleUnit): int;
    /** @rva 0x18F5F40 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("LoseEpAbilityEffectBase.Triggering", 0x18F5F40); }
    /** @rva 0x18F59D0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("LoseEpAbilityEffectBase.GetAIFilteredTargets", 0x18F59D0); }
    /** @rva 0x18F5CC0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("LoseEpAbilityEffectBase.SelectTargetInAIAction", 0x18F5CC0); }
}
