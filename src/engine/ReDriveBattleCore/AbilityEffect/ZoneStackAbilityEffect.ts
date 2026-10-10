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

// ---- ReDriveBattleCore.AbilityEffect.ZoneStackAbilityEffect  (TypeDefIndex 1235, public class) ----
export class ZoneStackAbilityEffect extends AbilityEffectBase {
    /** 0x60 private int initialZoneStack */
    initialZoneStack: int = 0;
    /** 0x64 private int maxZoneStack */
    maxZoneStack: int = 0;
    /** private const int MaxZoneStack */
    static readonly MaxZoneStack: int = 3;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("ZoneStackAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18ECBB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ZoneStackAbilityEffect..ctor", 0x18ECBB0); }
    /** @rva 0x1906D60 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("ZoneStackAbilityEffect.Triggering", 0x1906D60); }
    /** @rva 0x1906920 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("ZoneStackAbilityEffect.GetAIFilteredTargets", 0x1906920); }
    /** @rva 0x1906BA0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("ZoneStackAbilityEffect.SelectTargetInAIAction", 0x1906BA0); }
}
