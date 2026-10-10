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

// ---- ReDriveBattleCore.AbilityEffect.GainSpFixedAbilityEffect  (TypeDefIndex 1213, public class) ----
export class GainSpFixedAbilityEffect extends AbilityEffectBase {
    /** 0x0 private static readonly int NotTriggeringSPForAI */
    static NotTriggeringSPForAI: int = 0;
    /** 0x60 protected int gainPoint */
    gainPoint: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("GainSpFixedAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18ED430  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("GainSpFixedAbilityEffect..ctor", 0x18ED430); }
    /** @rva 0x18F3A70 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("GainSpFixedAbilityEffect.Triggering", 0x18F3A70); }
    /** @rva 0x18F39A0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("GainSpFixedAbilityEffect.GetAIFilteredTargets", 0x18F39A0); }
    /** @rva 0x18F3B30  private static void .cctor() { } */
    static cctor(): void { return notPorted("GainSpFixedAbilityEffect..cctor", 0x18F3B30); }
}
