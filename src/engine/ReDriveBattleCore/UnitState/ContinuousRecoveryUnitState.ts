// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.ContinuousRecoveryUnitState  (TypeDefIndex 556, public class) ----
export class ContinuousRecoveryUnitState extends UnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** 0x0 private static readonly float MaxHpRateToUse */
    static MaxHpRateToUse: float = 0;
    /** 0x88 private float recoveryRatio */
    recoveryRatio: float = 0;
    /** 0x8C private float recoveryFixedValue */
    recoveryFixedValue: float = 0;
    get RecoveryRatio(): float { return this.get_RecoveryRatio(); }
    get RecoveryFixedValue(): float { return this.get_RecoveryFixedValue(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xC646A0  public float get_RecoveryRatio() { } */
    get_RecoveryRatio(): float { return this.recoveryRatio; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x893710  public float get_RecoveryFixedValue() { } */
    get_RecoveryFixedValue(): float { return this.recoveryFixedValue; /* asm: movss xmm0, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x15B6C10 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("ContinuousRecoveryUnitState.get_IconName", 0x15B6C10); }
    /** @rva 0x15B6BE0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("ContinuousRecoveryUnitState.get_GiveVisualEffectName", 0x15B6BE0); }
    /** @rva 0x15B3A90  public void .ctor() { } */
    ctor(): this { return notPorted("ContinuousRecoveryUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B6B80  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ContinuousRecoveryUnitState..ctor", 0x15B6B80); }
    /** @rva 0x15B6970 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("ContinuousRecoveryUnitState.GetUnitFilterFuncOrder", 0x15B6970); }
    /** @rva 0x15B65A0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("ContinuousRecoveryUnitState.GetAIFilteredTargets", 0x15B65A0); }
    /** @rva 0x15B67D0  public Decimal GetRecoveryValue(BattleUnit userUnit) { } */
    GetRecoveryValue(userUnit: BattleUnit): Decimal { return notPorted("ContinuousRecoveryUnitState.GetRecoveryValue", 0x15B67D0); }
    /** @rva 0x15B6B40  private static void .cctor() { } */
    static cctor(): void { return notPorted("ContinuousRecoveryUnitState..cctor", 0x15B6B40); }
}
