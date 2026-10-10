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

// ---- ReDriveBattleCore.AbilityEffect.ConsumeZoneStackAbilityEffect  (TypeDefIndex 1240, public class) ----
export class ConsumeZoneStackAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int consumeZoneStack */
    consumeZoneStack: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("ConsumeZoneStackAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18ED430  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ConsumeZoneStackAbilityEffect..ctor", 0x18ED430); }
    /** @rva 0x18ED9E0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("ConsumeZoneStackAbilityEffect.Triggering", 0x18ED9E0); }
    /** @rva 0x18ED6F0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("ConsumeZoneStackAbilityEffect.GetAIFilteredTargets", 0x18ED6F0); }
    /** @rva 0x18ED820 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("ConsumeZoneStackAbilityEffect.SelectTargetInAIAction", 0x18ED820); }
    /** @rva 0x18EDD30  internal static void <Triggering>g__RemoveAllZoneUnitState|3_0(ref ConsumeZoneStackAbilityEffect.<>c__DisplayClass3_0 ) { } */
    static $Triggering$g__RemoveAllZoneUnitState_3_0(ConsumeZoneStackAbilityEffect$c__DisplayClass3_0: any /*  */): void { return notPorted("ConsumeZoneStackAbilityEffect.<Triggering>g__RemoveAllZoneUnitState|3_0", 0x18EDD30); }
}
