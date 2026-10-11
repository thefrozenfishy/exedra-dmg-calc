// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";
import { EnemyAppearanceGameDirectorBase } from "../EnemyAppearanceGameDirectorBase";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

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
    ctor(): this {
        this._SummonIdList = [];
        super.ctor();
        return this;
    }
    /** @rva 0x1902F20  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._SummonIdList = [];
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        const ids: int[] = [info._EffectValue1, info._EffectValue2, info._EffectValue3, info._EffectValue4, info._EffectValue5];
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== 0) this._SummonIdList.push(ids[i]);
        }
        return this;
    }
    /** @rva 0x1902C60 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        if (gameDirector instanceof EnemyAppearanceGameDirectorBase) {
            for (const unit of gameDirector.GetSummonedUnitList(this._SummonIdList)) {
                const notice = new AffectedUnitNotice().ctor$int(unit._Id);
                notice._IsSummoned = true; // 0x42
                affectedUnitNoticeBundle.Add(notice);
            }
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1902AD0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        if (SummonAbilityEffect.NotTriggeringUnitCountForAI <= targetUnitList.filter(u => !u.get_IsDead()).length /* <>c.b__9_0 */) {
            return [];
        }
        return targetUnitList;
    }
    /** @rva 0x1902E70  private static void .cctor() { } */
    static cctor(): void {
        SummonAbilityEffect.NotTriggeringUnitCountForAI = 5;
        SummonAbilityEffect.PriorityPositionIds = [3, 2, 4, 1, 5]; // <PrivateImplementationDetails> 79C1DCEC… (global-metadata 0x100C440)
    }
}

SummonAbilityEffect.cctor(); // C# static constructor
