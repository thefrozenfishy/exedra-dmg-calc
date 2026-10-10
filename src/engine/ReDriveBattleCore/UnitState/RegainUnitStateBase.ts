// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable, List, float, int } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IAdditionalHpRecovery } from "./IAdditionalHpRecovery";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.RegainUnitStateBase  (TypeDefIndex 651, public abstract class) ----
export abstract class RegainUnitStateBase extends UnitStateBase {  // implements IBuff, IAdditionalHpRecovery
    static readonly __interfaces: readonly string[] = ['IBuff', 'IAdditionalHpRecovery'];
    /** 0x88 private int recoveryRatio */
    recoveryRatio: int = 0;
    /** 0x8C private int recoveryFixed */
    recoveryFixed: int = 0;
    get RecoveryRatio(): float { return this.get_RecoveryRatio(); }
    get RecoveryFixed(): int { return this.get_RecoveryFixed(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16D7AC0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("RegainUnitStateBase.get_GiveVisualEffectName", 0x16D7AC0); }
    /** @rva 0x16D7AF0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("RegainUnitStateBase.get_IconName", 0x16D7AF0); }
    /** @rva 0x15B8040  public float get_RecoveryRatio() { } */
    get_RecoveryRatio(): float { return notPorted("RegainUnitStateBase.get_RecoveryRatio", 0x15B8040); }
    /** @rva 0x9FD270  public int get_RecoveryFixed() { } */
    get_RecoveryFixed(): int { return this.recoveryFixed; /* asm: mov eax, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x16CF610  public void .ctor() { } */
    ctor(): this { return notPorted("RegainUnitStateBase..ctor", 0x16CF610); }
    /** @rva 0x15B7FD0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RegainUnitStateBase..ctor", 0x15B7FD0); }
    /** @rva 0x15B8090 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return notPorted("RegainUnitStateBase.CanAddTo", 0x15B8090); }
    /** @rva -1 slot 26  public abstract Decimal GetParameterValue(BattleUnit sourceUnit); */
    abstract GetParameterValue(sourceUnit: BattleUnit): Decimal;
    /** @rva 0x16D7320 slot 25  public Decimal GetAdditionalHpRecoveryValue(BattleUnit userUnit, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    GetAdditionalHpRecoveryValue(userUnit: BattleUnit, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): Decimal { return notPorted("RegainUnitStateBase.GetAdditionalHpRecoveryValue", 0x16D7320); }
    /** @rva 0x16D70F0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("RegainUnitStateBase.GetAIFilteredTargets", 0x16D70F0); }
    /** @rva 0x16D7780 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("RegainUnitStateBase.GetUnitFilterFuncOrder", 0x16D7780); }
    /** @rva 0x16D7950  private bool <GetAIFilteredTargets>b__17_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__17_1(unit: BattleUnit): boolean { return notPorted("RegainUnitStateBase.<GetAIFilteredTargets>b__17_1", 0x16D7950); }
}
