// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, Dictionary, List, float, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.RecoveryHpAbilityEffectBase  (TypeDefIndex 1197, public abstract class) ----
export abstract class RecoveryHpAbilityEffectBase extends AbilityEffectBase {
    /** 0x0 private static readonly float MaxHpRateToUseSpecialAttackWithHpRecoveryEffect */
    static MaxHpRateToUseSpecialAttackWithHpRecoveryEffect: float = 0;
    /** 0x4 private static readonly float MaxHpRateToUseActiveSkillWithHpRecoveryEffect */
    static MaxHpRateToUseActiveSkillWithHpRecoveryEffect: float = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("RecoveryHpAbilityEffectBase..ctor", 0x18EB3C0); }
    /** @rva 0x18FD8C0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RecoveryHpAbilityEffectBase..ctor", 0x18FD8C0); }
    /** @rva 0x18FDF60 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("RecoveryHpAbilityEffectBase.Triggering", 0x18FDF60); }
    /** @rva -1 slot 8  public abstract Decimal GetBaseRecoveryValue(BattleUnit userUnit); */
    abstract GetBaseRecoveryValue(userUnit: BattleUnit): Decimal;
    /** @rva 0x18FD8E0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("RecoveryHpAbilityEffectBase.GetAIFilteredTargets", 0x18FD8E0); }
    /** @rva 0x18FDC50 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("RecoveryHpAbilityEffectBase.SelectTargetInAIAction", 0x18FDC50); }
    /** @rva 0x18FE370  private static void .cctor() { } */
    static cctor(): void { return notPorted("RecoveryHpAbilityEffectBase..cctor", 0x18FE370); }
}
