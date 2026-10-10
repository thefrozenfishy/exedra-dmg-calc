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

// ---- ReDriveBattleCore.AbilityEffect.SummonAbilityEffect  (TypeDefIndex 1222, public class) ----
export class SummonAbilityEffect extends AbilityEffectBase {
    /** 0x0 private static readonly int NotTriggeringUnitCountForAI */
    static NotTriggeringUnitCountForAI: int = 0;
    /** 0x8 public static readonly int[] PriorityPositionIds */
    static PriorityPositionIds: int[] = null!;
    /** 0x60 private List<int> <SummonIdList>k__BackingField */
    _SummonIdList: List<int> = null!;
    get SummonIdList(): List<int> { return this.get_SummonIdList(); }
    set SummonIdList(v: List<int>) { this.set_SummonIdList(v); }
    /** @rva 0x737A10  public List<int> get_SummonIdList() { } */
    get_SummonIdList(): List<int> { return this._SummonIdList; /* auto-property */ }
    /** @rva 0x737A50  public void set_SummonIdList(List<int> value) { } */
    set_SummonIdList(value: List<int>): void { this._SummonIdList = value; /* auto-property */ }
    /** @rva 0x1903070  protected void .ctor() { } */
    ctor(): this { return notPorted("SummonAbilityEffect..ctor", 0x1903070); }
    /** @rva 0x1902F20  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("SummonAbilityEffect..ctor", 0x1902F20); }
    /** @rva 0x1902C60 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("SummonAbilityEffect.Triggering", 0x1902C60); }
    /** @rva 0x1902AD0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("SummonAbilityEffect.GetAIFilteredTargets", 0x1902AD0); }
    /** @rva 0x1902E70  private static void .cctor() { } */
    static cctor(): void { return notPorted("SummonAbilityEffect..cctor", 0x1902E70); }
}
